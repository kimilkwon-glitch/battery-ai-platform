#!/usr/bin/env node
/**
 * 결제 confirm·webhook·reconciliation mock 검증 — 실제 Toss/SOLAPI/DB 호출 없음
 */
import { ensureTsxVerify } from "../scripts/ensure-tsx-verify.mjs";

ensureTsxVerify(import.meta.url);

await import("../scripts/register-server-only.mjs");

const {
  runCommercePaymentConfirm,
  finalizeApprovedCommercePayment,
  handleTossPaymentWebhookEvent,
  reconcileCommerceOrderPayment,
  isTossPaymentWebhookActive,
  __setConfirmStoreDepsForTests,
  __resetConfirmStoreDepsForTests,
} = await import("../src/lib/payment/commerce-payment-confirm.server.ts");

const {
  canRecordPaymentFail,
  isPaymentStatusTerminal,
} = await import("../src/lib/payment/commerce-payment-transition.server.ts");

const { createCartItemFromBattery } = await import("../src/lib/cart/cart-item-factory.ts");
const { applyPricingToCartItem } = await import("../src/lib/pricing/order-price.ts");
const { validateOrderForPayment } = await import("../src/lib/payment/validate-order-for-payment.ts");

function mockCartItem() {
  const base = createCartItemFromBattery({
    batteryCode: "CMF80L",
    brandName: "쏠라이트",
    fulfillmentMethod: "delivery",
    usedBatteryReturnOption: "return",
  });
  return applyPricingToCartItem(base, "delivery");
}

let passed = 0;
let failed = 0;
let externalFetchCalls = 0;
let alimtalkCalls = 0;
let promotionRecords = 0;

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
  const item = mockCartItem();
  const base = {
    orderId: "co_verify_1",
    orderNumber: "BM-VERIFY-0001",
    orderStatus: "payment_pending",
    paymentStatus: "pending",
    customerName: "검증고객",
    customerPhone: "01011112222",
    customerType: "guest",
    productName: "CMF80L",
    brand: "쏠라이트",
    batteryCode: "CMF80L",
    internetPrice: item.internetPrice ?? 150000,
    onsitePrice: item.onsitePrice ?? 160000,
    fulfillmentType: "delivery",
    returnBatteryOption: "return",
    deliveryFee: 3000,
    storeInstallDiscount: 0,
    promotionDiscountTotal: 0,
    finalAmount: null,
    itemsJson: [item],
    priceLines: [],
    paymentRequestId: "pr_verify_abc",
    appliedPromotions: [],
    statusHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
  const validated = validateOrderForPayment(base);
  if (validated.ok) {
    base.finalAmount = validated.finalAmount;
    base.priceLines = validated.priceLines;
    base.deliveryFee = validated.deliveryFee;
  }
  return base;
}

function payAmount(order) {
  const v = validateOrderForPayment(order);
  return v.ok ? v.finalAmount : order.finalAmount ?? 150000;
}

