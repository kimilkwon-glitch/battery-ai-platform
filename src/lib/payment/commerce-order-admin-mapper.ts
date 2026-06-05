import type { AdminCommercePaymentMeta } from "@/types/commerce-payment";
import type { CommerceOrderRecord } from "@/types/commerce-payment";

export function commerceOrderToAdminMeta(record: CommerceOrderRecord): AdminCommercePaymentMeta {
  return {
    orderNumber: record.orderNumber,
    paymentStatus: record.paymentStatus,
    orderStatus: record.orderStatus,
    estimatedAmount: record.finalAmount,
    paidAmount: record.paidAmount ?? null,
    paymentMethod: record.paymentMethod,
    pgTransactionId: record.pgTransactionId,
    paymentRequestId: record.paymentRequestId,
    paymentFailReason: record.paymentFailReason,
    statusHistory: record.statusHistory,
  };
}

export type AdminCommerceOrderListItem = {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  batteryCode: string;
  fulfillmentType: CommerceOrderRecord["fulfillmentType"];
  orderStatus: CommerceOrderRecord["orderStatus"];
  paymentStatus: CommerceOrderRecord["paymentStatus"];
  finalAmount: number | null;
};

export function commerceOrderToListItem(record: CommerceOrderRecord): AdminCommerceOrderListItem {
  return {
    orderId: record.orderId,
    orderNumber: record.orderNumber,
    createdAt: record.createdAt,
    customerName: record.customerName,
    customerPhone: record.customerPhone,
    productName: record.productName,
    batteryCode: record.batteryCode,
    fulfillmentType: record.fulfillmentType,
    orderStatus: record.orderStatus,
    paymentStatus: record.paymentStatus,
    finalAmount: record.finalAmount,
  };
}
