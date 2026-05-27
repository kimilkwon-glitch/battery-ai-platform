/**
 * 배터리 이미지 공통 resolver — 가이드·상세·호환 카드·검색 전역 사용
 */
import { getVehicleAsset } from "@/lib/car-assets";
import {
  findBatteryProductByCode,
  getBatteryImageSet,
  type BatteryBrandKey,
  type BatteryImageSet,
  EMPTY_BATTERY_IMAGE_SET,
} from "@/lib/battery-alias-map";
import { batteryGalleryUrls } from "@/lib/battery-image";
import {
  BATTERY_ALIAS_MAP,
  getBatteryAliases,
  normalizeBatteryCode,
  terminalFromCode,
} from "@/lib/batteryNormalize";

export { normalizeBatteryCode, getBatteryAliases, BATTERY_ALIAS_MAP };

export type GuideArticleImages = {
  id?: string;
  batteryIds?: string[];
  vehicleIds?: string[];
  sections?: { heading: string; body: string }[];
  heroImage?: string;
  sectionImages?: string[];
  primaryBatteryImage?: string;
  fallbackVehicleImage?: string;
  generatedImages?: { hero?: string; sections?: string[] };
};

/** 화면/API 입력 코드 → lookup 코드 (EV auxiliary 등) */
const INPUT_CODE_ALIASES: Record<string, string> = {
  "EV auxiliary battery": "AGM70L",
  "EV 12V 보조배터리": "AGM70L",
  "EV 12V": "AGM70L",
  EV12V: "AGM70L",
  "EV 12V AGM": "AGM70L",
  EV12VAGM: "AGM70L",
};

/** 이미지 폴더가 없을 때 같은 용량·단자 계열 fallback */
const TERMINAL_GROUP_FALLBACK: Record<string, string[]> = {
  AGM80R: ["GB80R", "CMF80R", "80R"],
  AGM80L: ["GB80L", "CMF80L", "80L"],
  AGM95R: ["GB95R", "95R"],
  AGM95L: ["GB95R"],
  "100R": ["GB100R", "CMF100R"],
  "100L": ["GB100L", "CMF100L"],
  "90R": ["GB90R", "CMF90R"],
  "90L": ["GB90L", "CMF90L"],
  "80R": ["GB80R", "CMF80R"],
  "80L": ["GB80L", "CMF80L"],
  DIN74L: ["GB57820", "GB57412", "CMF57412"],
  DIN74R: ["GB57219"],
  DIN62L: ["GB56219", "CMF56219"],
  DIN50L: ["GB55066", "CMF54459"],
  DIN80L: ["GB58014"],
  DIN90L: ["GB59042"],
};

function resolveLookupCode(code: string): string {
  const trimmed = code.trim();
  return INPUT_CODE_ALIASES[trimmed] ?? trimmed;
}

function collectImageSetUrls(set: BatteryImageSet | undefined): string[] {
  if (!set?.main) return [];
  return batteryGalleryUrls(set, "");
}

function candidateCodes(code: string): string[] {
  const lookup = resolveLookupCode(code);
  const family = normalizeBatteryCode(lookup);
  const aliases = getBatteryAliases(family);
  const fallbacks = TERMINAL_GROUP_FALLBACK[family] ?? [];
  return [...new Set([lookup, family, ...aliases, ...fallbacks])];
}

/** family key → 브랜드별 main URL manifest (런타임 생성) */
let manifestCache: Record<string, Partial<Record<BatteryBrandKey, string>>> | null = null;

export function getBatteryImageManifest(): Record<string, Partial<Record<BatteryBrandKey, string>>> {
  if (manifestCache) return manifestCache;

  const manifest: Record<string, Partial<Record<BatteryBrandKey, string>>> = {};

  for (const family of Object.keys(BATTERY_ALIAS_MAP)) {
    const rocketCode = findBatteryProductByCode(family, "rocket");
    const soliteCode = findBatteryProductByCode(family, "solite");
    const rocketSet = getBatteryImageSet(family, "rocket");
    const soliteSet = getBatteryImageSet(family, "solite");
    manifest[family] = {
      rocket: rocketSet?.main ?? (rocketCode ? getBatteryImageSet(rocketCode, "rocket")?.main : undefined),
      solite: soliteSet?.main ?? (soliteCode ? getBatteryImageSet(soliteCode, "solite")?.main : undefined),
    };
  }

  manifestCache = manifest;
  return manifest;
}

/** alias·브랜드 순으로 URL 후보 수집 */
export function getBatteryImageCandidates(code: string): string[] {
  const urls: string[] = [];
  for (const candidate of candidateCodes(code)) {
    for (const brand of ["rocket", "solite"] as const) {
      urls.push(...collectImageSetUrls(getBatteryImageSet(candidate, brand)));
    }
  }
  return [...new Set(urls.filter(Boolean))];
}

