import type { ReviewItem } from "@/lib/reviews-mock-data";

export function reviewHasImages(item: ReviewItem): boolean {
  return Array.isArray(item.images) && item.images.filter(Boolean).length > 0;
}

export function reviewPrimaryImage(item: ReviewItem): string | undefined {
  return item.images?.find(Boolean);
}

export function reviewExtraImageCount(item: ReviewItem): number {
  const n = item.images?.filter(Boolean).length ?? 0;
  return n > 1 ? n - 1 : 0;
}

/** 차량·규격·지점 기반 alt — placeholder 문구 없음 */
export function reviewImageAlt(item: ReviewItem): string {
  const vehicle = item.vehicleName?.trim();
  const code = item.batteryCode?.trim();
  const branch = item.branchName?.trim();
  const parts = [vehicle, code, branch].filter(Boolean);
  if (parts.length === 0) return "배터리 교체 후기 사진";
  return `${parts.join(" ")} 교체 후기 사진`;
}

export function reviewDisplayAuthor(item: ReviewItem): string {
  return item.customerName?.trim() || "고객";
}

export function reviewDisplayDate(item: ReviewItem): string {
  return item.createdAt?.trim() || "";
}
