/**
 * 로컬 토스 E2E 검수 — API/DB/보안 (결제창 UI는 브라우저 별도)
 * node scripts/probe-toss-e2e-local.mjs [successOrderId]
 */
import { existsSync, readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const BASE = process.env.COMMERCE_PROBE_BASE ?? "http://localhost:3000";
const ADMIN_PASS = process.env.ADMIN_TEST_PASS ?? "";

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
  id: "e2e-gb80l",
  batteryCode: "GB80L",
  batterySpec: "GB80L",
  productName: "로케트 GB80L",
  brandName: "로케트",
  brandId: "rocket",
  quantity: 1,
  vehicle: { displayName: "E2E차량", year: "2018", fuelType: "가솔린" },
  usedBatteryReturnOption: "return",
  fulfillment: { method: "delivery" },
  source: "manual",
};

async function createDeliveryOrder(suffix) {
  const body = {
    cartItems: [cartItem],
    customerInfo: {
      name: `E2E_${suffix}`,
      phone: `010${String(Date.now() + Math.floor(Math.random() * 1000)).slice(-8)}`,
      customerType: "guest",
    },
    fulfillmentType: "delivery",
    returnBatteryOption: "return",
    addressInfo: { deliveryAddress: "부산 북구 E2E 테스트" },
  };
  const res = await fetch(`${BASE}/api/orders/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(`create_fail:${json.message}`);
  return json.order;
}

async function prepare(orderId, amount) {
  const res = await fetch(`${BASE}/api/payments/prepare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, clientAmount: amount }),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(`prepare_fail:${json.message}`);
  return json;
}

async function adminLogin() {
  if (!ADMIN_PASS) return "";
  const res = await fetch(`${BASE}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: ADMIN_PASS }),
  });
  const cookie = res.headers.get("set-cookie")?.split(";")[0] ?? "";
  return cookie;
}

async function queryOrder(orderId) {
  const rows = await sql`
    SELECT id, order_number, payment_status, order_status, final_amount
    FROM commerce_orders WHERE id = ${orderId} LIMIT 1
  `;
  return rows[0] ?? null;
}

async function queryPayment(orderId) {
  const rows = await sql`
    SELECT payment_key, amount, method, status, approved_at, receipt_url
    FROM commerce_payments WHERE order_id = ${orderId}
    ORDER BY created_at DESC LIMIT 1
  `;
  return rows[0] ?? null;
}

// 보안: success 직접 접근
const bareSuccess = await fetch(`${BASE}/payment/success`);
const bareHtml = await bareSuccess.text();
const bareNotCompleted =
  bareHtml.includes("data-state=\"unknown\"") ||
  bareHtml.includes("결제 결과를 확인할 수 없습니다");
console.log("security_bareSuccessNotCompleted", bareNotCompleted);

const readyHtml = await fetch(`${BASE}/payment/ready?orderId=x&paymentRequestId=y`).then((r) =>
  r.text(),
);
const noSecretInClient = !readyHtml.includes("test_gsk_") && !readyHtml.includes("gsk_");
console.log("security_noSecretKeyInHtml", noSecretInClient);

// 취소 흐름
const cancelOrder = await createDeliveryOrder("cancel");
const cancelPrep = await prepare(cancelOrder.orderId, cancelOrder.finalAmount);
const failRes = await fetch(`${BASE}/api/payments/fail`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    orderId: cancelOrder.orderId,
    paymentRequestId: cancelPrep.paymentRequestId,
    errorCode: "PAY_PROCESS_CANCELED",
    errorMessage: "결제가 취소되었습니다.",
  }),
});
const failJson = await failRes.json();
console.log("cancel_failApi", failRes.ok, failJson.ok);

const cancelRow = await queryOrder(cancelOrder.orderId);
console.log(
  "cancel_paymentStatus",
  cancelRow?.payment_status === "canceled",
  cancelRow?.payment_status,
);

const failPage = await fetch(
  `${BASE}/payment/fail?orderId=${encodeURIComponent(cancelOrder.orderId)}&code=PAY_PROCESS_CANCELED`,
);
console.log("cancel_failPage", failPage.status === 200);

// 성공 주문 준비 (브라우저 결제용)
const successOrder = await createDeliveryOrder("pay");
const successPrep = await prepare(successOrder.orderId, successOrder.finalAmount);
const readyUrl = `${BASE}/payment/ready?orderId=${encodeURIComponent(successOrder.orderId)}&paymentRequestId=${encodeURIComponent(successPrep.paymentRequestId)}`;
console.log("success_orderId", successOrder.orderId);
console.log("success_orderNumber", successOrder.orderNumber);
console.log("success_finalAmount", successOrder.finalAmount === 82500);
console.log("success_readyUrl", readyUrl.replace(BASE, ""));

// 브라우저 결제 후 검증용 orderId 인자
const verifyOrderId = process.argv[2] ?? successOrder.orderId;
const paidRow = await queryOrder(verifyOrderId);
const paidPay = await queryPayment(verifyOrderId);

if (process.argv[2]) {
  console.log("verify_paymentStatus", paidRow?.payment_status === "completed", paidRow?.payment_status);
  console.log("verify_orderStatus", paidRow?.order_status);
  console.log("verify_finalAmount", paidRow?.final_amount === 82500);
  console.log(
    "verify_paymentRecord",
    Boolean(paidPay?.payment_key),
    Boolean(paidPay?.amount === 82500),
    Boolean(paidPay?.method),
    paidPay?.status,
    Boolean(paidPay?.approved_at),
    Boolean(paidPay?.receipt_url),
  );

  const cookie = await adminLogin();
  if (cookie) {
    const adminRes = await fetch(`${BASE}/api/admin/commerce-orders?limit=50`, {
      headers: { Cookie: cookie },
    });
    const adminJson = await adminRes.json();
    const item = adminJson.items?.find((i) => i.orderId === verifyOrderId);
    console.log(
      "admin_reflectsPaid",
      adminRes.ok && item?.paymentStatus === "completed",
      item?.paymentStatus,
    );
  } else {
    console.log("admin_reflectsPaid", "skipped_no_ADMIN_TEST_PASS");
  }
}

console.log("E2E_PREPARE_ORDER", verifyOrderId);
