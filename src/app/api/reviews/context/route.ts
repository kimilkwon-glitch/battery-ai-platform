import { NextResponse } from "next/server";
import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import { reviewExistsForOrder } from "@/lib/cms/customer-review-store.postgres";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { normalizePhoneDigits } from "@/lib/order-request/order-request-lookup";
import { fulfillmentTypeLabel, orderStatusLabel } from "@/lib/orders/commerce-order-mine";
import type { ReviewWriteOrderContext } from "@/lib/reviews/review-write-types";
import {
  storeCommerceOrderGet,
  storeCommerceOrderLookupByRef,
} from "@/lib/payment/commerce-order-store";

export const dynamic = "force-dynamic";

const ELIGIBLE_STATUSES = new Set(["completed", "payment_completed", "shipping"]);

function maskOrderNumber(orderNumber: string): string {
  const trimmed = orderNumber.trim();
  if (trimmed.length <= 8) return trimmed;
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}

function toContext(order: NonNullable<Awaited<ReturnType<typeof storeCommerceOrderGet>>>): ReviewWriteOrderContext {
  return {
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    orderNumberShort: maskOrderNumber(order.orderNumber),
    productName: order.productName,
    brand: order.brand,
    batteryCode: order.batteryCode,
    vehicleName: order.vehicleName ?? undefined,
    fulfillmentLabel: fulfillmentTypeLabel(order.fulfillmentType),
    serviceType: order.fulfillmentType,
    createdAt: order.createdAt,
    orderStatusLabel: orderStatusLabel(order.orderStatus),
    eligible: ELIGIBLE_STATUSES.has(order.orderStatus),
    alreadyReviewed: false,
  };
}

export async function GET(request: Request) {
  if (!isPostgresConfigured()) {
    return NextResponse.json(
      { ok: false, message: "후기 작성을 준비 중입니다." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const orderIdParam = searchParams.get("orderId")?.trim();
  const orderNumber = searchParams.get("orderNumber")?.trim();
  const contact = searchParams.get("contact")?.trim();

  const session = await getVerifiedCustomerSessionFromRequest(request);
  let order = orderIdParam ? await storeCommerceOrderGet(orderIdParam) : null;

  if (!order && orderNumber && contact) {
    const ref = await storeCommerceOrderLookupByRef(orderNumber);
    const inputDigits = normalizePhoneDigits(contact);
    const storedDigits = ref ? normalizePhoneDigits(ref.customerPhone) : "";
    if (ref && storedDigits === inputDigits) {
      order = ref;
    }
  }

  if (!order) {
    return NextResponse.json({ ok: false, message: "주문 정보를 불러올 수 없습니다." }, { status: 404 });
  }

  if (session && order.userId && order.userId !== session.userId) {
    return NextResponse.json({ ok: false, message: "본인 주문만 확인할 수 있습니다." }, { status: 403 });
  }

  const context = toContext(order);
  context.alreadyReviewed = await reviewExistsForOrder(order.orderId);

  return NextResponse.json({ ok: true, context });
}