function createMemoryStore() {
  const orders = new Map();
  const paymentKeys = new Map();
  const promotions = new Set();
  let claimLock = Promise.resolve();

  function withClaimLock(fn) {
    const run = claimLock.then(fn);
    claimLock = run.catch(() => undefined);
    return run;
  }

  return {
    orders,
    promotions,
    paymentKeys,
    reset() {
      orders.clear();
      paymentKeys.clear();
      promotions.clear();
      claimLock = Promise.resolve();
    },
    seed(order) {
      orders.set(order.orderId, structuredClone(order));
    },
    async claimOperation({ orderId, paymentKey, paymentRequestId }) {
      return withClaimLock(async () => {
        const order = orders.get(orderId);
        if (!order) {
          return {
            ok: false,
            code: "ORDER_NOT_FOUND",
            message: "not found",
            status: 404,
          };
        }
        if (
          paymentRequestId &&
          order.paymentRequestId &&
          paymentRequestId !== order.paymentRequestId
        ) {
          return {
            ok: false,
            code: "PAYMENT_REQUEST_MISMATCH",
            message: "mismatch",
            status: 403,
          };
        }
        const foreign = paymentKeys.get(paymentKey);
        if (foreign && foreign !== orderId) {
          return {
            ok: false,
            code: "PAYMENT_KEY_BOUND_TO_OTHER_ORDER",
            message: "foreign key",
            status: 409,
          };
        }
        if (order.paymentStatus === "completed") {
          if (order.paymentKey === paymentKey) {
            return { ok: true, outcome: "idempotent_completed", order: structuredClone(order) };
          }
          return {
            ok: false,
            code: "ALREADY_PAID",
            message: "paid",
            status: 409,
          };
        }
        if (order._processingKey && order._processingKey !== paymentKey) {
          return {
            ok: false,
            code: "CONFIRM_IN_PROGRESS",
            message: "busy",
            status: 409,
          };
        }
        if (order._processingKey === paymentKey) {
          return { ok: true, outcome: "resume_processing", order: structuredClone(order) };
        }
        order._processingKey = paymentKey;
        order.paymentStatus = "processing";
        paymentKeys.set(paymentKey, orderId);
        orders.set(orderId, order);
        return {
          ok: true,
          outcome: "claimed",
          order: structuredClone(order),
          previousPaymentStatus: "pending",
        };
      });
    },
    async finalizeAtomically({ orderId, paymentKey, approved, statusNote }) {
      const order = orders.get(orderId);
      if (!order) return { ok: false, code: "ORDER_NOT_FOUND", message: "nf" };
      if (order.paymentStatus === "completed") {
        return {
          ok: true,
          order: structuredClone(order),
          transitioned: false,
          alreadyCompleted: true,
        };
      }
      if (order._finalizeFailOnce) {
        order._finalizeFailOnce = false;
        return { ok: false, code: "FINALIZE_FAILED", message: "db fail" };
      }
      order.paymentStatus = "completed";
      order.orderStatus = "payment_completed";
      order.paymentKey = paymentKey;
      order.paidAmount = approved.totalAmount;
      order._statusLogs = (order._statusLogs ?? 0) + 1;
      order._lastNote = statusNote;
      orders.set(orderId, order);
      return {
        ok: true,
        order: structuredClone(order),
        transitioned: true,
        alreadyCompleted: false,
      };
    },
    async markReconcileNeeded({ orderId, note }) {
      const order = orders.get(orderId);
      if (!order) return { ok: false, code: "ORDER_NOT_FOUND", message: "nf" };
      order.paymentStatus = "reconcile_needed";
      order._reconcileNote = note;
      orders.set(orderId, order);
      return { ok: true, order: structuredClone(order) };
    },
    async findOrderIdByPaymentKey(paymentKey) {
      return paymentKeys.get(paymentKey) ?? null;
    },
    getOrder(orderId) {
      const o = orders.get(orderId);
      return o ? structuredClone(o) : null;
    },
    updateOrder(orderId, patch) {
      const o = orders.get(orderId);
      if (!o) return null;
      Object.assign(o, patch);
      orders.set(orderId, o);
      return structuredClone(o);
    },
    async hasPromotionUsages(orderId) {
      return promotions.has(orderId);
    },
    async recordPromotions(rows) {
      promotionRecords += rows.length;
      promotions.add(rows[0].orderId);
    },
  };
}

