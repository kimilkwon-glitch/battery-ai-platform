/** 주문 클레임 — 취소/반품/환불/교환 */

export type ClaimType = "CANCEL" | "RETURN" | "REFUND" | "EXCHANGE" | "OTHER";

export type ClaimStatus =
  | "REQUESTED"
  | "REVIEWING"
  | "APPROVED"
  | "REJECTED"
  | "RETURN_PICKUP_PENDING"
  | "RETURN_RECEIVED"
  | "REFUNDED"
  | "COMPLETED";

export type ClaimReasonCode =
  | "change_of_mind"
  | "order_mistake"
  | "wrong_spec"
  | "delivery_delay"
  | "damaged"
  | "defective"
  | "wrong_delivery"
  | "battery_return"
  | "need_consult"
  | "other";

export const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  CANCEL: "주문취소",
  RETURN: "반품",
  REFUND: "환불",
  EXCHANGE: "교환",
  OTHER: "기타문의",
};

/** 고객 화면 노출용 */
export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  REQUESTED: "접수됨",
  REVIEWING: "확인 중",
  APPROVED: "승인됨",
  REJECTED: "거절됨",
  RETURN_PICKUP_PENDING: "반품 수거 중",
  RETURN_RECEIVED: "반품 확인됨",
  REFUNDED: "환불 안내 완료",
  COMPLETED: "처리 완료",
};

/** 관리자 화면 전용 — PG 미연동 시 내부 상태와 실제 환불 구분 */
export const ADMIN_CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  REQUESTED: "접수됨",
  REVIEWING: "확인중",
  APPROVED: "승인",
  REJECTED: "거절",
  RETURN_PICKUP_PENDING: "반품수거중",
  RETURN_RECEIVED: "반품완료",
  REFUNDED: "내부 환불완료 표시",
  COMPLETED: "처리완료",
};

export const ADMIN_CLAIM_STATUS_ACTIONS: { status: ClaimStatus; label: string; hint?: string }[] = [
  { status: "REVIEWING", label: "접수 확인" },
  { status: "APPROVED", label: "승인" },
  { status: "REJECTED", label: "거절" },
  { status: "RETURN_PICKUP_PENDING", label: "반품수거중" },
  { status: "RETURN_RECEIVED", label: "반품완료" },
  {
    status: "REFUNDED",
    label: "환불완료 상태로 변경",
    hint: "내부 클레임 상태만 변경됩니다. 실제 PG 환불은 별도 처리가 필요합니다.",
  },
  { status: "COMPLETED", label: "처리완료" },
];

export const CLAIM_REASON_LABELS: Record<ClaimReasonCode, string> = {
  change_of_mind: "단순 변심",
  order_mistake: "주문 실수",
  wrong_spec: "차량/배터리 규격 오주문",
  delivery_delay: "배송 지연",
  damaged: "상품 파손",
  defective: "상품 불량",
  wrong_delivery: "오배송",
  battery_return: "폐전지 반납 관련",
  need_consult: "상담 필요",
  other: "기타",
};

export const CLAIM_REASON_OPTIONS: ClaimReasonCode[] = [
  "change_of_mind",
  "order_mistake",
  "wrong_spec",
  "delivery_delay",
  "damaged",
  "defective",
  "wrong_delivery",
  "battery_return",
  "need_consult",
  "other",
];

export type ClaimHistoryRecord = {
  id: string;
  claimId: string;
  previousStatus: ClaimStatus | null;
  nextStatus: ClaimStatus;
  memo?: string;
  actorType: "customer" | "admin" | "system";
  actorName?: string;
  createdAt: string;
};

export type CommerceClaimRecord = {
  id: string;
  orderId: string;
  orderNumber: string;
  claimType: ClaimType;
  claimStatus: ClaimStatus;
  reasonCode: ClaimReasonCode;
  reasonText?: string;
  customerMessage: string;
  customerName: string;
  customerPhone: string;
  attachmentUrls: string[];
  adminMemo?: string;
  customerReply?: string;
  needsCustomerNotice?: boolean;
  assignedTo?: string;
  orderStatus: string;
  paymentStatus: string;
  productName: string;
  batteryCode: string;
  fulfillmentType: string;
  returnBatteryOption: string;
  finalAmount: number | null;
  deliveryFee: number;
  promotionDiscountTotal?: number;
  estimatedRefundAmount?: number | null;
  requestedAt: string;
  reviewedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CommerceClaimSummary = {
  id: string;
  orderId: string;
  orderNumber: string;
  claimType: ClaimType;
  claimStatus: ClaimStatus;
  reasonCode: ClaimReasonCode;
  customerName: string;
  customerPhone: string;
  productName: string;
  fulfillmentType: string;
  orderStatus: string;
  paymentStatus: string;
  assignedTo?: string;
  requestedAt: string;
  updatedAt: string;
};
