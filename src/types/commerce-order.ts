/**
 * PG 연동 전 — 자사몰 주문·결제 데이터 구조 (관리자·API 확장용)
 */
import type { BatteryCartItem, FulfillmentMethod } from "@/types/cart";
import type { OrderRequestCustomerType, OrderRequestUsedBatteryOption } from "@/types/order-request";

/** 장바구니 → 주문서 → 결제 전체 라이프사이클 */
export type CommerceOrderLifecycleStatus =
  | "cart"
  | "checkout_draft"
  | "payment_pending"
  | "payment_completed"
  | "payment_failed"
  | "order_confirmed"
  | "shipping_prep"
  | "visit_scheduled"
  | "store_visit_scheduled"
  | "work_completed"
  | "canceled"
  | "refunded";

export type CommercePaymentStatus =
  | "not_started"
  | "preparing"
  | "pending"
  | "completed"
  | "failed";

export type CommerceOrderPriceSnapshot = {
  internetPrice: number | null;
  onsitePrice: number | null;
  fulfillmentMethod: FulfillmentMethod;
  priceBasisLabel: string;
  fulfillmentLabel: string;
  productAmount: number | null;
  deliveryFee: number;
  storeInstallDiscount: number;
  lineTotal: number | null;
  quantity: number;
};

export type CommerceOrderDraft = {
  id: string;
  orderNumber?: string;
  customerType: OrderRequestCustomerType;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  vehicleName?: string;
  vehicleYear?: string;
  vehicleFuel?: string;
  plateSuffix?: string;
  batterySpec: string;
  brandName?: string;
  usedBatteryReturn: OrderRequestUsedBatteryOption;
  fulfillmentMethod: FulfillmentMethod;
  storeId?: string;
  deliveryAddress?: string;
  visitRegion?: string;
  items: BatteryCartItem[];
  priceLines: CommerceOrderPriceSnapshot[];
  estimatedTotal: number | null;
  lifecycleStatus: CommerceOrderLifecycleStatus;
  paymentStatus: CommercePaymentStatus;
  customerMemo?: string;
  createdAt: string;
  updatedAt: string;
};

export const COMMERCE_LIFECYCLE_LABELS: Record<CommerceOrderLifecycleStatus, string> = {
  cart: "장바구니",
  checkout_draft: "주문서작성",
  payment_pending: "결제대기",
  payment_completed: "결제완료",
  payment_failed: "결제실패",
  order_confirmed: "주문확인",
  shipping_prep: "출고준비",
  visit_scheduled: "출장예약",
  store_visit_scheduled: "매장방문예정",
  work_completed: "작업완료",
  canceled: "취소",
  refunded: "환불",
};

export const COMMERCE_PAYMENT_STATUS_LABELS: Record<CommercePaymentStatus, string> = {
  not_started: "미시작",
  preparing: "결제 준비",
  pending: "결제대기",
  completed: "결제완료",
  failed: "결제실패",
};
