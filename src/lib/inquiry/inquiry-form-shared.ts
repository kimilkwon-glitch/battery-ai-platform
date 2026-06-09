import type { InquiryCategory } from "@/types/customer-inquiry";

export type InquiryChip = {
  id: string;
  label: string;
  category?: InquiryCategory;
};

export const SUPPORT_INQUIRY_CHIPS: InquiryChip[] = [
  { id: "order", label: "주문/배송", category: "order" },
  { id: "spec", label: "규격 문의", category: "battery" },
  { id: "visit", label: "출장 교체", category: "shipping" },
  { id: "return", label: "반납/보증", category: "return" },
  { id: "other", label: "기타", category: "other" },
];

export function getInquiryPageUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location.href;
}

export function inquiryTitleFromMessage(message: string, fallback = "상품 문의"): string {
  const line = message.trim().split(/\n/)[0]?.trim() ?? "";
  if (!line) return fallback;
  return line.length > 60 ? `${line.slice(0, 60)}…` : line;
}

export function chipCategory(chipId: string, chips: InquiryChip[]): InquiryCategory {
  return chips.find((c) => c.id === chipId)?.category ?? "other";
}

export function chipLabel(chipId: string, chips: InquiryChip[]): string {
  return chips.find((c) => c.id === chipId)?.label ?? "기타";
}
