/**
 * 배터리 상품 이미지 — canonical + brand imageFolder 기준
 */

import {
  EMPTY_BATTERY_IMAGE_SET,
  getBatteryImageSet,
  getCanonicalBatteryCode,
  normalizeBatteryCode,
  type BatteryImageSet,
} from "./battery-alias-map";
import { inferBatteryBrandKeyFromCode } from "@/lib/battery-brand-inference";
import { resolveBatteryImageSetForCode, findBatteryImage, getBatteryImageCandidates } from "./batteryImages";

export type { BatteryImageSet };

export type BatteryImageRatio = "16/9" | "4/3" | "1/1";

export const BATTERY_IMAGE_SLOT_FILES: {
  key: keyof BatteryImageSet;
  file: string;
  label: string;
}[] = [
  { key: "main", file: "01-main.png", label: "대표" },
  { key: "productBox", file: "02-product-box.png", label: "제품+박스 정면" },
  { key: "boxFront", file: "03-box-front.png", label: "박스 정면" },
  { key: "boxAngle", file: "04-box-angle.png", label: "박스 사선" },
  { key: "productBoxAngle", file: "05-product-box-angle.png", label: "제품+박스 사선" },
  { key: "labelTop", file: "06-label-top.png", label: "상단 라벨" },
  { key: "frontLabel", file: "07-front-label.png", label: "정면 라벨" },
];

export type BatteryImageRole =
  | "main"
  | "detail"
  | "productBoxAngle"
  | "compare"
  | "package"
  | "packageFront"
  | "packageAngle"
  | "spec"
  | "frontLabel"
  | "photo";

export const batteryRatioClass: Record<BatteryImageRatio, string> = {
  "16/9": "aspect-video",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
};

export { normalizeBatteryCode, getCanonicalBatteryCode, getBatteryImageSet, EMPTY_BATTERY_IMAGE_SET };

export function batteryFolderName(code: string): string {
  return normalizeBatteryCode(code);
}

/** catalog code → 브랜드별 strict imageSet (교차 브랜드 fallback 없음) */
export function batteryImageSetForCode(code: string, brandKey?: import("./battery-alias-map").BatteryBrandKey): BatteryImageSet {
  const brand = brandKey ?? inferBatteryBrandKeyFromCode(code);
  return resolveBatteryImageSetForCode(code, brand);
}

export function batteryGalleryUrls(imageSet: BatteryImageSet | undefined, code: string): string[] {
  const set = imageSet ?? batteryImageSetForCode(code);
  const urls: string[] = [];
  for (const slot of BATTERY_IMAGE_SLOT_FILES) {
    const url = set[slot.key];
    if (url && !urls.includes(url)) urls.push(url);
  }
  return urls.filter(Boolean);
}

function firstAvailable(set: BatteryImageSet, keys: (keyof BatteryImageSet)[]): string {
  for (const key of keys) {
    const url = set[key];
    if (url) return url;
  }
  return set.main;
}

export function pickBatteryImage(
  imageSet: BatteryImageSet | undefined,
  code: string,
  role: BatteryImageRole = "main",
): string {
  const set = imageSet ?? batteryImageSetForCode(code);

  switch (role) {
    case "main":
      return set.main;
    case "detail":
      return firstAvailable(set, ["productBox", "productBoxAngle", "main"]);
    case "productBoxAngle":
      return firstAvailable(set, ["productBoxAngle", "productBox", "main"]);
    case "compare":
      return firstAvailable(set, ["frontLabel", "main"]);
    case "package":
      return firstAvailable(set, ["boxFront", "boxAngle", "productBox"]);
    case "packageFront":
      return firstAvailable(set, ["boxFront", "boxAngle", "main"]);
    case "packageAngle":
      return firstAvailable(set, ["boxAngle", "boxFront", "main"]);
    case "spec":
    case "photo":
      return firstAvailable(set, ["labelTop", "frontLabel", "main"]);
    case "frontLabel":
      return firstAvailable(set, ["frontLabel", "labelTop", "main"]);
    default:
      return set.main;
  }
}

export function batteryImageCandidates(
  imageSet: BatteryImageSet | undefined,
  code: string,
  role: BatteryImageRole = "main",
): string[] {
  const set = imageSet?.main ? imageSet : resolveBatteryImageSetForCode(code);
  const primary = pickBatteryImage(set, code, role);
  const gallery = batteryGalleryUrls(set, code);
  const aliasUrls = getBatteryImageCandidates(code);
  const merged = [...new Set([primary, ...gallery, ...aliasUrls])].filter(Boolean);
  if (merged.length) return merged;
  const fallback = findBatteryImage(code);
  return fallback ? [fallback] : [];
}

export function batteryImagesForCode(code: string): string[] {
  return batteryGalleryUrls(batteryImageSetForCode(code), code);
}

export function batteryImageSrc(code: string, role: BatteryImageRole = "main"): string {
  return pickBatteryImage(undefined, code, role);
}
