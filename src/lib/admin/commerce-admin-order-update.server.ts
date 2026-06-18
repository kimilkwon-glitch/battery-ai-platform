import "server-only";

import { isOrderLifecyclePastPayment } from "@/lib/payment/commerce-payment-transition.server";
import type { CommerceOrderLifecycleStatus } from "@/types/commerce-order";
import type { CommerceOrderRecord } from "@/types/commerce-payment";

const TERMINAL_ORDER_STATUSES = new Set<CommerceOrderLifecycleStatus>([
  "canceled",
  "refunded",
  "delivered",
  "picked_up",
  "work_completed",
]);

export function validateAdminOrderStatusChange(
  current: CommerceOrderLifecycleStatus,
  next: CommerceOrderLifecycleStatus,
): { ok: true } | { ok: false; message: string; code: string } {
  if (current === next) return { ok: true };

  if (TERMINAL_ORDER_STATUSES.has(current) && !TERMINAL_ORDER_STATUSES.has(next)) {
    return {
      ok: false,
      message: "완료·취소된 주문은 이전 단계로 되돌릴 수 없습니다.",
      code: "STATUS_REGRESSION_BLOCKED",
    };
  }

  if (
    isOrderLifecyclePastPayment(current) &&
    (next === "payment_pending" || next === "payment_failed")
  ) {
    return {
      ok: false,
      message: "결제 완료 이후 주문은 결제 대기 상태로 되돌릴 수 없습니다.",
      code: "STATUS_REGRESSION_BLOCKED",
    };
  }

  if (current === "refunded" || next === "refunded") {
    if (current === "refunded" && next !== "refunded") {
      return {
        ok: false,
        message: "환불 완료 주문의 상태를 변경할 수 없습니다.",
        code: "STATUS_REGRESSION_BLOCKED",
      };
    }
  }

  const fulfillmentForward: Partial<Record<CommerceOrderLifecycleStatus, number>> = {
    payment_completed: 1,
    order_confirmed: 2,
    preparing: 3,
    in_transit: 4,
    shipping: 5,
    delivered: 6,
    picked_up: 6,
    work_completed: 6,
  };
  const curRank = fulfillmentForward[current];
  const nextRank = fulfillmentForward[next];
  if (
    curRank != null &&
    nextRank != null &&
    nextRank < curRank &&
    !TERMINAL_ORDER_STATUSES.has(next)
  ) {
    return {
      ok: false,
      message: "배송·완료 진행 중인 주문은 이전 단계로 되돌릴 수 없습니다.",
      code: "STATUS_REGRESSION_BLOCKED",
    };
  }

  return { ok: true };
}

export function assertAdminOrderNotStale(
  current: CommerceOrderRecord,
  expectedUpdatedAt?: string | null,
): { ok: true } | { ok: false; message: string; code: string } {
  const expected = expectedUpdatedAt?.trim();
  if (!expected) return { ok: true };

  const currentIso = new Date(current.updatedAt).toISOString();
  const expectedIso = new Date(expected).toISOString();
  if (currentIso !== expectedIso) {
    return {
      ok: false,
      message: "다른 관리자가 먼저 수정했습니다. 최신 정보를 확인한 뒤 다시 시도해 주세요.",
      code: "STALE_UPDATE",
    };
  }
  return { ok: true };
}
