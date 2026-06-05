/**
 * 토스 결제 amount 서버 검증 — GB80L / CMF80L / AGM80L
 * npx tsx scripts/verify-toss-pricing.ts
 */
import { calculateOrderPrice } from "../src/lib/pricing/order-price";
import { getBatteryPrices } from "../src/lib/battery-prices";

type Case = {
  brand: "rocket" | "solite";
  spec: string;
  fulfillment: "delivery" | "onsite_install" | "store_install" | "store_pickup_self";
  expected: number;
};

const CASES: Case[] = [
  { brand: "rocket", spec: "GB80L", fulfillment: "delivery", expected: 82_500 },
  { brand: "rocket", spec: "GB80L", fulfillment: "onsite_install", expected: 90_000 },
  { brand: "rocket", spec: "GB80L", fulfillment: "store_install", expected: 85_000 },
  { brand: "rocket", spec: "GB80L", fulfillment: "store_pickup_self", expected: 67_500 },
  { brand: "solite", spec: "CMF80L", fulfillment: "delivery", expected: 77_000 },
  { brand: "solite", spec: "CMF80L", fulfillment: "onsite_install", expected: 85_000 },
  { brand: "solite", spec: "CMF80L", fulfillment: "store_install", expected: 80_000 },
  { brand: "solite", spec: "CMF80L", fulfillment: "store_pickup_self", expected: 62_000 },
  { brand: "rocket", spec: "AGM80L", fulfillment: "delivery", expected: 134_300 },
  { brand: "rocket", spec: "AGM80L", fulfillment: "onsite_install", expected: 150_000 },
  { brand: "rocket", spec: "AGM80L", fulfillment: "store_install", expected: 145_000 },
  { brand: "rocket", spec: "AGM80L", fulfillment: "store_pickup_self", expected: 119_300 },
];

let failed = 0;
for (const c of CASES) {
  const prices = getBatteryPrices(c.brand, c.spec);
  const result = calculateOrderPrice({
    internetPrice: prices.internetPriceWon,
    onsitePrice: prices.onsitePriceWon,
    fulfillmentType: c.fulfillment,
  });
  const got = result.lineTotal;
  const ok = got === c.expected;
  if (!ok) {
    failed++;
    console.error(
      `FAIL ${c.brand} ${c.spec} ${c.fulfillment}: got ${got}, expected ${c.expected}`,
    );
  } else {
    console.log(`OK   ${c.brand} ${c.spec} ${c.fulfillment}: ${got?.toLocaleString("ko-KR")}원`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} case(s) failed`);
  process.exit(1);
}
console.log("\nAll pricing cases passed.");
