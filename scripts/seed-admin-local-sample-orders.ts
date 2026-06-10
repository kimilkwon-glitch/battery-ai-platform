/**
 * 로컬 관리자 검수용 실제 주문 샘플 (BM-LOCAL-*, 운영/UX2와 분리)
 * npm run admin:seed-local-samples
 *
 * Idempotent: 동일 order_number / order_id 는 update, 클레임은 유형별 skip.
 */
import "./register-server-only.mjs";
import { existsSync, readFileSync } from "node:fs";
import { computeServerOrderAmount } from "../src/lib/payment/compute-order-amount";
import type { BatteryCartItem } from "../src/types/cart";
import type { CommerceOrderRecord } from "../src/types/commerce-payment";
import type { ClaimType } from "../src/types/commerce-claim";

const LOCAL_PREFIX = "BM-LOCAL-20260610";
const SEED_MEMO = "로컬 관리자 검수 샘플";

let seedSucceeded = false;

function isConnectionCleanupError(reason: unknown): boolean {
  const msg = reason instanceof Error ? reason.message : String(reason);
  return /Connection terminated unexpectedly|Unhandled error/i.test(msg);
}

function assertLocalAdminSeedSafe(): void {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  if (nodeEnv === "production") {
    console.error(
      "[seed-admin-local-sample-orders] BLOCKED: NODE_ENV=production 에서는 실행할 수 없습니다.",
    );
    process.exit(1);
  }

  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "production") {
    console.error(
      "[seed-admin-local-sample-orders] BLOCKED: VERCEL_ENV=production 에서는 실행할 수 없습니다.",
    );
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) {
    console.error("[seed-admin-local-sample-orders] DATABASE_URL missing");
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
      console.error(
        "[seed-admin-local-sample-orders] BLOCKED: DATABASE_URL 이 production DATABASE_URL 과 동일합니다.",
      );
      process.exit(1);
    }
  }

  const blockedSubstrings = (process.env.ADMIN_LOCAL_SEED_BLOCKED_URL_SUBSTRINGS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const lowerUrl = dbUrl.toLowerCase();
  for (const marker of blockedSubstrings) {
    if (lowerUrl.includes(marker.toLowerCase())) {
      console.error(
        `[seed-admin-local-sample-orders] BLOCKED: DATABASE_URL 에 차단 마커가 포함되어 있습니다 (${marker}).`,
      );
      process.exit(1);
    }
  }

  let host = "(invalid-url)";
  try {
    host = new URL(dbUrl).hostname;
  } catch {
    console.error("[seed-admin-local-sample-orders] BLOCKED: DATABASE_URL 형식이 올바르지 않습니다.");
    process.exit(1);
  }

  console.log("[seed-admin-local-sample-orders] safety check passed — 로컬 검수 샘플만 생성합니다.");
  console.log(`  NODE_ENV=${nodeEnv}`);
  console.log(`  VERCEL_ENV=${vercelEnv ?? "(unset)"}`);
  console.log(`  DATABASE host=${host}`);
  console.log(`  order prefix=${LOCAL_PREFIX}`);
}

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

type SampleSpec = {
  seq: number;
  customerName: string;
  phone: string;
  batteryCode: string;
  fulfillment: BatteryCartItem["fulfillment"]["method"];
  orderStatus: CommerceOrderRecord["orderStatus"];
  paymentStatus: CommerceOrderRecord["paymentStatus"];
  vehicleName: string;
};

