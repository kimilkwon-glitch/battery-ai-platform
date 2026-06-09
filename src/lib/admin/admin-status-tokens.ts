/** 관리자 콘솔 — 상태 배지·버튼 위계 공통 토큰 */

import type { InquiryStatus } from "@/types/customer-inquiry";
import type { VehicleImageReviewStatus } from "@/lib/vehicle-image-review-shared";

export type AdminBadgeTone = "info" | "warning" | "success" | "muted" | "danger";

export const INQUIRY_STATUS_BADGE: Record<InquiryStatus, AdminBadgeTone> = {
  new: "info",
  in_progress: "warning",
  done: "success",
  on_hold: "muted",
};

export const VEHICLE_REVIEW_STATUS_BADGE: Record<VehicleImageReviewStatus, AdminBadgeTone> = {
  pending: "muted",
  reviewing: "warning",
  approved: "success",
  on_hold: "muted",
  regeneration_needed: "danger",
};

export const ORDER_STATUS_BADGE: Record<string, AdminBadgeTone> = {
  pending_review: "info",
  waiting_customer: "warning",
  contacted: "warning",
  quoted: "success",
  closed: "success",
  canceled: "muted",
};

/** 고객 화면 미리보기 — 관리자 내부 링크와 구분 */
export function isCustomerPreviewHref(href: string): boolean {
  if (!href || href.startsWith("/admin")) return false;
  if (href.startsWith("http")) return true;
  return href.startsWith("/");
}
