import type { ClaimType } from "@/types/commerce-claim";

export type ClaimUiAction =
  | "cancel_request"
  | "return_refund"
  | "exchange_inquiry"
  | "change_inquiry";

export type ClaimUiPhase =
  | "pre_confirm_cancel"
  | "post_confirm"
  | "shipped"
  | "delivered"
  | "terminal"
  | "none";

const PRE_CONFIRM_STATUSES = new Set([
  "payment_pending",
  "payment_completed",
  "order_created",
  "checkout_draft",
]);

const POST_CONFIRM_STATUSES = new Set([
  "order_confirmed",
  "shipping_prep",
  "visit_scheduled",
  "store_visit_scheduled",
  "preparing",
]);

const SHIPPED_STATUSES = new Set(["shipping", "shipped", "in_transit"]);

const DELIVERED_STATUSES = new Set([
  "work_completed",
  "completed",
  "delivered",
  "picked_up",
  "installation_completed",
]);

const TERMINAL_STATUSES = new Set([
  "canceled",
  "refunded",
  "payment_failed",
  "cancelled",
  "return_completed",
]);

export function resolveClaimUiPhase(orderStatus: string): ClaimUiPhase {
  const s = orderStatus.trim().toLowerCase();
  if (TERMINAL_STATUSES.has(s)) return "terminal";
  if (PRE_CONFIRM_STATUSES.has(s)) return "pre_confirm_cancel";
  if (POST_CONFIRM_STATUSES.has(s)) return "post_confirm";
  if (SHIPPED_STATUSES.has(s)) return "shipped";
  if (DELIVERED_STATUSES.has(s)) return "delivered";
  return "none";
}

export type ClaimUiConfig = {
  phase: ClaimUiPhase;
  actions: ClaimUiAction[];
  hint?: string;
  policyNote?: string;
  showCompletedOnly?: boolean;
};

export function getClaimUiConfig(orderStatus: string): ClaimUiConfig {
  const phase = resolveClaimUiPhase(orderStatus);

  if (phase === "terminal") {
    return {
      phase,
      actions: [],
      showCompletedOnly: true,
      hint: "처리가 완료된 주문입니다.",
    };
  }

  if (phase === "pre_confirm_cancel") {
    return {
      phase,
      actions: ["cancel_request"],
      hint: "발주확인 전 주문은 취소 요청이 가능합니다.",
      policyNote: "주문 상태에 따라 취소 또는 반품/환불 요청이 가능합니다.",
    };
  }

  if (phase === "post_confirm") {
    return {
      phase,
      actions: ["change_inquiry", "return_refund"],
      hint: "발주확인 이후에는 상품 준비가 진행되어 요청 접수 후 확인이 필요합니다.",
      policyNote: "장착 또는 사용 흔적이 있는 배터리는 상품 특성상 반품이 제한될 수 있습니다.",
    };
  }

  if (phase === "shipped") {
    return {
      phase,
      actions: ["return_refund"],
      hint: "발송 이후에는 취소가 아닌 반품/환불 요청으로 접수됩니다.",
      policyNote: "장착 또는 사용 흔적이 있는 배터리는 상품 특성상 반품이 제한될 수 있습니다.",
    };
  }

  if (phase === "delivered") {
    return {
      phase,
      actions: ["return_refund", "exchange_inquiry"],
      hint: "수령/장착 완료 후 반품/환불 또는 교환 문의가 가능합니다.",
      policyNote: "장착 또는 사용 흔적이 있는 배터리는 상품 특성상 반품이 제한될 수 있습니다.",
    };
  }

  return {
    phase,
    actions: ["return_refund"],
    hint: "요청 유형을 선택해 접수해 주세요.",
  };
}

export function claimTypeForAction(action: ClaimUiAction): ClaimType {
  if (action === "cancel_request") return "CANCEL";
  if (action === "exchange_inquiry") return "EXCHANGE";
  if (action === "change_inquiry") return "OTHER";
  return "RETURN";
}

export function defaultClaimTypesForPhase(phase: ClaimUiPhase): ClaimType[] {
  if (phase === "pre_confirm_cancel") return ["CANCEL"];
  if (phase === "post_confirm") return ["OTHER", "RETURN", "REFUND"];
  if (phase === "shipped") return ["RETURN", "REFUND"];
  if (phase === "delivered") return ["RETURN", "REFUND", "EXCHANGE"];
  return ["OTHER"];
}

export function actionButtonLabel(action: ClaimUiAction): string {
  if (action === "cancel_request") return "주문취소 요청";
  if (action === "return_refund") return "반품/환불 요청";
  if (action === "exchange_inquiry") return "교환 문의";
  return "취소/변경 문의";
}
