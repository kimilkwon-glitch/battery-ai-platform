import contentWorkbenchJson from "@/data/admin/contentWorkbench.json";
import { toCustomerAltText } from "@/lib/content/customerAltText";
import { SUPPRESS_LEGACY_CONTENT_IMAGES } from "@/lib/media/content-image-policy";
import type {
  AdminContentItem,
  AdminContentType,
  ContentImageStatus,
} from "@/data/admin/adminContent.schema";

export type ContentImageMeta = {
  contentId: string;
  type: AdminContentType;
  title: string;
  thumbnailType: AdminContentItem["thumbnailType"];
  imagePath?: string;
  imageFile?: string;
  imageStatus?: ContentImageStatus;
  altText?: string;
  imageNeeded?: boolean;
};

const WORKBENCH = contentWorkbenchJson as AdminContentItem[];

const byId = new Map<string, AdminContentItem>();
const bySlug = new Map<string, AdminContentItem>();

for (const item of WORKBENCH) {
  if (item?.id) byId.set(item.id, item);
  if (item?.slug) bySlug.set(item.slug, item);
}

/** Q&A 단순 질문글에는 큰 대표 이미지를 붙이지 않음 */
const HERO_IMAGE_TYPES = new Set<AdminContentType>([
  "guide",
  "symptom",
  "photo_analysis",
  "caution",
  "spec_inquiry",
  "shopping_notice",
  "brand_guide",
]);

export function shouldShowContentHeroImage(type: AdminContentType): boolean {
  return HERO_IMAGE_TYPES.has(type);
}

function toMeta(item: AdminContentItem): ContentImageMeta {
  return {
    contentId: item.id,
    type: item.type,
    title: item.title,
    thumbnailType: item.thumbnailType,
    imagePath: item.imagePath,
    imageFile: item.imageFile,
    imageStatus: item.imageStatus,
    altText: item.altText,
    imageNeeded: item.imageNeeded,
  };
}

export function getContentImageMeta(contentId: string): ContentImageMeta | undefined {
  const item = byId.get(contentId);
  return item ? toMeta(item) : undefined;
}

export function getContentImageBySlug(slug: string): ContentImageMeta | undefined {
  const item = bySlug.get(slug);
  return item ? toMeta(item) : undefined;
}

export function getContentImageForSymptomSlug(slug: string): ContentImageMeta | undefined {
  return getContentImageMeta(`symptom-${slug}`) ?? getContentImageBySlug(slug);
}

export function resolveContentCoverImage(contentId: string): {
  showHero: boolean;
  imagePath?: string;
  altText: string;
  imageNeeded: boolean;
  thumbnailType: AdminContentItem["thumbnailType"];
  imageStatus?: ContentImageStatus;
} {
  const meta = getContentImageMeta(contentId);
  if (!meta) {
    return {
      showHero: false,
      altText: "",
      imageNeeded: false,
      thumbnailType: "default",
    };
  }

  const showHero = shouldShowContentHeroImage(meta.type);
  const imageNeeded = meta.imageNeeded ?? showHero;

  return {
    showHero,
    imagePath: SUPPRESS_LEGACY_CONTENT_IMAGES ? undefined : meta.imagePath,
    altText: toCustomerAltText(meta.altText, meta.title),
    imageNeeded: SUPPRESS_LEGACY_CONTENT_IMAGES ? showHero : imageNeeded,
    thumbnailType: meta.thumbnailType,
    imageStatus: meta.imageStatus,
  };
}

export function getContentItemsNeedingDedicatedImage(): AdminContentItem[] {
  return WORKBENCH.filter(
    (item) => item.imageStatus === "temporary" || item.imageStatus === "missing_fallback",
  );
}

export function getAllContentWorkbenchItems(): AdminContentItem[] {
  return WORKBENCH;
}
