/**
 * 슬롯·카드용 실제 asset URL resolver — public/assets 기존 파일만 사용
 */
import {
  pickBatteryImage,
  batteryImageSetForCode,
  type BatteryImageRole,
} from "@/lib/battery-image";
import { findBatteryImage } from "@/lib/batteryImages";
import { getVehicleAsset } from "@/lib/car-assets";
import type { ImageSlotDefinition } from "@/lib/media/image-slot-registry";
import { resolveContentCoverImage } from "@/lib/content/getContentImage";

/** Q&A 슬롯 → contentWorkbench imagePath (public/assets/content) */
export const QNA_SLOT_CONTENT_PATHS: Record<string, string> = {
  "qna.symptom.blackbox": "/assets/content/symptom_blackbox_drain.png",
  "qna.guide.label": "/assets/content/guide_manufacture_date.png",
  "qna.guide.terminal": "/assets/content/caution_terminal_lr.png",
  "qna.ev.hybrid-aux": "/assets/content/guide_ev12v.png",
  "qna.commercial.porter": "/assets/content/guide_porter2_90r_100r.png",
};

/** 질문 ID → 가이드/증상 콘텐츠 썸네일 (workbench) */
const QUESTION_CONTENT_IMAGE: Record<string, string> = {
  "q-blackbox": "/assets/content/symptom_blackbox_drain.png",
  "q-porter2-year": "/assets/content/guide_porter2_90r_100r.png",
  "q-sportage-nq5-agm60l": "/assets/content/guide_sorento_mq4_hybrid_agm60l.png",
  "q-cmf80l": "/assets/content/caution_wrong_spec.png",
  "q-agm-vs-din": "/assets/content/guide_agm_vs_din.png",
  "q-ev12v": "/assets/content/guide_ev12v.png",
};

function slotPurposeToRole(purpose: string): BatteryImageRole {
  if (purpose.includes("label")) return "photo";
  if (purpose.includes("install")) return "detail";
  return "main";
}

/** assetKey 끝 세그먼트 → 규격 코드 (EV-12V → EV 12V) */
export function batteryCodeFromSlotAssetKey(assetKey: string): string | null {
  const patterns = [
    /^home\.battery\.rank\.(.+)$/,
    /^search\.battery\.product\.(.+)$/,
    /^search\.battery\.install\.(.+)$/,
    /^battery\.detail\.product\.(.+)$/,
    /^battery\.detail\.install\.(.+)$/,
    /^battery\.detail\.label\.(.+)$/,
  ];
  for (const re of patterns) {
    const m = assetKey.match(re);
    if (!m) continue;
    const raw = m[1];
    if (raw === "EV-12V") return "EV 12V";
    return raw.replace(/-/g, "");
  }
  return null;
}

export function getBatteryMainImageUrl(code: string): string | null {
  const set = batteryImageSetForCode(code);
  const url = pickBatteryImage(set, code, "main");
  if (url) return url;
  return findBatteryImage(code) ?? null;
}

export function getVehicleImageUrlBySlug(slug: string): string | null {
  const asset =
    getVehicleAsset(slug) ??
    getVehicleAsset(slug.replace(/_/g, "-")) ??
    getVehicleAsset(slug.replace(/-/g, "_"));
  return asset?.image?.trim() ? asset.image : null;
}

export function getQuestionThumbnailUrl(question: {
  id: string;
  guideId?: string;
}): string | null {
  if (question.guideId) {
    const cover = resolveContentCoverImage(question.guideId);
    if (cover.imagePath) return cover.imagePath;
  }
  return QUESTION_CONTENT_IMAGE[question.id] ?? null;
}

/** MediaImageSlot·슬롯 레지스트리용 — phantom /media/slots 경로 대신 실제 asset */
export function resolveImageSlotAssetUrl(slot: ImageSlotDefinition): string | null {
  const qnaPath = QNA_SLOT_CONTENT_PATHS[slot.assetKey];
  if (qnaPath) return qnaPath;

  const code = batteryCodeFromSlotAssetKey(slot.assetKey);
  if (code) {
    const role = slotPurposeToRole(slot.purpose);
    const set = batteryImageSetForCode(code);
    const picked = pickBatteryImage(set, code, role);
    if (picked) return picked;
    return findBatteryImage(code) ?? null;
  }

  const vehicleSlug = slot.assetKey.match(/^home\.vehicle\.quick\.(.+)$/)?.[1];
  if (vehicleSlug) {
    return getVehicleImageUrlBySlug(vehicleSlug);
  }

  return null;
}

export function isPhantomSlotPath(path: string | null | undefined): boolean {
  if (!path) return false;
  return path.startsWith("/media/slots/");
}
