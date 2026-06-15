import { isAdminTestCommerceOrder } from "@/lib/admin/admin-test-data-filter";

export const DELIVERY_SYNC_MAX_LIMIT = 20;
export const DELIVERY_SYNC_DEFAULT_LIMIT = 10;

export const DELIVERY_SYNC_ELIGIBLE_STATUSES = new Set([
  "shipping",
  "shipped",
  "in_transit",
]);

export const DELIVERY_SYNC_BLOCKED_ORDER_STATUSES = new Set([
  "canceled",
  "refunded",
  "delivered",
  "picked_up",
  "work_completed",
  "payment_failed",
]);

export const DELIVERY_SYNC_BLOCKED_PAYMENT_STATUSES = new Set(["canceled", "refunded", "failed"]);

export const DELIVERY_SYNC_RECENT_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type DeliverySyncOrderSnapshot = {
  fulfillmentType: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  orderNumber?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  requestMemo?: string | null;
  productName?: string | null;
};

/** Returns skip reason when order is not eligible; null when eligible (courier/invoice checked separately). */
export function getDeliverySyncSkipReason(
  order: DeliverySyncOrderSnapshot,
  withinDays = true,
): string | null {
  if (
    isAdminTestCommerceOrder({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      requestMemo: order.requestMemo,
      productName: order.productName,
    })
  ) {
    return "테스트/검수 주문입니다.";
  }
  if (order.fulfillmentType !== "delivery") return "택배 주문이 아닙니다.";
  if (DELIVERY_SYNC_BLOCKED_ORDER_STATUSES.has(order.orderStatus)) return "종료·취소 상태입니다.";
  if (DELIVERY_SYNC_BLOCKED_PAYMENT_STATUSES.has(order.paymentStatus)) return "결제 취소·환불 상태입니다.";
  if (!DELIVERY_SYNC_ELIGIBLE_STATUSES.has(order.orderStatus)) return "배송중 상태가 아닙니다.";
  if (withinDays) {
    const age = Date.now() - new Date(order.createdAt).getTime();
    if (age > DELIVERY_SYNC_RECENT_DAYS_MS) return "30일 이전 주문입니다.";
  }
  return null;
}
