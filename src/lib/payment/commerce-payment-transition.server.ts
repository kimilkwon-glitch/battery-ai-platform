import "server-only";

import type {
  CommerceOrderLifecycleStatus,
  CommercePaymentStatus,
} from "@/types/commerce-order";

/** 결제 완료 이후 역행 fail·pending 덮어쓰기 금지 */
export function isPaymentStatusTerminal(paymentStatus: CommercePaymentStatus): boolean {
  return paymentStatus === "completed" || paymentStatus === "refunded";
}

export function canRecordPaymentFail(paymentStatus: CommercePaymentStatus): boolean {
  return (
    paymentStatus === "not_started" ||
    paymentStatus === "preparing" ||
    paymentStatus === "pending" ||
    paymentStatus === "processing" ||
    paymentStatus === "failed" ||
    paymentStatus === "canceled" ||
    paymentStatus === "reconcile_needed"
  );
}

export function canStartPaymentConfirm(paymentStatus: CommercePaymentStatus): boolean {
  return (
    paymentStatus === "not_started" ||
    paymentStatus === "preparing" ||
    paymentStatus === "pending" ||
    paymentStatus === "failed" ||
    paymentStatus === "canceled" ||
    paymentStatus === "processing" ||
    paymentStatus === "reconcile_needed"
  );
}

const POST_PAYMENT_ORDER_STATUSES: CommerceOrderLifecycleStatus[] = [
  "payment_completed",
  "order_confirmed",
  "preparing",
  "shipping_prep",
  "shipping",
  "shipped",
  "in_transit",
  "visit_scheduled",
  "store_visit_scheduled",
  "delivered",
  "picked_up",
  "work_completed",
  "refunded",
];

export function isOrderLifecyclePastPayment(orderStatus: CommerceOrderLifecycleStatus): boolean {
  return POST_PAYMENT_ORDER_STATUSES.includes(orderStatus);
}
