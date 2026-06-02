import type { ReviewItem } from "@/lib/reviews-mock-data";

export const REVIEW_MAX_IMAGES = 5;

export function reviewHasImages(item: ReviewItem): boolean {
  return reviewGalleryImages(item).length > 0;
}

/** 최대 5장 — 카드·갤러리 공통 */
export function reviewGalleryImages(item: ReviewItem): string[] {
  return (item.images ?? []).filter(Boolean).slice(0, REVIEW_MAX_IMAGES);
}

export function reviewPrimaryImage(item: ReviewItem): string | undefined {
  return reviewGalleryImages(item)[0];
}

export function reviewExtraImageCount(item: ReviewItem): number {
  const n = reviewGalleryImages(item).length;
  return n > 1 ? n - 1 : 0;
}

/** 차량·규격·지점 기반 alt */
export function reviewImageAlt(item: ReviewItem, index = 0): string {
  const vehicle = item.vehicleName?.trim();
  const code = item.batteryCode?.trim();
  const branch = item.branchName?.trim();
  const parts = [vehicle, code, branch].filter(Boolean);
  const base = parts.length === 0 ? "배터리 교체 후기 사진" : `${parts.join(" ")} 교체 후기 사진`;
  const total = reviewGalleryImages(item).length;
  if (total <= 1) return base;
  return `${base} (${index + 1}/${total})`;
}

export function reviewDisplayAuthor(item: ReviewItem): string {
  return item.customerName?.trim() || "고객";
}

export function reviewDisplayDate(item: ReviewItem): string {
  return item.createdAt?.trim() || "";
}
