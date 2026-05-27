import type { AdminContentThumbnailType } from "@/data/admin/adminContent.schema";
import { ADMIN_CONTENT_THUMBNAIL_LABELS } from "@/data/admin/adminContent.schema";

export type ContentThumbnailVisual = {
  label: string;
  bgClass: string;
  textClass: string;
};

const THUMBNAILS: Record<AdminContentThumbnailType, ContentThumbnailVisual> = {
  guide: { label: "가이드", bgClass: "bg-blue-50 ring-blue-100", textClass: "text-blue-700" },
  qa: { label: "Q&A", bgClass: "bg-violet-50 ring-violet-100", textClass: "text-violet-700" },
  symptom: { label: "증상", bgClass: "bg-rose-50 ring-rose-100", textClass: "text-rose-700" },
  photo_analysis: { label: "사진분석", bgClass: "bg-cyan-50 ring-cyan-100", textClass: "text-cyan-700" },
  caution: { label: "주의", bgClass: "bg-amber-50 ring-amber-100", textClass: "text-amber-800" },
  compare: { label: "비교", bgClass: "bg-indigo-50 ring-indigo-100", textClass: "text-indigo-700" },
  spec_inquiry: { label: "규격문의", bgClass: "bg-slate-100 ring-slate-200", textClass: "text-slate-700" },
  shopping: { label: "쇼핑", bgClass: "bg-emerald-50 ring-emerald-100", textClass: "text-emerald-800" },
  brand: { label: "브랜드", bgClass: "bg-sky-50 ring-sky-100", textClass: "text-sky-800" },
  default: { label: "콘텐츠", bgClass: "bg-slate-50 ring-slate-200", textClass: "text-slate-600" },
};

export function resolveContentThumbnail(type: AdminContentThumbnailType): ContentThumbnailVisual {
  return THUMBNAILS[type] ?? THUMBNAILS.default;
}

export { ADMIN_CONTENT_THUMBNAIL_LABELS };
