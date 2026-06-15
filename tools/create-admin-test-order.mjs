#!/usr/bin/env node
/**
 * 관리자 UX 검수용 테스트 주문 1건 생성 — dry-run 기본
 * Usage:
 *   npx tsx tools/create-admin-test-order.mjs
 *   npx tsx tools/create-admin-test-order.mjs --apply
 */
import { existsSync, readFileSync } from "node:fs";
import "../scripts/register-server-only.mjs";
import {
  ADMIN_UX_REVIEW_CUSTOMER_NAME,
  ADMIN_UX_REVIEW_CUSTOMER_PHONE,
  ADMIN_UX_REVIEW_MEMO,
  ADMIN_UX_REVIEW_ORDER_PREFIX,
  isAdminUxReviewTestOrder,
} from "../src/lib/admin/admin-ux-review-test-order.ts";
import { computeServerOrderAmount } from "../src/lib/payment/compute-order-amount.ts";

const apply = process.argv.includes("--apply");
const ORDER_NUMBER = `${ADMIN_UX_REVIEW_ORDER_PREFIX}20260611-0001`;
const ORDER_ID = "co_admin_ux_review_001";
const BATTERY_CODE = "GB80L";

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

function buildCartItem() {
  return {
    id: "cart_admin_ux_review_001",
    productId: BATTERY_CODE,
    productName: `로케트 ${BATTERY_CODE} 자동차 배터리`,
    brandName: "로케트",
    batterySpec: BATTERY_CODE,
    quantity: 1,
    fitmentStatus: "confirmed",
    usedBatteryReturn: { option: "return", guideRequired: true },
    fulfillment: { method: "store_install" },
    vehicle: { displayName: "그랜저 HG" },
  };
}

function buildRecord(amounts) {
  const now = new Date().toISOString();
  const items = [buildCartItem()];
  if (amounts.finalAmount == null) {
    throw new Error("금액 계산 실패");
  }
  return {
    orderId: ORDER_ID,
    orderNumber: ORDER_NUMBER,
    orderStatus: "payment_completed",
    paymentStatus: "completed",
    customerName: ADMIN_UX_REVIEW_CUSTOMER_NAME,
    customerPhone: ADMIN_UX_REVIEW_CUSTOMER_PHONE,
    customerType: "guest",
    vehicleName: "그랜저 HG",
    vehicleYear: "2014",
    vehicleFuel: "가솔린",
    productName: items[0].productName,
    brand: "로케트",
    batteryCode: BATTERY_CODE,
    internetPrice: amounts.internetPrice,
    onsitePrice: amounts.onsitePrice,
    fulfillmentType: "store_install",
    returnBatteryOption: "return",
    deliveryFee: amounts.deliveryFee,
    storeInstallDiscount: amounts.storeInstallDiscount,
    batteryReturnFee: amounts.batteryReturnFee,
    finalAmount: amounts.finalAmount,
    selectedStore: "hakjang",
    store: "학장점",
    requestMemo: ADMIN_UX_REVIEW_MEMO,
    itemsJson: items,
    priceLines: amounts.priceLines,
    statusHistory: [
      {
        status: "payment_completed",
        paymentStatus: "completed",
        note: ADMIN_UX_REVIEW_MEMO,
        at: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

async function findExisting(pgOrder) {
  const byNumber = await pgOrder.pgStoreCommerceOrderLookupByRef(ORDER_NUMBER);
  if (byNumber) return byNumber;
  const byId = await pgOrder.pgStoreCommerceOrderGet(ORDER_ID);
  if (byId && isAdminUxReviewTestOrder(byId)) return byId;
  return null;
}

async function main() {
  const amounts = computeServerOrderAmount([buildCartItem()], "store_install", "return");
  const payload = buildRecord(amounts);

  console.log(`create-admin-test-order: ${apply ? "APPLY" : "DRY-RUN"}`);
  console.log(`target orderNumber=${ORDER_NUMBER} orderId=${ORDER_ID}`);
  console.log(
    `product=${payload.productName} store=${payload.store} amount=${payload.finalAmount?.toLocaleString("ko-KR")}원`,
  );
  console.log(`vehicle=${payload.vehicleName} ${payload.vehicleYear} ${payload.vehicleFuel}`);
  console.log(JSON.stringify(payload, null, 2));

  if (!apply) {
    console.log("\n--apply 없음 · DB 변경 없음");
    return;
  }

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("[create-admin-test-order] DATABASE_URL missing");
    process.exit(1);
  }

  const pgOrder = await import("../src/lib/payment/commerce-order-store.postgres.ts");
  const { ensureCommerceSchema } = await import("../src/lib/db/ensure-commerce-schema.ts");
  await ensureCommerceSchema();
  const existing = await findExisting(pgOrder);

  if (existing) {
    console.log(`\n기존 UX 검수 테스트 주문 발견 — 중복 생성 skip`);
    console.log(`  orderId=${existing.orderId}`);
    console.log(`  orderNumber=${existing.orderNumber}`);
    return;
  }

  const created = await pgOrder.pgStoreCommerceOrderCreate(payload);
  console.log("\n생성 완료 1건");
  console.log(`  orderId=${created.orderId}`);
  console.log(`  orderNumber=${created.orderNumber}`);
}

main().catch((err) => {
  console.error("[create-admin-test-order] failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
