import { isAdminTestUnifiedOrder } from "@/lib/admin/order-data-scope";
import type { CommerceOrderAdminMeta } from "@/lib/admin/commerce-order-admin-meta-store";
import {
  matchesWorkbenchView,
  countWorkbenchView,
  parseWorkbenchView,
  type OrderWorkbenchView,
} from "@/lib/admin/order-workbench";
import type { AdminCommerceOrderListItem } from "@/lib/payment/commerce-order-admin-mapper";
import { fulfillmentTypeLabel, orderStatusLabel, paymentStatusLabel } from "@/lib/orders/commerce-order-mine";
import { WORKFLOW_STATUS_LABELS } from "@/lib/order-request/order-request-admin-constants";
import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import type { AdminOrderRequestListItem } from "@/types/order-request";
import { COMMERCE_LIFECYCLE_LABELS, COMMERCE_PAYMENT_STATUS_LABELS } from "@/types/commerce-order";

export type UnifiedOrderChannel = "commerce" | "consultation";

export type UnifiedAdminOrderRow = {
  id: string;
  channel: UnifiedOrderChannel;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerPhone: string;
  customerType: "member" | "guest";
  orderTypeLabel: string;
  productName: string;
  batteryCode: string;
  fulfillmentType: string;
  fulfillmentLabel: string;
  finalAmount: number | null;
  paymentStatus: string;
  paymentStatusLabel: string;
  orderStatus: string;
  orderStatusLabel: string;
  shippingCarrier?: string;
  shippingTrackingNumber?: string;
  isTestOrder: boolean;
};

/** @deprecated — `view` 파라미터 사용 */
export type OrderListStatusFilter =
  | "all"
  | "new"
  | "unpaid_intake"
  | "payment_completed"
  | "order_created"
  | "preparing"
  | "in_progress"
  | "completed"
  | "canceled";

export { parseWorkbenchView, matchesWorkbenchView, countWorkbenchView, type OrderWorkbenchView };

export function commerceToUnifiedRow(
  o: AdminCommerceOrderListItem,
  meta?: CommerceOrderAdminMeta | null,
): UnifiedAdminOrderRow {
  const row: UnifiedAdminOrderRow = {
    id: o.orderId,
    channel: "commerce",
    orderNumber: o.orderNumber,
    createdAt: o.createdAt,
    updatedAt: meta?.updatedAt ?? o.createdAt,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerType: o.customerType === "guest" ? "guest" : "member",
    orderTypeLabel: "자사몰",
    productName: o.productName,
    batteryCode: o.batteryCode,
    fulfillmentType: o.fulfillmentType,
    fulfillmentLabel: fulfillmentTypeLabel(o.fulfillmentType),
    finalAmount: o.finalAmount,
    paymentStatus: o.paymentStatus,
    paymentStatusLabel:
      COMMERCE_PAYMENT_STATUS_LABELS[o.paymentStatus as keyof typeof COMMERCE_PAYMENT_STATUS_LABELS] ??
      paymentStatusLabel(o.paymentStatus),
    orderStatus: o.orderStatus,
    orderStatusLabel:
      COMMERCE_LIFECYCLE_LABELS[o.orderStatus as keyof typeof COMMERCE_LIFECYCLE_LABELS] ??
      orderStatusLabel(o.orderStatus),
    shippingCarrier: meta?.shippingCarrier,
    shippingTrackingNumber: meta?.shippingTrackingNumber,
    isTestOrder: false,
  };
  row.isTestOrder = isAdminTestUnifiedOrder(row);
  return row;
}

export function consultationToUnifiedRow(o: AdminOrderRequestListItem): UnifiedAdminOrderRow {
  const wf = WORKFLOW_STATUS_LABELS[o.status];
  const row: UnifiedAdminOrderRow = {
    id: o.id,
    channel: "consultation",
    orderNumber: o.requestNumber,
    createdAt: o.createdAt,
    updatedAt: o.createdAt,
    customerName: o.customerName,
    customerPhone: o.customerPhoneMasked ?? "—",
    customerType: o.customerType === "guest" ? "guest" : "member",
    orderTypeLabel: "상담주문",
    productName: o.batterySpecSummary,
    batteryCode: o.batterySpecSummary,
    fulfillmentType: o.fulfillmentMethod,
    fulfillmentLabel: FULFILLMENT_METHOD_LABELS[o.fulfillmentMethod] ?? o.fulfillmentMethod,
    finalAmount: o.estimatedTotalWon ?? null,
    paymentStatus: o.status,
    paymentStatusLabel: wf?.label ?? o.status,
    orderStatus: o.status,
    orderStatusLabel: wf?.label ?? o.status,
    isTestOrder: false,
  };
  row.isTestOrder = isAdminTestUnifiedOrder(row);
  return row;
}

/** @deprecated — matchesWorkbenchView 사용 */
export function matchesOrderStatusFilter(row: UnifiedAdminOrderRow, filter: OrderListStatusFilter): boolean {
  const viewMap: Record<OrderListStatusFilter, OrderWorkbenchView> = {
    all: "new_order",
    new: "new_order",
    unpaid_intake: "new_order",
    payment_completed: "new_order",
    order_created: "new_order",
    preparing: "preparing",
    in_progress: "in_progress",
    completed: "completed",
    canceled: "completed",
  };
  return matchesWorkbenchView(row, viewMap[filter]);
}

/** @deprecated */
export function countOrdersByStatusFilter(
  rows: UnifiedAdminOrderRow[],
  filter: OrderListStatusFilter,
): number {
  const viewMap: Record<OrderListStatusFilter, OrderWorkbenchView> = {
    all: "new_order",
    new: "new_order",
    unpaid_intake: "new_order",
    payment_completed: "new_order",
    order_created: "new_order",
    preparing: "preparing",
    in_progress: "in_progress",
    completed: "completed",
    canceled: "completed",
  };
  return countWorkbenchView(rows, viewMap[filter]);
}