function mockTossHandlers(state) {
  return {
    confirm: async (payload) => {
      externalFetchCalls += 1;
      if (state.confirmFail) {
        return { ok: false, code: "PAYMENT_FAILED", message: "fail", httpStatus: 402 };
      }
      if (state.confirmOnce && state.confirmedKeys.has(payload.paymentKey)) {
        return {
          ok: false,
          code: "ALREADY_PROCESSED_PAYMENT",
          message: "already",
          httpStatus: 400,
        };
      }
      state.confirmedKeys.add(payload.paymentKey);
      state.lastConfirmByKey = state.lastConfirmByKey ?? new Map();
      state.lastConfirmByKey.set(payload.paymentKey, payload);
      return {
        ok: true,
        paymentKey: payload.paymentKey,
        orderId: payload.orderId,
        orderName: "test",
        method: "card",
        status: "DONE",
        totalAmount: payload.amount,
        approvedAt: new Date().toISOString(),
      };
    },
    query: async (paymentKey) => {
      externalFetchCalls += 1;
      const entry =
        state.queries[paymentKey] ??
        (state.lastConfirmByKey?.get(paymentKey)
          ? {
              paymentKey,
              orderId: state.lastConfirmByKey.get(paymentKey).orderId,
              status: "DONE",
              totalAmount: state.lastConfirmByKey.get(paymentKey).amount,
            }
          : null);
      if (!entry) {
        return { ok: false, code: "NOT_FOUND", message: "nf", httpStatus: 404 };
      }
      return { ok: true, payment: entry };
    },
  };
}

function mockRequest() {
  return new Request("http://localhost/api/payments/confirm", {
    method: "POST",
    headers: { cookie: "" },
  });
}

function confirmBody(orderId, paymentKey, orderOverride) {
  const order = orderOverride ?? store.getOrder(orderId);
  return {
    orderId,
    paymentKey,
    amount: payAmount(order),
    paymentRequestId: order?.paymentRequestId ?? "pr_verify_abc",
  };
}

function installDeps(store, tossState) {
  const toss = mockTossHandlers(tossState);
  __setConfirmStoreDepsForTests({
    claimOperation: (input) => store.claimOperation(input),
    finalizeAtomically: (input) => store.finalizeAtomically(input),
    markReconcileNeeded: (input) => store.markReconcileNeeded(input),
    findOrderIdByPaymentKey: (key) => store.findOrderIdByPaymentKey(key),
    getOrder: (id) => Promise.resolve(store.getOrder(id)),
    updateOrder: (id, patch) => Promise.resolve(store.updateOrder(id, patch)),
    confirmToss: toss.confirm,
    getTossPayment: toss.query,
    hasPromotionUsages: (id) => store.hasPromotionUsages(id),
    recordPromotions: (rows) => store.recordPromotions(rows),
    onPaymentCompleted: (_order, first) => {
      if (first) alimtalkCalls += 1;
    },
  });
}

console.log("verify-payment-confirm-integration\n");

process.env.CUSTOMER_SESSION_SECRET =
  process.env.CUSTOMER_SESSION_SECRET || "verify_test_customer_session_secret_min32chars";
process.env.TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || "test_sk_verify";
process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY =
  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_verify";

const store = createMemoryStore();
const tossState = { confirmedKeys: new Set(), confirmOnce: true, confirmFail: false, queries: {} };
installDeps(store, tossState);

console.log("1. 정상 confirm");
store.reset();
alimtalkCalls = 0;
promotionRecords = 0;
externalFetchCalls = 0;
tossState.confirmedKeys.clear();
store.seed(mockOrder());
const ok1 = await runCommercePaymentConfirm({
  source: "browser",
  request: mockRequest(),
  body: confirmBody("co_verify_1", "tviva_key_1"),
});
assert("normal confirm ok", ok1.ok, ok1.ok ? "" : ok1.message);
assert("alimtalk once", alimtalkCalls === 1);
assert("promotion once", promotionRecords === 0);

console.log("\n2. 동일 confirm 재시도 (idempotent)");
alimtalkCalls = 0;
promotionRecords = 0;
const ok2 = await runCommercePaymentConfirm({
  source: "browser",
  request: mockRequest(),
  body: confirmBody("co_verify_1", "tviva_key_1"),
});
assert("retry ok", ok2.ok && ok2.data?.alreadyConfirmed);
assert("no duplicate alimtalk", alimtalkCalls === 0);

