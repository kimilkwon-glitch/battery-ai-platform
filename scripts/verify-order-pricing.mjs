/**
 * 검수 예시 — GB80L / CMF80L / AGM80L 가격 정책
 * node scripts/verify-order-pricing.mjs
 */
const DELIVERY_FEE = 15_000;
const STORE_INSTALL_DISCOUNT = 5_000;

const CASES = [
  { label: "로케트 GB80L", internet: 67_500, onsite: 90_000 },
  { label: "쏠라이트 CMF80L", internet: 62_000, onsite: 85_000 },
  { label: "로케트 AGM80L", internet: 119_300, onsite: 150_000 },
];

function calc(internet, onsite, type) {
  switch (type) {
    case "delivery":
      return internet + DELIVERY_FEE;
    case "onsite_install":
      return onsite;
    case "store_install":
      return onsite - STORE_INSTALL_DISCOUNT;
    case "store_pickup_self":
      return internet;
    default:
      return null;
  }
}

const EXPECTED = {
  "로케트 GB80L": {
    delivery: 82_500,
    onsite_install: 90_000,
    store_install: 85_000,
    store_pickup_self: 67_500,
  },
  "쏠라이트 CMF80L": {
    delivery: 77_000,
    onsite_install: 85_000,
    store_install: 80_000,
    store_pickup_self: 62_000,
  },
  "로케트 AGM80L": {
    delivery: 134_300,
    onsite_install: 150_000,
    store_install: 145_000,
    store_pickup_self: 119_300,
  },
};

let failed = 0;
for (const c of CASES) {
  const exp = EXPECTED[c.label];
  for (const [type, want] of Object.entries(exp)) {
    const got = calc(c.internet, c.onsite, type);
    if (got !== want) {
      console.error(`FAIL ${c.label} ${type}: got ${got}, want ${want}`);
      failed++;
    } else {
      console.log(`OK ${c.label} ${type}: ${got.toLocaleString()}원`);
    }
  }
}
if (failed > 0) {
  process.exit(1);
}
console.log("All pricing verification cases passed.");
