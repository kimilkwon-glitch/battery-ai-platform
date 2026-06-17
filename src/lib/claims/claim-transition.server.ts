import "server-only";

import type { ClaimStatus } from "@/types/commerce-claim";

/** 환불 승인 가능한 선행 클레임 상태 */
export const REFUND_ELIGIBLE_CLAIM_STATUSES: ClaimStatus[] = [
  "REQUESTED",
  "REVIEWING",
  "APPROVED",
  "RETURN_PICKUP_PENDING",
  "RETURN_RECEIVED",
];

/** 환불과 충돌하는 주문 상태 (배송·완료 진행 중) */
export const ORDER_STATUSES_BLOCKING_REFUND = new Set([
  "shipping",
  "shipped",
  "in_transit",
  "delivered",
  "picked_up",
  "work_completed",
  "refunded",
  "canceled",
]);

export function canApproveClaimRefund(orderStatus: string): boolean {
  return !ORDER_STATUSES_BLOCKING_REFUND.has(orderStatus);
}
