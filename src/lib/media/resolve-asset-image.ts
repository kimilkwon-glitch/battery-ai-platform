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
import { SUPPRESS_LEGACY_CONTENT_IMAGES } from "@/lib/media/content-image-policy";

/** @deprecated 고객 화면에서는 목적형 슬롯만 사용 — 레거시 PNG 경로 비활성 */
export const QNA_SLOT_CONTENT_PATHS: Record<string, string> = {};

const QUESTION_CONTENT_IMAGE: Record<string, string> = {};

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
  if (SUPPRESS_LEGACY_CONTENT_IMAGES) return null;
  if (question.guideId) {
    const cover = resolveContentCoverImage(question.guideId);
    if (cover.imagePath) return cover.imagePath;
  }
  return QUESTION_CONTENT_IMAGE[question.id] ?? null;
}

/** MediaImageSlot·슬롯 레지스트리용 — phantom /media/slots 경로 대신 실제 asset */
export function resolveImageSlotAssetUrl(slot: ImageSlotDefinition): string | null {
  if (!SUPPRESS_LEGACY_CONTENT_IMAGES) {
    const qnaPath = QNA_SLOT_CONTENT_PATHS[slot.assetKey];
    if (qnaPath) return qnaPath;
  }

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
