import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import {
  commerceOrderAdminMetaGet,
  commerceOrderAdminMetaUpsert,
} from "@/lib/admin/commerce-order-admin-meta-store";
import { commerceOrderToAdminMeta } from "@/lib/payment/commerce-order-admin-mapper";
import { getCommerceOrder } from "@/lib/payment/commerce-order-service";
import { storeCommerceOrderGet, storeCommerceOrderUpdate } from "@/lib/payment/commerce-order-store";
import {
  hookAlimtalkOrderCanceled,
  hookAlimtalkOrderConfirmed,
  hookAlimtalkOrderRefunded,
  hookAlimtalkOrderShipped,
} from "@/lib/notifications/alimtalk-hooks.server";
import { notificationLogListForOrder } from "@/lib/notifications/notification-log-store";
import type { CommerceOrderStatus } from "@/types/commerce-payment";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET — 자사몰 주문 결제 상세 (관리자 전용)
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { orderId } = await context.params;
  const order = await getCommerceOrder(orderId);
  if (!order) {
    return NextResponse.json(
      { ok: false, message: "주문을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const adminMeta = await commerceOrderAdminMetaGet(orderId);

  const notificationLogs = await notificationLogListForOrder(orderId);

  return NextResponse.json({
    ok: true,
    order,
    paymentMeta: commerceOrderToAdminMeta(order),
    adminMeta,
    notificationLogs,
  });
}

/**
 * PATCH — 주문 상태·관리자 메모·송장 (내부 저장)
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { orderId } = await context.params;
  let body: {
    orderStatus?: CommerceOrderStatus;
    adminMemo?: string;
    shippingCarrier?: string;
    shippingTrackingNumber?: string;
    courierCode?: string;
    shippedAt?: string;
    statusNote?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const current = await storeCommerceOrderGet(orderId);
  if (!current) {
    return NextResponse.json({ ok: false, message: "주문을 찾을 수 없습니다." }, { status: 404 });
  }

  const prevStatus = current.orderStatus;
  const prevTracking = (await commerceOrderAdminMetaGet(orderId))?.shippingTrackingNumber;

  if (body.orderStatus && body.orderStatus !== current.orderStatus) {
    const now = new Date().toISOString();
    await storeCommerceOrderUpdate(orderId, {
      orderStatus: body.orderStatus,
      statusHistory: [
        ...current.statusHistory,
        {
          status: body.orderStatus,
          paymentStatus: current.paymentStatus,
          note: body.statusNote ?? `관리자 상태 변경: ${body.orderStatus}`,
          at: now,
        },
      ],
    });
  }

  const adminMeta = await commerceOrderAdminMetaUpsert(orderId, {
    adminMemo: body.adminMemo,
    shippingCarrier: body.shippingCarrier,
    shippingTrackingNumber: body.shippingTrackingNumber,
    courierCode: body.courierCode,
    shippedAt: body.shippedAt,
  });

  const order = await getCommerceOrder(orderId);
  if (!order) {
    return NextResponse.json({ ok: false, message: "저장 후 조회에 실패했습니다." }, { status: 500 });
  }

  if (body.orderStatus === "order_confirmed" && prevStatus !== "order_confirmed") {
    hookAlimtalkOrderConfirmed(order);
  }
  if (body.orderStatus === "canceled" && prevStatus !== "canceled") {
    hookAlimtalkOrderCanceled(order);
  }
  if (body.orderStatus === "refunded" && prevStatus !== "refunded") {
    hookAlimtalkOrderRefunded(order);
  }
  const tracking = body.shippingTrackingNumber?.trim() ?? adminMeta.shippingTrackingNumber?.trim();
  const carrier = body.shippingCarrier?.trim() ?? adminMeta.shippingCarrier?.trim();
  if (tracking && carrier && tracking !== (prevTracking ?? "")) {
    hookAlimtalkOrderShipped(order, carrier, tracking);
  }

  const notificationLogs = await notificationLogListForOrder(orderId);

  return NextResponse.json({
    ok: true,
    order,
    paymentMeta: commerceOrderToAdminMeta(order),
    adminMeta,
    notificationLogs,
  });
}
