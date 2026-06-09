#!/usr/bin/env node
const BASE = "https://battery-ai-platform.vercel.app";
const STAMP = "BM-CART-CHECKOUT-FLOW-20260530-V1";

const paths = ["/batteries/GB80L", "/cart", "/checkout", "/checkout/review", "/payment/ready"];

for (const path of paths) {
  const res = await fetch(`${BASE}${path}?t=${Date.now()}`, {
    headers: { "cache-control": "no-cache" },
  });
  const html = await res.text();
  const stamp = html.match(/data-build-version="([^"]+)"/)?.[1];
  console.log(
    JSON.stringify({
      path,
      status: res.status,
      stampOk: stamp === STAMP,
      hasPaymentPreparing: html.includes("결제 시스템을 준비 중"),
      hasProductFulfillment: html.includes("data-product-fulfillment"),
      noDevJargon: !/TODO|mock|PG 미연동|API 없음|개발 중/i.test(html),
    }),
  );
}

const orderCreate = await fetch(`${BASE}/api/orders/create`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ cartItems: [], customerInfo: { name: "t", phone: "010" } }),
}).then((r) => r.json());
console.log(JSON.stringify({ apiOrderCreate: orderCreate }));

const adminApi = await fetch(`${BASE}/api/admin/commerce-orders`);
console.log(JSON.stringify({ adminApi401: adminApi.status === 401 }));
