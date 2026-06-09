/**
 * GB80L 가격 정책 로컬 검수 — DB 불필요
 * npx tsx scripts/verify-commerce-pricing-local.mjs
 */
import { computeServerOrderAmount } from "../src/lib/payment/compute-order-amount.ts";

const item = {
  id: "gb80l",
  batteryCode: "GB80L",
  batterySpec: "GB80L",
  productName: "로케트 GB80L",
  brandName: "로케트",
  brandId: "rocket",
  quantity: 1,
  vehicle: { displayName: "테스트", year: "2018", fuelType: "가솔린" },
  usedBatteryReturnOption: "return",
  fulfillment: { method: "delivery" },
  source: "manual",
};

const cases = [
  ["delivery", 82_500],
  ["visit_install", 90_000],
  ["store_install", 85_000],
  ["store_pickup_self", 67_500],
];

let failed = 0;
for (const [fulfillment, expected] of cases) {
  const r = computeServerOrderAmount([item], fulfillment);
  const ok = r.finalAmount === expected;
  if (!ok) {
    failed++;
    console.error(`FAIL ${fulfillment}: got ${r.finalAmount}, expected ${expected}`);
  } else {
    console.log(`OK   ${fulfillment}: ${r.finalAmount}`);
  }
}
process.exit(failed > 0 ? 1 : 0);
