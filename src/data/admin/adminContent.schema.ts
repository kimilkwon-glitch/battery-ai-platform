export type AdminContentType =
  | "guide"
  | "qa"
  | "symptom"
  | "photo_analysis"
  | "caution"
  | "spec_inquiry"
  | "shopping_notice"
  | "brand_guide";

export type AdminContentStatus = "draft" | "published" | "hidden" | "needs_review";

export type ContentImageStatus = "exact" | "usable" | "temporary" | "missing_fallback";

export type AdminContentThumbnailType =
  | "guide"
  | "qa"
  | "symptom"
  | "photo_analysis"
  | "caution"
  | "compare"
  | "spec_inquiry"
  | "shopping"
  | "brand"
  | "default";

export type AdminContentItem = {
  id: string;
  type: AdminContentType;
  title: string;
  summary: string;
  body: string;
  category: string;
  tags: string[];
  status: AdminContentStatus;
  relatedVehicleIds: string[];
  relatedBatteryIds: string[];
  relatedSpecIds: string[];
  relatedGuideIds: string[];
  relatedQaIds: string[];
  thumbnailType: AdminContentThumbnailType;
  priority: number;
  updatedAt: string;
  createdAt: string;
  memo: string;
  /** 원본 데이터 파일 경로 */
  sourceFile: string;
  /** 사용자 페이지 상세 경로 */
  slug?: string;
  publicPath?: string;
  /** 대표 이미지 필요 여부 */
  imageNeeded?: boolean;
  /** public 경로 — /assets/content/… */
  imagePath?: string;
  /** 파일명 */
  imageFile?: string;
  /** exact | usable | temporary | missing_fallback */
  imageStatus?: ContentImageStatus;
  altText?: string;
};

export const CONTENT_IMAGE_STATUS_LABELS: Record<ContentImageStatus, string> = {
  exact: "사용 확정",
  usable: "우선 사용 가능",
  temporary: "임시 (교체 권장)",
  missing_fallback: "임시 대체",
};

export const ADMIN_CONTENT_TYPE_LABELS: Record<AdminContentType, string> = {
  guide: "가이드",
  qa: "Q&A",
  symptom: "증상",
  photo_analysis: "사진분석",
  caution: "오주문 방지",
  spec_inquiry: "규격문의",
  shopping_notice: "쇼핑안내",
  brand_guide: "브랜드가이드",
};

export const ADMIN_CONTENT_STATUS_LABELS: Record<AdminContentStatus, string> = {
  draft: "임시저장",
  published: "게시중",
  hidden: "숨김",
  needs_review: "수정 필요",
};

export const ADMIN_CONTENT_THUMBNAIL_LABELS: Record<AdminContentThumbnailType, string> = {
  guide: "가이드",
  qa: "Q&A",
  symptom: "증상",
  photo_analysis: "사진분석",
  caution: "주의",
  compare: "비교",
  spec_inquiry: "규격문의",
  shopping: "쇼핑",
  brand: "브랜드",
  default: "콘텐츠",
};

export function defaultAdminContentItem(partial?: Partial<AdminContentItem>): AdminContentItem {
  const now = new Date().toISOString().slice(0, 10);
  return {
    id: partial?.id ?? `content-${Date.now()}`,
    type: partial?.type ?? "guide",
    title: partial?.title ?? "",
    summary: partial?.summary ?? "",
    body: partial?.body ?? "",
    category: partial?.category ?? "",
    tags: partial?.tags ?? [],
    status: partial?.status ?? "draft",
    relatedVehicleIds: partial?.relatedVehicleIds ?? [],
    relatedBatteryIds: partial?.relatedBatteryIds ?? [],
    relatedSpecIds: partial?.relatedSpecIds ?? [],
    relatedGuideIds: partial?.relatedGuideIds ?? [],
    relatedQaIds: partial?.relatedQaIds ?? [],
    thumbnailType: partial?.thumbnailType ?? "default",
    priority: partial?.priority ?? 0,
    updatedAt: partial?.updatedAt ?? now,
    createdAt: partial?.createdAt ?? now,
    memo: partial?.memo ?? "",
    sourceFile: partial?.sourceFile ?? "",
    slug: partial?.slug,
    publicPath: partial?.publicPath,
    imageNeeded: partial?.imageNeeded,
    imagePath: partial?.imagePath,
    imageFile: partial?.imageFile,
    imageStatus: partial?.imageStatus,
    altText: partial?.altText,
  };
}

export function thumbnailTypeForContentType(type: AdminContentType): AdminContentThumbnailType {
  const map: Record<AdminContentType, AdminContentThumbnailType> = {
    guide: "guide",
    qa: "qa",
    symptom: "symptom",
    photo_analysis: "photo_analysis",
    caution: "caution",
    spec_inquiry: "spec_inquiry",
    shopping_notice: "shopping",
    brand_guide: "brand",
  };
  return map[type] ?? "default";
}
