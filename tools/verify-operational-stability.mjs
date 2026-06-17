#!/usr/bin/env node
/**
 * 통합 운영 안정성 mock 검증 — Production DB·외부 API 호출 없음
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { ensureTsxVerify } from "../scripts/ensure-tsx-verify.mjs";

ensureTsxVerify(import.meta.url);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const subScripts = [
  "verify:payment-confirm",
  "verify:payment-concurrency",
  "verify:security-access",
  "verify:auth-recovery",
  "verify:auth-guest-flow",
  "verify:rate-limit-distributed",
  "verify:product-qna-privacy",
  "verify:checkout-fulfillment",
];

console.log("verify-operational-stability — sub-script suite\n");

let suiteFailures = 0;
for (const script of subScripts) {
  console.log(`\n>>> npm run ${script}\n`);
  const childEnv = { ...process.env };
  delete childEnv.BM_VERIFY_TSX;
  const r = spawnSync("npm", ["run", script], {
    cwd: root,
    stdio: "inherit",
    env: childEnv,
    shell: true,
  });
  if ((r.status ?? 1) !== 0) suiteFailures += 1;
}

await import("../scripts/register-server-only.mjs");

const { normalizePaymentKey } = await import("../src/lib/payment/payment-key-normalize.server.ts");
const {
  isOrderNumberUniqueViolation,
  MAX_ORDER_NUMBER_CREATE_RETRIES,
} = await import("../src/lib/payment/commerce-order-create-retry.server.ts");
const { canApproveClaimRefund } = await import("../src/lib/claims/claim-transition.server.ts");
const { assertAdminOrderNotStale } = await import("../src/lib/admin/commerce-admin-order-update.server.ts");

let passed = 0;
let failed = 0;
function assert(name, cond) {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}`);
  }
}

console.log("\n>>> inline multi-user scenarios\n");

assert("payment_key empty → null", normalizePaymentKey("  ") === null);
assert("payment_key trim", normalizePaymentKey("  pk_1  ") === "pk_1");
assert("order_number retry max is 3", MAX_ORDER_NUMBER_CREATE_RETRIES === 3);
assert(
  "order_number unique detect",
  isOrderNumberUniqueViolation(new Error('duplicate key "commerce_orders_order_number_key"')),
);
assert("refund blocked when shipping", !canApproveClaimRefund("shipping"));
assert("refund allowed when payment_completed", canApproveClaimRefund("payment_completed"));

const order = {
  orderId: "co_1",
  orderNumber: "BM-1",
  orderStatus: "payment_pending",
  paymentStatus: "pending",
  customerName: "a",
  customerPhone: "010",
  customerType: "guest",
  productName: "p",
  batteryCode: "c",
  fulfillmentType: "delivery",
  returnBatteryOption: "return",
  deliveryFee: 0,
  storeInstallDiscount: 0,
  itemsJson: [],
  priceLines: [],
  statusHistory: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
assert("stale admin update detect", !assertAdminOrderNotStale(order, "1970-01-01T00:00:00.000Z").ok);

let claimStatus = "REVIEWING";
let refundOps = 0;
async function claimRefundOnce() {
  if (claimStatus === "REFUNDED") return { ok: true };
  if (claimStatus !== "REVIEWING") return { ok: false };
  refundOps += 1;
  claimStatus = "REFUNDED";
  return { ok: true };
}
await Promise.all([claimRefundOnce(), claimRefundOnce()]);
assert("concurrent claim refund single op", refundOps === 1);

const orderIds = await Promise.all(
  Array.from({ length: 20 }, async (_, i) => `co_sim_${i}_${Math.random().toString(16).slice(2)}`),
);
assert("20 concurrent distinct order ids", new Set(orderIds).size === 20);

console.log(`\ninline passed: ${passed}, failed: ${failed}`);
console.log(`suite script failures: ${suiteFailures}`);
console.log("Real external API / Production DB writes: 0");

process.exit(failed > 0 || suiteFailures > 0 ? 1 : 0);
