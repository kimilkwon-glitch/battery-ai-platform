import { NextResponse } from "next/server";
import { isAdminTestCommerceOrder } from "@/lib/admin/admin-test-data-filter";
import { commerceOrderAdminMetaGet } from "@/lib/admin/commerce-order-admin-meta-store";
import { commerceOrderToGuestLookupResult } from "@/lib/orders/commerce-order-mine";
import {
  isValidCustomerLookupInput,
  normalizeCustomerLookupName,
  normalizeCustomerLookupPhone,
} from "@/lib/orders/customer-lookup-identity";
import { storeCommerceOrderLookupByCustomerIdentity } from "@/lib/payment/commerce-order-store";
import { attachGuestCustomerAccessCookie } from "@/lib/security/guest-order-access.server";
import { hashRateLimitIdentity } from "@/lib/security/rate-limit-hash.server";
import { enforceRateLimitOrNull } from "@/lib/security/rate-limit-guard.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NOT_FOUND_MESSAGE = "입력하신 정보와 일치하는 주문을 찾을 수 없습니다.";
const LOOKUP_RATE_LIMIT = 20;
const LOOKUP_RATE_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const ipBlocked = await enforceRateLimitOrNull({
    request,
    namespace: "orders.lookup",
    limit: LOOKUP_RATE_LIMIT,
    windowMs: LOOKUP_RATE_WINDOW_MS,
    message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  });
  if (ipBlocked) return ipBlocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: NOT_FOUND_MESSAGE }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const customerName = normalizeCustomerLookupName(String(b.customerName ?? b.name ?? ""));
  const phoneDigits = normalizeCustomerLookupPhone(String(b.phone ?? ""));

  if (!isValidCustomerLookupInput(customerName, phoneDigits)) {
    return NextResponse.json({ ok: false, message: NOT_FOUND_MESSAGE }, { status: 422 });
  }

  const identityHash = hashRateLimitIdentity(
    "orders.lookup",
    "identity",
    customerName,
    phoneDigits.slice(-4),
  );
  const identityBlocked = await enforceRateLimitOrNull({
    request,
    namespace: "orders.lookup",
    limit: 10,
    windowMs: LOOKUP_RATE_WINDOW_MS,
    ipOnly: false,
    parts: ["identity", identityHash],
    message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  });
  if (identityBlocked) return identityBlocked;

  try {
    const records = await storeCommerceOrderLookupByCustomerIdentity(customerName, phoneDigits);
    const visible = records.filter(
      (record) =>
        !isAdminTestCommerceOrder({
          orderNumber: record.orderNumber,
          customerName: record.customerName,
          customerPhone: record.customerPhone,
          requestMemo: record.requestMemo,
          productName: record.productName,
        }),
    );

    if (visible.length === 0) {
      return NextResponse.json({ ok: false, message: NOT_FOUND_MESSAGE }, { status: 404 });
    }

    const orders = await Promise.all(
      visible.map(async (record) => {
        const adminMeta = await commerceOrderAdminMetaGet(record.orderId);
        return commerceOrderToGuestLookupResult(record, adminMeta);
      }),
    );

    const response = NextResponse.json({ ok: true, orders, count: orders.length });
    await attachGuestCustomerAccessCookie(response, customerName, phoneDigits);
    return response;
  } catch {
    return NextResponse.json(
      { ok: false, message: "조회 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
