import { NextResponse } from "next/server";
import { reviewExistsForOrder } from "@/lib/cms/customer-review-store.postgres";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { fulfillmentTypeLabel, orderStatusLabel } from "@/lib/orders/commerce-order-mine";
import type { ReviewWriteOrderContext } from "@/lib/reviews/review-write-types";
import { resolveReviewWriteOrder } from "@/lib/reviews/review-write-access.server";
import type { CommerceOrderRecord } from "@/types/commerce-payment";

export const dynamic = "force-dynamic";

const ELIGIBLE_STATUSES = new Set(["completed", "payment_completed", "shipping"]);

function maskOrderNumber(orderNumber: string): string {
  const trimmed = orderNumber.trim();
  if (trimmed.length <= 8) return trimmed;
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}

function toContext(order: CommerceOrderRecord): ReviewWriteOrderContext {
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

  const access = await resolveReviewWriteOrder(request, {
    orderId: orderIdParam,
    orderNumber,
    contact,
  });
  if (!access.ok) {
    return NextResponse.json({ ok: false, message: access.message }, { status: access.status });
  }
  const order = access.order;

  const context = toContext(order);
  context.alreadyReviewed = await reviewExistsForOrder(order.orderId);

  return NextResponse.json({ ok: true, context });
}
