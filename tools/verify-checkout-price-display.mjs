/**
 * CMF80L checkout 가격 표시 검증 — 계산만 (Toss/주문 생성 없음)
 * node tools/verify-checkout-price-display.mjs
 */
const DELIVERY_FEE = 15_000;
const STORE_INSTALL_DISCOUNT = 5_000;
const BATTERY_NO_RETURN_FEE = 25_000;
const FIRST_ORDER_PCT = 3;

const INTERNET = 62_000;
const ONSITE = 85_000;

function calcPreDiscount(fulfillment, batteryReturn) {
  switch (fulfillment) {
    case "delivery":
      return INTERNET + DELIVERY_FEE + (batteryReturn === "no_return" ? BATTERY_NO_RETURN_FEE : 0);
    case "visit_install":
      return ONSITE + (batteryReturn === "no_return" ? BATTERY_NO_RETURN_FEE : 0);
    case "store_install":
      return ONSITE - STORE_INSTALL_DISCOUNT + (batteryReturn === "no_return" ? BATTERY_NO_RETURN_FEE : 0);
    case "store_pickup_self":
      return INTERNET + (batteryReturn === "no_return" ? BATTERY_NO_RETURN_FEE : 0);
    default:
      return null;
  }
}

function applyFirstOrderDiscount(preDiscount) {
  const discount = Math.floor((preDiscount * FIRST_ORDER_PCT) / 100);
  return { preDiscount, discount, finalAmount: preDiscount - discount };
}

const CASES = [
  {
    id: "A",
    fulfillment: "delivery",
    batteryReturn: "return",
    expected: { preDiscount: 77_000, discount: 2_310, finalAmount: 74_690 },
  },
  {
    id: "B",
    fulfillment: "delivery",
    batteryReturn: "no_return",
    expected: { preDiscount: 102_000, discount: 3_060, finalAmount: 98_940 },
  },
  {
    id: "C",
    fulfillment: "store_install",
    batteryReturn: "return",
    expected: { preDiscount: 80_000, discount: 2_400, finalAmount: 77_600 },
  },
  {
    id: "D",
    fulfillment: "store_pickup_self",
    batteryReturn: "return",
    expected: { preDiscount: 62_000, discount: 1_860, finalAmount: 60_140 },
  },
];

let failed = 0;
for (const c of CASES) {
  const pre = calcPreDiscount(c.fulfillment, c.batteryReturn);
  const got = applyFirstOrderDiscount(pre);
  const ok =
    got.preDiscount === c.expected.preDiscount &&
    got.discount === c.expected.discount &&
    got.finalAmount === c.expected.finalAmount;
  if (!ok) {
    console.error(`FAIL case ${c.id}`, { got, expected: c.expected });
    failed++;
  } else {
    console.log(
      `OK case ${c.id}: ${got.preDiscount.toLocaleString()} - ${got.discount.toLocaleString()} = ${got.finalAmount.toLocaleString()}원`,
    );
  }
}

if (failed > 0) process.exit(1);
console.log("All CMF80L checkout price display cases passed.");