console.log("\n3. 동시 confirm 2개");
store.reset();
tossState.confirmedKeys.clear();
store.seed(mockOrder());
const concurrent = await Promise.all([
  runCommercePaymentConfirm({
    source: "browser",
    request: mockRequest(),
    body: confirmBody("co_verify_1", "tviva_key_race"),
  }),
  runCommercePaymentConfirm({
    source: "browser",
    request: mockRequest(),
    body: confirmBody("co_verify_1", "tviva_key_race"),
  }),
]);
const successCount = concurrent.filter((r) => r.ok).length;
assert("both succeed idempotent", successCount === 2);
assert("order completed once", store.getOrder("co_verify_1").paymentStatus === "completed");

console.log("\n4. 동일 orderId + 다른 paymentKey");
store.reset();
store.seed(mockOrder({ paymentStatus: "completed", paymentKey: "tviva_key_a", orderStatus: "payment_completed" }));
const clashOrder = await runCommercePaymentConfirm({
  source: "browser",
  request: mockRequest(),
  body: confirmBody("co_verify_1", "tviva_key_b"),
});
assert("different key blocked", !clashOrder.ok && clashOrder.code === "ALREADY_PAID");

console.log("\n5. 동일 paymentKey + 다른 orderId");
store.reset();
store.seed(mockOrder());
store.seed(mockOrder({ orderId: "co_verify_2", orderNumber: "BM-VERIFY-0002" }));
store.orders.get("co_verify_1").paymentStatus = "processing";
store.orders.get("co_verify_1")._processingKey = "tviva_shared";
store.paymentKeys.set("tviva_shared", "co_verify_1");
const clashKey = await runCommercePaymentConfirm({
  source: "browser",
  request: mockRequest(),
  body: confirmBody("co_verify_2", "tviva_shared"),
});
assert("shared key blocked", !clashKey.ok && clashKey.code === "PAYMENT_KEY_BOUND_TO_OTHER_ORDER");

console.log("\n6. browser + webhook 동시");
store.reset();
tossState.confirmedKeys.clear();
store.seed(mockOrder());
const whAmount = payAmount(store.getOrder("co_verify_1"));
tossState.queries = {
  tviva_wh_1: {
    paymentKey: "tviva_wh_1",
    orderId: "co_verify_1",
    status: "DONE",
    totalAmount: whAmount,
  },
};
process.env.TOSS_PAYMENT_WEBHOOK_ENABLED = "true";
process.env.TOSS_SECRET_KEY = "test_sk";
process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY = "test_ck";
assert("webhook gate on", isTossPaymentWebhookActive());
const dual = await Promise.all([
  runCommercePaymentConfirm({
    source: "browser",
    request: mockRequest(),
    body: confirmBody("co_verify_1", "tviva_wh_1"),
  }),
  handleTossPaymentWebhookEvent({
    eventType: "PAYMENT_STATUS_CHANGED",
    data: { paymentKey: "tviva_wh_1", orderId: "co_verify_1", status: "DONE" },
  }),
]);
assert("browser ok", dual[0].ok || dual[0].code !== "FINALIZE_RECONCILE_NEEDED");
assert("webhook ok or idempotent", dual[1].ok);
assert("single completed", store.getOrder("co_verify_1").paymentStatus === "completed");

console.log("\n7. Toss 성공 + DB transaction 실패");
store.reset();
tossState.confirmedKeys.clear();
store.seed(mockOrder());
store.orders.get("co_verify_1")._finalizeFailOnce = true;
const dbFail = await runCommercePaymentConfirm({
  source: "browser",
  request: mockRequest(),
  body: confirmBody("co_verify_1", "tviva_db_fail"),
});
assert("finalize failure flagged", !dbFail.ok && dbFail.code === "FINALIZE_RECONCILE_NEEDED");
assert("reconcile marked", store.getOrder("co_verify_1").paymentStatus === "reconcile_needed");

