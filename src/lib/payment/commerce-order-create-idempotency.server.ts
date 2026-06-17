import "server-only";

import type { CommerceOrderRecord } from "@/types/commerce-payment";
import type { CommercePaymentStatus } from "@/types/commerce-order";

/** 결제 완료 전 checkout attempt 재사용 가능 상태 */
export const REUSABLE_CHECKOUT_PAYMENT_STATUSES: CommercePaymentStatus[] = [
  "not_started",
  "preparing",
  "pending",
  "processing",
  "failed",
  "canceled",
  "reconcile_needed",
];

export function isCheckoutAttemptReusable(order: CommerceOrderRecord): boolean {
  return (
    REUSABLE_CHECKOUT_PAYMENT_STATUSES.includes(order.paymentStatus) &&
    order.orderStatus !== "canceled" &&
    order.orderStatus !== "refunded"
  );
}

export function checkoutAttemptMemberMatches(
  order: CommerceOrderRecord,
  memberId?: string | null,
): boolean {
  if (!order.userId?.trim()) return true;
  if (!memberId?.trim()) return false;
  return order.userId.trim() === memberId.trim();
}
