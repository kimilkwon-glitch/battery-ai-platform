#!/usr/bin/env node
/**
 * 주문·결제 동시성 mock 검증 — 실제 Toss/Production DB/SOLAPI 호출 없음
 */
import { ensureTsxVerify } from "../scripts/ensure-tsx-verify.mjs";

ensureTsxVerify(import.meta.url);

await import("../scripts/register-server-only.mjs");

const {
  isCheckoutAttemptReusable,
  checkoutAttemptMemberMatches,
} = await import("../src/lib/payment/commerce-order-create-idempotency.server.ts");

const {
  validateAdminOrderStatusChange,
  assertAdminOrderNotStale,
} = await import("../src/lib/admin/commerce-admin-order-update.server.ts");

let passed = 0;
let failed = 0;

function assert(name, cond, detail = "") {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function mockOrder(overrides = {}) {
  const now = new Date().toISOString();
  return {
    orderId: "co_conc_1",
    orderNumber: "BM-TEST-0001",
    orderStatus: "payment_pending",
    paymentStatus: "pending",
    customerName: "테스트",
    customerPhone: "01012345678",
    customerType: "guest",
    productName: "배터리",
    batteryCode: "CMF80L",
    fulfillmentType: "delivery",
    returnBatteryOption: "return",
    deliveryFee: 3000,
    storeInstallDiscount: 0,
    finalAmount: 150000,
    itemsJson: [],
    priceLines: [],
    statusHistory: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/** In-memory checkout attempt store (서버 idempotency 시뮬레이션) */
function createOrderCreateStore() {
  const byAttempt = new Map();
  let seq = 0;

  return {
    async create(body, memberId) {
      const attemptId = body.checkoutAttemptId?.trim();
      if (attemptId) {
        const existing = byAttempt.get(attemptId);
        if (existing && isCheckoutAttemptReusable(existing)) {
          if (!checkoutAttemptMemberMatches(existing, memberId)) {
            return { ok: false, status: 403 };
          }
          return { ok: true, order: existing, reused: true };
        }
      }
      seq += 1;
      const order = mockOrder({
        orderId: `co_${seq}`,
        orderNumber: `BM-TEST-${String(seq).padStart(4, "0")}`,
        checkoutAttemptId: attemptId,
        userId: memberId,
        paymentStatus: "not_started",
      });
      if (attemptId) {
        if (byAttempt.has(attemptId)) {
          const raced = byAttempt.get(attemptId);
          if (raced && isCheckoutAttemptReusable(raced)) {
            return { ok: true, order: raced, reused: true };
          }
        }
        byAttempt.set(attemptId, order);
      }
      return { ok: true, order, reused: false };
    },
  };
}

console.log("verify-payment-concurrency\n");

console.log("1. 동일 checkoutAttemptId 주문 생성 2회");
const orderStore = createOrderCreateStore();
const attempt = "ca_verify_duplicate_001";
const [o1, o2] = await Promise.all([
  orderStore.create({ checkoutAttemptId: attempt }, undefined),
  orderStore.create({ checkoutAttemptId: attempt }, undefined),
]);
assert("both succeed", o1.ok && o2.ok);
assert("same orderId", o1.order.orderId === o2.order.orderId);
assert("at least one reused", o1.reused || o2.reused || o1.order.orderId === o2.order.orderId);

console.log("\n2. 회원 checkoutAttempt 격리");
const memberStore = createOrderCreateStore();
const memberAttempt = "ca_member_001";
await memberStore.create({ checkoutAttemptId: memberAttempt }, "user_a");
const foreign = await memberStore.create({ checkoutAttemptId: memberAttempt }, "user_b");
assert("other member blocked", !foreign.ok && foreign.status === 403);

console.log("\n3. 서로 다른 고객 동시 주문 (attempt 분리)");
const multiStore = createOrderCreateStore();
const [a, b] = await Promise.all([
  multiStore.create({ checkoutAttemptId: "ca_a" }, "u1"),
  multiStore.create({ checkoutAttemptId: "ca_b" }, "u2"),
]);
assert("distinct orders", a.ok && b.ok && a.order.orderId !== b.order.orderId);

console.log("\n4. 결제 완료 후 attempt 재사용 불가 (새 주문 허용)");
const completedOrder = mockOrder({
  checkoutAttemptId: "ca_done",
  paymentStatus: "completed",
  orderStatus: "payment_completed",
});
assert("completed not reusable", !isCheckoutAttemptReusable(completedOrder));

console.log("\n5. 관리자 stale update");
const staleOrder = mockOrder({ updatedAt: "2026-06-16T10:00:00.000Z" });
const stale = assertAdminOrderNotStale(staleOrder, "2026-06-16T09:00:00.000Z");
assert("stale blocked", !stale.ok && stale.code === "STALE_UPDATE");
const fresh = assertAdminOrderNotStale(staleOrder, staleOrder.updatedAt);
assert("fresh allowed", fresh.ok);

console.log("\n6. 관리자 상태 역행 차단");
const regress = validateAdminOrderStatusChange("delivered", "payment_pending");
assert("delivered→pending blocked", !regress.ok && regress.code === "STATUS_REGRESSION_BLOCKED");
const okTransition = validateAdminOrderStatusChange("payment_completed", "order_confirmed");
assert("payment_completed→order_confirmed ok", okTransition.ok);

console.log("\n7. 배송 중 취소 vs 완료 역행");
const shipCancel = validateAdminOrderStatusChange("shipping", "canceled");
assert("shipping→canceled allowed", shipCancel.ok);
const shipRegress = validateAdminOrderStatusChange("delivered", "shipping");
assert("delivered→shipping blocked", !shipRegress.ok);
const shipToConfirmed = validateAdminOrderStatusChange("shipping", "order_confirmed");
assert(
  "shipping→order_confirmed blocked",
  !shipToConfirmed.ok && shipToConfirmed.code === "STATUS_REGRESSION_BLOCKED",
);

console.log("\n8. 환불 완료 재요청 (클레임 idempotency 패턴)");
let claimStatus = "REVIEWING";
let refundCalls = 0;
async function processRefundRequest() {
  if (claimStatus === "REFUNDED") {
    return { ok: true, idempotent: true };
  }
  refundCalls += 1;
  claimStatus = "REFUNDED";
  return { ok: true, idempotent: false };
}
const r1 = await processRefundRequest();
const r2 = await processRefundRequest();
assert("first refund processed", r1.ok && !r1.idempotent);
assert("second refund idempotent", r2.ok && r2.idempotent);
assert("single refund side-effect", refundCalls === 1);

console.log("\n10. order_number UNIQUE 재시도 시뮬레이션");
const { isOrderNumberUniqueViolation, MAX_ORDER_NUMBER_CREATE_RETRIES } = await import(
  "../src/lib/payment/commerce-order-create-retry.server.ts"
);
let orderNumAttempts = 0;
async function createWithOrderNumberRetry() {
  for (let i = 0; i < MAX_ORDER_NUMBER_CREATE_RETRIES; i += 1) {
    orderNumAttempts += 1;
    if (i < MAX_ORDER_NUMBER_CREATE_RETRIES - 1) {
      const err = new Error('duplicate key value violates unique constraint "commerce_orders_order_number_key"');
      if (isOrderNumberUniqueViolation(err)) continue;
    }
    return { ok: true, orderNumber: `BM-RETRY-${i}` };
  }
  return { ok: false };
}
const retryResult = await createWithOrderNumberRetry();
assert("order_number retry succeeds", retryResult.ok);
assert("retried less than infinite", orderNumAttempts === MAX_ORDER_NUMBER_CREATE_RETRIES);

console.log("\n11. payment_key normalize");
const { normalizePaymentKey } = await import("../src/lib/payment/payment-key-normalize.server.ts");
assert("blank payment_key null", normalizePaymentKey("") === null);
assert("trim payment_key", normalizePaymentKey(" tviva_x ") === "tviva_x");

console.log("\n12. claim refund vs shipping conflict");
const { canApproveClaimRefund } = await import("../src/lib/claims/claim-transition.server.ts");
assert("shipping blocks refund", !canApproveClaimRefund("shipping"));
assert("preparing allows refund", canApproveClaimRefund("preparing"));

console.log("\n13. active payment status helper");
assert("pending reusable", isCheckoutAttemptReusable(mockOrder({ paymentStatus: "pending" })));
assert("processing reusable", isCheckoutAttemptReusable(mockOrder({ paymentStatus: "processing" })));
assert("completed not reusable", !isCheckoutAttemptReusable(mockOrder({ paymentStatus: "completed" })));

console.log(`\n---\nPassed: ${passed}, Failed: ${failed}`);
console.log("Real Toss/Production DB calls: 0");

process.exit(failed > 0 ? 1 : 0);
