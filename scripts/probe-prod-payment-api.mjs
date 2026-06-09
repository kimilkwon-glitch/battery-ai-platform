#!/usr/bin/env node
/** Production payment API smoke — amount validation + fail/cancel record */
const BASE = process.env.PROD_BASE ?? "https://battery-ai-platform.vercel.app";

const orderBody = {
  cartItems: [
    {
      id: "probe-gb80l",
      batteryCode: "GB80L",
      batterySpec: "GB80L",
      productName: "로케트 GB80L",
      brandName: "로케트",
      brandId: "rocket",
      quantity: 1,
      vehicle: { displayName: "심사검수차량", year: "2018", fuelType: "가솔린" },
      usedBatteryReturnOption: "return",
      fulfillment: { method: "delivery" },
      source: "manual",
    },
  ],
  customerInfo: {
    name: "토스검수테스트",
    phone: "01012345678",
    customerType: "guest",
  },
  vehicleInfo: {
    name: "심사검수차량",
    year: "2018",
    fuelType: "가솔린",
    currentBatterySpec: "GB80L",
  },
  fulfillmentType: "delivery",
  returnBatteryOption: "return",
  addressInfo: {
    deliveryAddress: "부산광역시 북구 덕천동 테스트 1",
  },
};

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function main() {
  console.log("BASE", BASE);

  const create = await post("/api/orders/create", orderBody);
  console.log("create", create.status, create.json);
  if (!create.json?.ok) process.exit(1);

  const orderId = create.json.order.orderId;
  const expected = create.json.order.finalAmount;
  console.log("expectedAmount", expected);

  const wrongPrepare = await post("/api/payments/prepare", {
    orderId,
    clientAmount: 1,
  });
  console.log("prepare_wrong_amount", wrongPrepare.status, wrongPrepare.json?.message);

  const okPrepare = await post("/api/payments/prepare", {
    orderId,
    clientAmount: expected,
  });
  console.log("prepare_ok", okPrepare.status, {
    ok: okPrepare.json?.ok,
    amount: okPrepare.json?.amount,
    clientKeyPrefix: okPrepare.json?.clientKey?.slice(0, 12),
    provider: okPrepare.json?.provider,
  });

  const failCancel = await post("/api/payments/fail", {
    orderId,
    errorCode: "PAY_PROCESS_CANCELED",
    errorMessage: "사용자가 결제를 취소했습니다.",
  });
  console.log("fail_cancel", failCancel.status, failCancel.json);

  const orderGet = await fetch(`${BASE}/api/orders/${encodeURIComponent(orderId)}`);
  const orderJson = await orderGet.json();
  console.log("order_after_cancel", orderGet.status, {
    paymentStatus: orderJson?.order?.paymentStatus,
    orderStatus: orderJson?.order?.orderStatus,
    failCode: orderJson?.order?.paymentFailCode,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
