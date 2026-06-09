/**
 * 로컬 주문 생성 + Postgres 저장 + prepare 검수
 * node scripts/probe-commerce-order-local.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const BASE = process.env.COMMERCE_PROBE_BASE ?? "http://localhost:3000";

function loadEnvLocal() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvLocal();

const dbUrl = process.env.DATABASE_URL?.trim() ?? "";
if (!dbUrl) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}
const sql = neon(dbUrl);

const cartItem = {
  id: "probe-gb80l",
  batteryCode: "GB80L",
  batterySpec: "GB80L",
  productName: "로케트 GB80L",
  brandName: "로케트",
  brandId: "rocket",
  quantity: 1,
  vehicle: { displayName: "검수차량", year: "2018", fuelType: "가솔린" },
  usedBatteryReturnOption: "return",
  fulfillment: { method: "delivery" },
  source: "manual",
};

const priceCases = [
  {
    fulfillmentType: "delivery",
    expected: 82_500,
    addressInfo: { deliveryAddress: "부산광역시 북구 검수동 1" },
  },
  {
    fulfillmentType: "visit_install",
    expected: 90_000,
    addressInfo: { visitRegion: "부산 북구" },
  },
  {
    fulfillmentType: "store_install",
    expected: 85_000,
    selectedStore: "deokcheon",
    addressInfo: { storeId: "deokcheon" },
  },
  {
    fulfillmentType: "store_pickup_self",
    expected: 67_500,
    selectedStore: "hakjang",
    addressInfo: { storeId: "hakjang" },
  },
];

let lastOrderId = null;
let lastOrderNumber = null;
let lastFinalAmount = null;
let priceFailed = 0;

for (const c of priceCases) {
  const body = {
    cartItems: [{ ...cartItem, fulfillment: { method: c.fulfillmentType } }],
    customerInfo: {
      name: `검수_${c.fulfillmentType}`,
      phone: `010${String(Date.now()).slice(-8)}`,
      customerType: "guest",
    },
    fulfillmentType: c.fulfillmentType,
    returnBatteryOption: "return",
    addressInfo: c.addressInfo,
    selectedStore: c.selectedStore,
  };

  const res = await fetch(`${BASE}/api/orders/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  const ok = res.ok && json.ok && json.order?.finalAmount === c.expected;
  if (!ok) {
    priceFailed++;
    console.error(
      `price_${c.fulfillmentType}`,
      "fail",
      res.status,
      json.order?.finalAmount ?? json.message,
    );
    continue;
  }

  const rows = await sql`
    SELECT id, order_number, final_amount, fulfillment_type
    FROM commerce_orders
    WHERE id = ${json.order.orderId}
    LIMIT 1
  `;
  const row = rows[0];
  const dbOk =
    row &&
    row.order_number === json.order.orderNumber &&
    row.final_amount === c.expected;
  console.log(`price_${c.fulfillmentType}`, "ok", c.expected, "db", dbOk ? "ok" : "fail");

  if (c.fulfillmentType === "delivery") {
    lastOrderId = json.order.orderId;
    lastOrderNumber = json.order.orderNumber;
    lastFinalAmount = json.order.finalAmount;
  }
}

console.log("orderCreateSuccess", priceFailed === 0 && !!lastOrderId);
console.log("orderId", lastOrderId ?? "none");
console.log("orderNumber", lastOrderNumber ?? "none");
console.log("finalAmount_delivery", lastFinalAmount);

if (!lastOrderId) process.exit(1);

const prepareOk = await fetch(`${BASE}/api/payments/prepare`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ orderId: lastOrderId, clientAmount: lastFinalAmount }),
});
const prepareJson = await prepareOk.json();
console.log(
  "prepareOk",
  prepareOk.ok,
  prepareOk.status,
  prepareJson.amount === lastFinalAmount,
  prepareJson.orderId === lastOrderId,
);

const prepareBad = await fetch(`${BASE}/api/payments/prepare`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ orderId: lastOrderId, clientAmount: 1 }),
});
const badJson = await prepareBad.json().catch(() => ({}));
console.log("amountTamperBlocked", prepareBad.status === 400, prepareBad.status, badJson.ok === false);

const exitOk =
  priceFailed === 0 &&
  prepareOk.ok &&
  prepareJson.amount === lastFinalAmount &&
  prepareBad.status === 400;
process.exit(exitOk ? 0 : 1);
