#!/usr/bin/env node
const BASE = "https://battery-ai-platform.vercel.app";
const STAMP = "BM-COMMERCE-POSTGRES-20260530-V1";

const home = await fetch(`${BASE}/?t=${Date.now()}`).then((r) => r.text());
const stamp = home.match(/data-build-version="([^"]+)"/)?.[1];
console.log("stampOk", stamp === STAMP, stamp);

const create = await fetch(`${BASE}/api/orders/create`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    cartItems: [
      {
        id: "p",
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
      },
    ],
    customerInfo: { name: "DB검수", phone: "01099998888", customerType: "guest" },
    fulfillmentType: "delivery",
    returnBatteryOption: "return",
    addressInfo: { deliveryAddress: "부산 테스트" },
  }),
}).then((r) => r.json());

console.log("orderCreate", create);
