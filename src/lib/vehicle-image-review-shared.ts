/** 차량 이미지 검수 — 클라이언트·서버 공용 타입 */

export type VehicleImageReviewStatus =
  | "pending"
  | "reviewing"
  | "approved"
  | "on_hold"
  | "regeneration_needed";

export type VehicleImageReviewRecord = {
  slug: string;
  status: VehicleImageReviewStatus;
  adminMemo: string;
  selectedReferenceUrl?: string | null;
  candidateImageUrl?: string | null;
  updatedAt: string;
};

export const VEHICLE_IMAGE_REVIEW_STATUS_LABELS: Record<VehicleImageReviewStatus, string> = {
  pending: "대기",
  reviewing: "검수중",
  approved: "승인",
  on_hold: "보류",
  regeneration_needed: "재생성 필요",
};
