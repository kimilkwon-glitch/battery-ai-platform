import { readFileSync, existsSync } from "node:fs";
function loadEnvLocal() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnvLocal();

const body = {
  cartItems: [{
    id: "e2e", batteryCode: "GB80L", batterySpec: "GB80L", productName: "로케트 GB80L",
    brandName: "로케트", brandId: "rocket", quantity: 1,
    vehicle: { displayName: "E2E", year: "2018", fuelType: "가솔린" },
    usedBatteryReturnOption: "return", fulfillment: { method: "delivery" }, source: "manual",
  }],
  customerInfo: { name: "E2E_Toss", phone: `010${String(Date.now()).slice(-8)}`, customerType: "guest" },
  fulfillmentType: "delivery",
  returnBatteryOption: "return",
  addressInfo: { deliveryAddress: "부산 E2E" },
};
const create = await fetch("http://localhost:3000/api/orders/create", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
}).then((r) => r.json());
const prep = await fetch("http://localhost:3000/api/payments/prepare", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ orderId: create.order.orderId, clientAmount: create.order.finalAmount }),
}).then((r) => r.json());
console.log("orderId", create.order.orderId);
console.log("paymentRequestId", prep.paymentRequestId);
console.log(
  "readyUrl",
  `http://localhost:3000/payment/ready?orderId=${encodeURIComponent(create.order.orderId)}&paymentRequestId=${encodeURIComponent(prep.paymentRequestId)}`,
);
