import {
  maskCustomerAddressSummary,
  maskCustomerName,
  maskCustomerPhone,
} from "@/lib/orders/commerce-order-lookup-privacy";
import { resolveDeliveryCarrier } from "@/lib/delivery/delivery-carriers";
import { returnBatteryLabel } from "@/lib/payment/commerce-order-admin-mapper";
import { CUSTOMER_FULFILLMENT_LABELS } from "@/lib/pricing/customer-price-labels";
import type { MallOrderMineListItem } from "@/lib/orders/mall-order-api-contract";
import type { CommerceOrderRecord } from "@/types/commerce-payment";
import type { OrderRequestFulfillmentMethod } from "@/types/order-request";
import type { CommerceOrderAdminMeta } from "@/lib/admin/commerce-order-admin-meta-store";

const FULFILLMENT_LABELS: Record<string, string> = {
  delivery: CUSTOMER_FULFILLMENT_LABELS.delivery,
  visit_install: CUSTOMER_FULFILLMENT_LABELS.onsite_install,
  onsite_install: CUSTOMER_FULFILLMENT_LABELS.onsite_install,
  store_install: CUSTOMER_FULFILLMENT_LABELS.store_install,
  store_pickup_self: CUSTOMER_FULFILLMENT_LABELS.store_pickup_self,
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  payment_pending: "결제 대기",
  payment_completed: "결제 완료",
  payment_failed: "결제 실패",
  order_created: "주문 접수",
  preparing: "준비 중",
  shipping: "배송 중",
  completed: "완료",
  canceled: "취소",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  not_started: "결제 전",
  pending: "결제 진행 중",
  completed: "결제 완료",
  failed: "결제 실패",
  canceled: "결제 취소",
  refunded: "환불 완료",
};

export type MallOrderMineListItemExtended = MallOrderMineListItem & {
  brand?: string;
  batteryReturnFee?: number;
  fulfillmentLabel: string;
  returnBatteryLabel: string;
  orderStatusLabel: string;
  paymentStatusLabel: string;
  hasPaymentRequest: boolean;
};

export function fulfillmentTypeLabel(type: string): string {
  return FULFILLMENT_LABELS[type] ?? type;
}

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function paymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

export function commerceOrderToMineListItem(
  record: CommerceOrderRecord,
): MallOrderMineListItemExtended {
  return {
    orderId: record.orderId,
    orderNumber: record.orderNumber,
    productName: record.productName,
    brand: record.brand,
    batteryCode: record.batteryCode,
    fulfillmentType: record.fulfillmentType as MallOrderMineListItem["fulfillmentType"],
    batteryReturnType: record.returnBatteryOption,
    batteryReturnFee: record.batteryReturnFee,
    finalAmount: record.finalAmount,
    orderStatus: record.orderStatus,
    paymentStatus: record.paymentStatus,
    createdAt: record.createdAt,
    fulfillmentLabel: fulfillmentTypeLabel(record.fulfillmentType),
    returnBatteryLabel: returnBatteryLabel(record.returnBatteryOption),
    orderStatusLabel: orderStatusLabel(record.orderStatus),
    paymentStatusLabel: paymentStatusLabel(record.paymentStatus),
    hasPaymentRequest: Boolean(record.paymentRequestId),
  };
}

export type CommerceOrderGuestLookupShipping = {
  courierCode: string;
  courierName: string;
  invoiceNumber: string;
  shippedAt?: string;
};

export type CommerceOrderGuestLookupResult = {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  productName: string;
  brand?: string;
  batteryCode: string;
  fulfillmentType: OrderRequestFulfillmentMethod;
  batteryReturnType: CommerceOrderRecord["returnBatteryOption"];
  batteryReturnFee?: number;
  finalAmount: number | null;
  orderStatus: string;
  paymentStatus: string;
  fulfillmentLabel: string;
  returnBatteryLabel: string;
  orderStatusLabel: string;
  paymentStatusLabel: string;
  customerNameMasked: string;
  customerPhoneMasked: string;
  addressSummary: string;
  selectedStoreLabel?: string;
  shipping?: CommerceOrderGuestLookupShipping;
};

const STORE_LABELS: Record<string, string> = {
  deokcheon: "덕천점",
  hakjang: "학장점",
};

export function commerceOrderToGuestLookupResult(
  record: CommerceOrderRecord,
  adminMeta?: CommerceOrderAdminMeta | null,
): CommerceOrderGuestLookupResult {
  const addressBase = record.address1 ?? record.address;
  const invoiceNumber = adminMeta?.shippingTrackingNumber?.trim();
  const resolved = resolveDeliveryCarrier({
    courierCode: adminMeta?.courierCode,
    courierName: adminMeta?.shippingCarrier,
  });
  const shipping =
    invoiceNumber && resolved
      ? {
          courierCode: resolved.code,
          courierName: resolved.name,
          invoiceNumber,
          shippedAt: adminMeta?.shippedAt,
        }
      : undefined;

  return {
    orderId: record.orderId,
    orderNumber: record.orderNumber,
    createdAt: record.createdAt,
    productName: record.productName,
    brand: record.brand,
    batteryCode: record.batteryCode,
    fulfillmentType: record.fulfillmentType as OrderRequestFulfillmentMethod,
    batteryReturnType: record.returnBatteryOption,
    batteryReturnFee: record.batteryReturnFee,
    finalAmount: record.finalAmount,
    orderStatus: record.orderStatus,
    paymentStatus: record.paymentStatus,
    fulfillmentLabel: fulfillmentTypeLabel(record.fulfillmentType),
    returnBatteryLabel: returnBatteryLabel(record.returnBatteryOption),
    orderStatusLabel: orderStatusLabel(record.orderStatus),
    paymentStatusLabel: paymentStatusLabel(record.paymentStatus),
    customerNameMasked: maskCustomerName(record.customerName),
    customerPhoneMasked: maskCustomerPhone(record.customerPhone),
    addressSummary: maskCustomerAddressSummary(addressBase, record.address2),
    selectedStoreLabel: record.selectedStore
      ? STORE_LABELS[record.selectedStore] ?? record.selectedStore
      : undefined,
    shipping,
  };
}