const SAMPLES: SampleSpec[] = [
  {
    seq: 1,
    customerName: "김상호",
    phone: "01055551001",
    batteryCode: "AGM80L",
    fulfillment: "delivery",
    orderStatus: "payment_completed",
    paymentStatus: "completed",
    vehicleName: "그랜저 IG",
  },
  {
    seq: 2,
    customerName: "이정민",
    phone: "01055551002",
    batteryCode: "AGM60L",
    fulfillment: "delivery",
    orderStatus: "preparing",
    paymentStatus: "completed",
    vehicleName: "레이",
  },
  {
    seq: 3,
    customerName: "박미경",
    phone: "01055551003",
    batteryCode: "100R",
    fulfillment: "visit_install",
    orderStatus: "visit_scheduled",
    paymentStatus: "completed",
    vehicleName: "포터2",
  },
  {
    seq: 4,
    customerName: "최동훈",
    phone: "01055551004",
    batteryCode: "DIN74L",
    fulfillment: "store_install",
    orderStatus: "work_completed",
    paymentStatus: "completed",
    vehicleName: "쏠나타 DN8",
  },
];

function stableOrderId(seq: number): string {
  return `co_local_sample_${String(seq).padStart(3, "0")}`;
}

function stableOrderNumber(seq: number): string {
  return `${LOCAL_PREFIX}-${String(seq).padStart(4, "0")}`;
}

function buildCartItem(spec: SampleSpec): BatteryCartItem {
  return {
    id: `cart_local_${spec.seq}`,
    productId: spec.batteryCode,
    productName: `로케트 ${spec.batteryCode} 자동차 배터리`,
    brandName: "로케트",
    batterySpec: spec.batteryCode,
    quantity: 1,
    fitmentStatus: "confirmed",
    usedBatteryReturn: { option: "return", guideRequired: true },
    fulfillment: { method: spec.fulfillment },
    vehicle: { displayName: spec.vehicleName },
  };
}