/** 대표 main URL 1장 */
export function findBatteryImage(code: string, preferBrand: BatteryBrandKey = "rocket"): string | undefined {
  const family = normalizeBatteryCode(resolveLookupCode(code));
  const manifest = getBatteryImageManifest()[family];
  if (preferBrand === "solite" && manifest?.solite) return manifest.solite;
  if (manifest?.rocket) return manifest.rocket;
  if (manifest?.solite) return manifest.solite;

  const candidates = getBatteryImageCandidates(code);
  if (preferBrand === "solite") {
    const soliteFirst = candidates.find((u) => /\/CMF/i.test(u));
    if (soliteFirst) return soliteFirst;
  } else {
    const rocketFirst = candidates.find((u) => /\/GB|\/AGM/i.test(u) && !/\/CMF/i.test(u));
    if (rocketFirst) return rocketFirst;
  }
  return candidates[0];
}

export function findBatteryBrandImages(code: string): { rocket?: string; solite?: string } {
  const family = normalizeBatteryCode(resolveLookupCode(code));
  const manifest = getBatteryImageManifest()[family];
  const rocket = manifest?.rocket ?? findBatteryImage(code, "rocket");
  const solite = manifest?.solite ?? findBatteryImage(code, "solite");
  return {
    rocket: rocket !== solite ? rocket : rocket,
    solite: solite && solite !== rocket ? solite : manifest?.solite,
  };
}

/** BatteryThumbnail / getBattery 공통 imageSet */
export function resolveBatteryImageSetForCode(code: string): BatteryImageSet {
  const rocket = getBatteryImageSet(code, "rocket");
  const solite = getBatteryImageSet(code, "solite");
  const merged: BatteryImageSet = { main: "" };

  if (rocket?.main) Object.assign(merged, rocket);
  if (solite?.main) {
    if (!merged.main) merged.main = solite.main;
    if (!merged.productBox && solite.productBox) merged.productBox = solite.productBox;
    if (!merged.frontLabel && solite.frontLabel) merged.frontLabel = solite.frontLabel;
    if (!merged.labelTop && solite.labelTop) merged.labelTop = solite.labelTop;
  }

  if (merged.main) return merged;

  const primary = findBatteryImage(code);
  if (primary) return { main: primary };

  return EMPTY_BATTERY_IMAGE_SET;
}

export function findBatteryProductByCodeReexport(code: string, brand: BatteryBrandKey = "rocket"): string | undefined {
  return findBatteryProductByCode(code, brand);
}

function vehicleImageForGuide(vehicleId: string): string | undefined {
  const asset = getVehicleAsset(vehicleId);
  return asset?.image || undefined;
}

export function getGuideHeroImageForArticle(article: GuideArticleImages): string | undefined {
  if (article.generatedImages?.hero) return article.generatedImages.hero;
  if (article.heroImage) return article.heroImage;
  if (article.primaryBatteryImage) return article.primaryBatteryImage;

  for (const bid of article.batteryIds ?? []) {
    const img = findBatteryImage(bid);
    if (img) return img;
  }

  for (const vid of article.vehicleIds ?? []) {
    const vImg = vehicleImageForGuide(vid);
    if (vImg) return vImg;
  }

  return article.fallbackVehicleImage;
}

export function getGuideSectionImagesForArticle(article: GuideArticleImages): string[] {
  if (article.generatedImages?.sections?.length) return article.generatedImages.sections;
  if (article.sectionImages?.length) return article.sectionImages;

  const images: string[] = [];
  for (const bid of article.batteryIds ?? []) {
    images.push(...getBatteryImageCandidates(bid).slice(0, 3));
  }

  if (images.length < (article.sections?.length ?? 0)) {
    for (const vid of article.vehicleIds ?? []) {
      const vImg = vehicleImageForGuide(vid);
      if (vImg) images.push(vImg);
    }
  }

  return [...new Set(images.filter(Boolean))];
}

/** L/R 혼동 방지 — fallback 후보 필터 */
export function filterCandidatesByTerminal(code: string, urls: string[]): string[] {
  const terminal = terminalFromCode(code);
  if (!terminal) return urls;
  return urls.filter((url) => {
    const folder = url.split("/").slice(-2, -1)[0]?.toUpperCase() ?? "";
    if (terminal === "R" && folder.endsWith("L") && !folder.includes("80R")) return false;
    if (terminal === "L" && folder.endsWith("R") && !folder.includes("80L")) return false;
    return true;
  });
}

export function findBatteryImageSafe(code: string, preferBrand: BatteryBrandKey = "rocket"): string | undefined {
  const candidates = filterCandidatesByTerminal(code, getBatteryImageCandidates(code));
  if (!candidates.length) return findBatteryImage(code, preferBrand);
  if (preferBrand === "solite") {
    return candidates.find((u) => /\/CMF/i.test(u)) ?? candidates[0];
  }
  return candidates.find((u) => !/\/CMF/i.test(u)) ?? candidates[0];
}

export { findBatteryProductByCode } from "@/lib/battery-alias-map";
