/** 고객 문의 — 관리자·고객센터 공용 타입 */

export type InquiryStatus = "new" | "in_progress" | "done" | "on_hold";

export type InquiryCategory =
  | "order"
  | "shipping"
  | "battery"
  | "return"
  | "other";

export type InquirySource = "chat" | "support" | "product_detail";

export type CustomerInquiryRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: InquiryStatus;
  category: InquiryCategory;
  name: string;
  contact: string;
  vehicle?: string;
  message: string;
  batteryCode?: string;
  returnOption?: string;
  pageUrl?: string;
  source?: InquirySource;
  /** 레거시 문자열 유형 (category 미매핑 시 표시) */
  inquiryType?: string;
  couponCode?: string;
  adminMemo?: string;
};

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "신규",
  in_progress: "확인중",
  done: "처리완료",
  on_hold: "보류",
};

export const INQUIRY_CATEGORY_LABELS: Record<InquiryCategory, string> = {
  order: "주문",
  shipping: "배송/방문",
  battery: "배터리",
  return: "반품/보증",
  other: "기타",
};

export function normalizeInquiryCategory(
  raw?: string | InquiryCategory | null,
): InquiryCategory {
  if (!raw) return "other";
  const v = raw.trim().toLowerCase();
  if (v === "order" || v === "주문") return "order";
  if (v === "shipping" || v === "배송/방문" || v === "배송" || v === "방문") return "shipping";
  if (v === "battery" || v === "배터리" || v === "규격") return "battery";
  if (v === "return" || v === "반품/보증" || v === "반품" || v === "보증") return "return";
  if (v === "other" || v === "기타" || v === "일반문의") return "other";
  return "other";
}