function buildRecord(spec: SampleSpec, existing?: CommerceOrderRecord | null): CommerceOrderRecord {
  const items = [buildCartItem(spec)];
  const amounts = computeServerOrderAmount(items, spec.fulfillment, "return");
  if (amounts.finalAmount == null) {
    throw new Error(`금액 계산 실패: seq ${spec.seq}`);
  }

  const now = new Date().toISOString();
  const orderId = existing?.orderId ?? stableOrderId(spec.seq);
  const orderNumber = stableOrderNumber(spec.seq);

  return {
    orderId,
    orderNumber,
    orderStatus: spec.orderStatus,
    paymentStatus: spec.paymentStatus,
    customerName: spec.customerName,
    customerPhone: spec.phone,
    customerType: "guest",
    vehicleName: spec.vehicleName,
    productName: items[0]!.productName,
    brand: "로케트",
    batteryCode: spec.batteryCode,
    internetPrice: amounts.internetPrice,
    onsitePrice: amounts.onsitePrice,
    fulfillmentType: spec.fulfillment,
    returnBatteryOption: "return",
    deliveryFee: amounts.deliveryFee,
    storeInstallDiscount: amounts.storeInstallDiscount,
    batteryReturnFee: amounts.batteryReturnFee,
    finalAmount: amounts.finalAmount,
    address: spec.fulfillment === "delivery" ? "부산시 북구 덕천로 120" : undefined,
    requestMemo: SEED_MEMO,
    itemsJson: items,
    priceLines: amounts.priceLines,
    statusHistory: existing?.statusHistory?.length
      ? existing.statusHistory
      : [
          {
            status: spec.orderStatus,
            paymentStatus: spec.paymentStatus,
            note: SEED_MEMO,
            at: now,
          },
        ],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

async function upsertSampleOrder(
  pgOrder: typeof import("../src/lib/payment/commerce-order-store.postgres"),
  spec: SampleSpec,
): Promise<{ record: CommerceOrderRecord; action: "created" | "updated" }> {
  const orderNumber = stableOrderNumber(spec.seq);
  const existing = await pgOrder.pgStoreCommerceOrderLookupByRef(orderNumber);
  const record = buildRecord(spec, existing);

  if (existing) {
    const updated = await pgOrder.pgStoreCommerceOrderUpdate(existing.orderId, record);
    if (!updated) throw new Error(`주문 업데이트 실패: ${orderNumber}`);
    return { record: updated, action: "updated" };
  }

  const created = await pgOrder.pgStoreCommerceOrderCreate(record);
  return { record: created, action: "created" };
}

async function ensureSampleClaim(
  pgClaim: typeof import("../src/lib/claims/claim-store.postgres"),
  order: CommerceOrderRecord,
  claimType: ClaimType,
  customerMessage: string,
  reasonCode: "CHANGE_MIND" | "DEFECTIVE",
): Promise<"created" | "skipped"> {
  const existing = await pgClaim.claimListByOrderId(order.orderId);
  if (existing.some((c) => c.claimType === claimType)) {
    return "skipped";
  }
  await pgClaim.claimCreate({
    claimType,
    reasonCode,
    customerMessage,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    order,
  });
  return "created";
}

async function main(): Promise<void> {
  assertLocalAdminSeedSafe();

  const pgOrder = await import("../src/lib/payment/commerce-order-store.postgres");
  const pgClaim = await import("../src/lib/claims/claim-store.postgres");

  const saved: CommerceOrderRecord[] = [];
  const orderActions: Array<{ orderNumber: string; action: string }> = [];

  for (const spec of SAMPLES) {
    const { record, action } = await upsertSampleOrder(pgOrder, spec);
    saved.push(record);
    orderActions.push({ orderNumber: record.orderNumber, action });
    console.log(`order ${record.orderNumber} (${record.orderStatus}) — ${action}`);
  }

  const newOrder = saved.find((o) => o.orderStatus === "payment_completed");
  const preparingOrder = saved.find((o) => o.orderStatus === "preparing");

  const claimActions: string[] = [];
  if (newOrder) {
    const claimAction = await ensureSampleClaim(
      pgClaim,
      newOrder,
      "CANCEL",
      "로컬 검수 — 취소 요청 샘플",
      "CHANGE_MIND",
    );
    claimActions.push(`CANCEL:${claimAction}`);
    console.log(`claim CANCEL on ${newOrder.orderNumber} — ${claimAction}`);
  }

  if (preparingOrder) {
    const claimAction = await ensureSampleClaim(
      pgClaim,
      preparingOrder,
      "RETURN",
      "로컬 검수 — 반품 요청 샘플",
      "DEFECTIVE",
    );
    claimActions.push(`RETURN:${claimAction}`);
    console.log(`claim RETURN on ${preparingOrder.orderNumber} — ${claimAction}`);
  }

  if (saved.length !== SAMPLES.length) {
    throw new Error(`샘플 주문 수 불일치: expected ${SAMPLES.length}, got ${saved.length}`);
  }

  const prefixCount = await pgOrder.pgStoreCommerceOrderCountByPrefix(LOCAL_PREFIX);
  if (prefixCount > SAMPLES.length) {
    console.warn(
      `[seed-admin-local-sample-orders] warning: prefix ${LOCAL_PREFIX} 주문이 ${prefixCount}건입니다 (기대 ${SAMPLES.length}). 이전 중복 시드가 남아 있을 수 있습니다.`,
    );
  }

  console.log(
    JSON.stringify(
      {
        prefix: LOCAL_PREFIX,
        orders: saved.length,
        claims: claimActions.filter((a) => a.endsWith(":created")).length,
        orderNumbers: saved.map((o) => o.orderNumber),
        orderActions,
        claimActions,
        idempotent: true,
      },
      null,
      2,
    ),
  );

  seedSucceeded = true;
}

process.on("unhandledRejection", (reason) => {
  if (seedSucceeded && isConnectionCleanupError(reason)) {
    console.warn(
      "[seed-admin-local-sample-orders] warning: DB 연결 종료 중 오류 무시 (데이터 생성은 완료됨)",
    );
    process.exit(0);
  }
});

main()
  .then(() => {
    setTimeout(() => process.exit(0), 200);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