console.log("\n8. 재시도 시 Toss 조회 후 DB 복구");
store.reset();
tossState.confirmedKeys.add("tviva_recover");
store.seed(mockOrder({ paymentStatus: "reconcile_needed", _processingKey: "tviva_recover" }));
store.paymentKeys.set("tviva_recover", "co_verify_1");
const recoverAmount = payAmount(store.getOrder("co_verify_1"));
tossState.queries = {
  tviva_recover: {
    paymentKey: "tviva_recover",
    orderId: "co_verify_1",
    status: "DONE",
    totalAmount: recoverAmount,
  },
};
const recover = await runCommercePaymentConfirm({
  source: "browser",
  request: mockRequest(),
  body: confirmBody("co_verify_1", "tviva_recover"),
});
assert("recovery confirm ok", recover.ok);
assert("completed after recovery", store.getOrder("co_verify_1").paymentStatus === "completed");

console.log("\n9. fail API — completed 역행 차단");
const { recordCommercePaymentFail } = await import(
  "../src/lib/payment/commerce-payment-confirm.server.ts"
);
store.seed(mockOrder({ paymentStatus: "completed", orderStatus: "payment_completed", paymentKey: "k" }));
const failBlocked = await recordCommercePaymentFail(mockRequest(), {
  orderId: "co_verify_1",
  paymentRequestId: "pr_verify_abc",
  errorCode: "USER_CANCEL",
});
assert("completed fail blocked", !failBlocked.ok && failBlocked.code === "ALREADY_PAID");

console.log("\n10. webhook 비활성");
delete process.env.TOSS_PAYMENT_WEBHOOK_ENABLED;
assert("webhook inactive", !isTossPaymentWebhookActive());
const whOff = await handleTossPaymentWebhookEvent({
  eventType: "PAYMENT_STATUS_CHANGED",
  data: { paymentKey: "k", orderId: "co_verify_1", status: "DONE" },
});
assert("disabled webhook 503", !whOff.ok && whOff.code === "WEBHOOK_DISABLED");

console.log("\n11. 상태 전이 helper");
assert("terminal completed", isPaymentStatusTerminal("completed"));
assert("can fail pending", canRecordPaymentFail("pending"));
assert("cannot fail completed", !canRecordPaymentFail("completed"));

console.log("\n12. 금액 불일치");
store.reset();
store.seed(mockOrder());
const amountBad = await runCommercePaymentConfirm({
  source: "browser",
  request: mockRequest(),
  body: {
    orderId: "co_verify_1",
    paymentKey: "tviva_amt",
    amount: 99999,
    paymentRequestId: "pr_verify_abc",
  },
});
assert("amount mismatch blocked", !amountBad.ok && amountBad.code === "AMOUNT_MISMATCH");

console.log("\n13. 접근 proof 없음");
store.reset();
store.seed(mockOrder());
const noAccess = await runCommercePaymentConfirm({
  source: "browser",
  request: mockRequest(),
  body: {
    orderId: "co_verify_1",
    paymentKey: "tviva_no_pr",
    paymentRequestId: "wrong_prid",
  },
});
assert("bad paymentRequestId denied", !noAccess.ok);

console.log("\n14. reconciliation");
process.env.TOSS_SECRET_KEY = "test_sk";
process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY = "test_ck";
store.reset();
store.seed(mockOrder({ paymentStatus: "reconcile_needed", paymentKey: "tviva_recon" }));
store.paymentKeys.set("tviva_recon", "co_verify_1");
const reconAmount = payAmount(store.getOrder("co_verify_1"));
tossState.queries = {
  tviva_recon: {
    paymentKey: "tviva_recon",
    orderId: "co_verify_1",
    status: "DONE",
    totalAmount: reconAmount,
  },
};
const recon = await reconcileCommerceOrderPayment("co_verify_1");
assert("reconcile ok", recon.ok && recon.transitioned);

console.log("\n15. 로그·알림 중복 방지");
assert("status log once per finalize", store.getOrder("co_verify_1")._statusLogs === 1);

__resetConfirmStoreDepsForTests();
delete process.env.TOSS_PAYMENT_WEBHOOK_ENABLED;

console.log(`\n---\nPassed: ${passed}, Failed: ${failed}`);
console.log(`Mock fetch invocations: ${externalFetchCalls} (real external API: 0)`);

process.exit(failed > 0 ? 1 : 0);
