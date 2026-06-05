/**
 * 토스 결제 amount 검증 — GB80L / CMF80L / AGM80L 예시
 * node scripts/verify-toss-pricing.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// Dynamic import compiled paths — use tsx for full run; this script uses catalog directly
const catalogPath = path.join(root, "src/data/battery-price-catalog.ts");
const catalogSrc = readFileSync(catalogPath, "utf8");

function extractWon(blockName) {
  const re = new RegExp(`${blockName}[^=]*=\\s*\\{([^}]+)\\}`, "s");
  const m = catalogSrc.match(re);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/(\w+):\s*(\d+)/);
    if (kv) out[kv[1]] = Number(kv[2]);
  }
  return out;
}

const internet = extractWon("INTERNET_PRICES_WON");
const onsite = extractWon("ONSITE_PRICES_WON");

const DELIVERY = 15000;
const STORE_DISCOUNT = 5000;

function price(brand, spec, fulfillment) {
  const specKey =
    spec === "GB80L" || spec === "CMF80L"
      ? "80LR"
      : spec === "AGM80L"
        ? "AGM80LR"
        : null;
  if (!specKey) return null;
  const internetPrice = internet[specKey];
  const onsitePrice = onsite[specKey];
  if (internetPrice == null || onsitePrice == null) return null;
  switch (fulfillment) {
    case "delivery":
      return internetPrice + DELIVERY;
    case "visit_install":
      return onsitePrice;
    case "store_install":
      return onsitePrice - STORE_DISCOUNT;
    case "store_pickup_self":
      return internetPrice;
    default:
      return null;
  }
}

const cases = [
  ["rocket", "GB80L", "delivery", 82500],
  ["rocket", "GB80L", "visit_install", 90000],
  ["rocket", "GB80L", "store_install", 85000],
  ["rocket", "GB80L", "store_pickup_self", 67500],
  ["solite", "CMF80L", "delivery", 77000],
  ["solite", "CMF80L", "visit_install", 85000],
  ["solite", "CMF80L", "store_install", 80000],
  ["solite", "CMF80L", "store_pickup_self", 62000],
  ["rocket", "AGM80L", "delivery", 134300],
  ["rocket", "AGM80L", "visit_install", 150000],
  ["rocket", "AGM80L", "store_install", 145000],
  ["rocket", "AGM80L", "store_pickup_self", 119300],
];

let failed = 0;
for (const [brand, spec, fulfillment, expected] of cases) {
  const got = price(brand, spec, fulfillment);
  const ok = got === expected;
  if (!ok) {
    failed++;
    console.error(`FAIL ${brand} ${spec} ${fulfillment}: got ${got}, expected ${expected}`);
  } else {
    console.log(`OK   ${brand} ${spec} ${fulfillment}: ${got}`);
  }
}
process.exit(failed > 0 ? 1 : 0);
