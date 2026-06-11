/**
 * 배송조회 UI 검수용 임시 주문 1건 (BM-SHP-*, 실제 결제/Toss 호출 없음)
 * npm run admin:seed-delivery-demo
 */
import "./register-server-only.mjs";
import { existsSync, readFileSync } from "node:fs";
import { computeServerOrderAmount } from "../src/lib/payment/compute-order-amount";
import type { BatteryCartItem } from "../src/types/cart";
import type { CommerceOrderRecord } from "../src/types/commerce-payment";

const ORDER_ID = "co_ship_ui_20260611";
const ORDER_NUMBER = "BM-SHP-20260611-0001";
const INTERNAL_ADMIN_MEMO = "송장·배송조회 UI 확인용 내부";

function loadEnvLocal(): void {
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

function assertSafe(): void {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    console.error("[seed-delivery-demo-order] BLOCKED in production");
    process.exit(1);
  }
  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) {
    console.error("[seed-delivery-demo-order] DATABASE_URL missing");
    process.exit(1);
  }
  const productionRefs = [
    process.env.PRODUCTION_DATABASE_URL,
    process.env.DATABASE_URL_PRODUCTION,
    process.env.BM_PRODUCTION_DATABASE_URL,
  ]
    .map((v) => v?.trim())
    .filter((v): v is string => Boolean(v));
  for (const prodUrl of productionRefs) {
    if (dbUrl === prodUrl) {
      console.error("[seed-delivery-demo-order] BLOCKED: DATABASE_URL matches production URL");
      process.exit(1);
    }
  }
}

function buildCartItem(): BatteryCartItem {
  return {
    id: "cart_ship_demo_1",
    productId: "GB90R",
    productName: "로케트 GB90R 자동차 배터리",
    brandName: "로케트",
    batterySpec: "GB90R",
    quantity: 1,
    fitmentStatus: "confirmed",
    usedBatteryReturn: { option: "return", guideRequired: true },
    fulfillment: { method: "delivery" },
    vehicle: { displayName: "포터2 디젤" },
  };
}

function buildRecord(existing?: CommerceOrderRecord | null): CommerceOrderRecord {
  const items = [buildCartItem()];
  const amounts = computeServerOrderAmount(items, "delivery", "return");
  if (amounts.finalAmount == null) throw new Error("금액 계산 실패");

  const now = new Date().toISOString();
  return {
    orderId: existing?.orderId ?? ORDER_ID,
    orderNumber: ORDER_NUMBER,
    orderStatus: "shipping",
    paymentStatus: "completed",
    customerName: "김민재",
    customerPhone: "01048273196",
    customerType: "guest",
    vehicleName: "포터2 디젤",
    productName: "로케트 GB90R 자동차 배터리",
    brand: "로케트",
    batteryCode: "GB90R",
    internetPrice: amounts.internetPrice,
    onsitePrice: amounts.onsitePrice,
    fulfillmentType: "delivery",
    returnBatteryOption: "return",
    deliveryFee: amounts.deliveryFee,
    storeInstallDiscount: amounts.storeInstallDiscount,
    batteryReturnFee: amounts.batteryReturnFee,
    finalAmount: amounts.finalAmount,
    postalCode: "46998",
    address1: "부산광역시 사상구 학감대로 238",
    address2: "101동 1204호",
    address: "부산광역시 사상구 학감대로 238, 101동 1204호",
    requestMemo: "부재 시 문 앞에 놓아주세요.",
    itemsJson: items,
    priceLines: amounts.priceLines,
    statusHistory: existing?.statusHistory?.length
      ? existing.statusHistory
      : [
          {
            status: "payment_completed",
            paymentStatus: "completed",
            note: "결제 완료",
            at: now,
          },
          {
            status: "shipping",
            paymentStatus: "completed",
            note: "발송 처리",
            at: now,
          },
        ],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

async function main(): Promise<void> {
  assertSafe();
  const pgOrder = await import("../src/lib/payment/commerce-order-store.postgres");
  const { commerceOrderAdminMetaUpsert } = await import(
    "../src/lib/admin/commerce-order-admin-meta-store.postgres"
  );

  const existing = await pgOrder.pgStoreCommerceOrderLookupByRef(ORDER_NUMBER);
  const record = buildRecord(existing);
  const saved = existing
    ? await pgOrder.pgStoreCommerceOrderUpdate(existing.orderId, record)
    : await pgOrder.pgStoreCommerceOrderCreate(record);

  if (!saved) throw new Error("주문 저장 실패");

  const shippedAt = new Date().toISOString();
  await commerceOrderAdminMetaUpsert(saved.orderId, {
    adminMemo: INTERNAL_ADMIN_MEMO,
    courierCode: "23",
    shippingCarrier: "경동택배",
    shippingTrackingNumber: "123456789012",
    shippedAt,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        orderId: saved.orderId,
        orderNumber: saved.orderNumber,
        customerName: saved.customerName,
        phone: saved.customerPhone,
        courierCode: "23",
        courierName: "경동택배",
        invoiceNumber: "123456789012",
        lookupHint: {
          path: "/orders/lookup",
          orderNumber: ORDER_NUMBER,
          phone: "01048273196",
        },
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
