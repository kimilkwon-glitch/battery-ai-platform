/**
 * 차량 세대·연식·연료 기준 DB 후보 필터 (고객 상세 추천용)
 */
import { mapCustomerFuelLabel } from "@/lib/vehicle-fuel-display";
import { getVehicleAsset } from "@/lib/car-assets";
import type { VehicleBatteryRecord, VehicleDbProfile } from "@/lib/vehicleBattery";
import { normalizeYearRange, yearIntervalsOverlap } from "@/lib/vehicle-year-range";

export type RecommendationCandidateClass =
  | "sameGenerationCandidate"
  | "exactYearFuelCandidate"
  | "userConfirmedCandidate"
  | "explicitBridgeCandidate"
  | "broadModelOnlyCandidate"
  | "otherGenerationCandidate"
  | "yearOverlapOnlyCandidate"
  | "hybridWithoutGenerationCandidate"
  | "reviewOnlyCandidate"
  | "productCatalogMissingCandidate";

export type GenerationMatchResult = {
  class: RecommendationCandidateClass;
  renderable: boolean;
  reason: string;
};

/** 세대 코드 — 상호 배타 (asset vs record) */
export const GENERATION_CODE_TOKENS = [
  "CN7",
  "CN7FL",
  "MQ4",
  "NQ5",
  "KA4",
  "GL3",
  "DL3",
  "IG",
  "GN7",
  "HG",
  "TG",
  "RG3",
  "NF",
  "YF",
  "LF",
  "DN8",
  "TM",
  "DM",
  "CM",
  "MX5",
  "NX4",
  "TL",
  "LM",
  "IX",
  "JM",
  "QL",
  "SL",
  "SP2",
  "OS",
  "SX2",
  "HD",
  "MD",
  "AD",
  "XD",
  "YD",
  "BD",
  "JA",
  "TA",
  "SA",
  "DE",
  "SG2",
  "TAM",
  "US4",
  "VQ",
  "YP",
] as const;

function norm(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().replace(/\s+/g, "").replace(/[()~·]/g, "");
}

export function extractGenerationTokensFromText(text: string): string[] {
  const hay = norm(text);
  const found: string[] = [];
  for (const token of GENERATION_CODE_TOKENS) {
    const nt = norm(token);
    if (nt.length >= 2 && hay.includes(nt)) found.push(token);
  }
  if (hay.includes("쏘나타nf") || hay.includes("sonatanf")) found.push("NF");
  if (hay.includes("쏘나타yf") || hay.includes("sonatayf")) found.push("YF");
  if (hay.includes("쏘나타lf") || hay.includes("sonatalf")) found.push("LF");
  return [...new Set(found)];
}

function recordYearInterval(r: VehicleBatteryRecord): { start: number; end: number | null } | null {
  if (r.startYear != null) return { start: r.startYear, end: r.endYear };
  const parsed = r.years ? normalizeYearRange(r.years) : null;
  if (parsed) return { start: parsed.start, end: parsed.end };
  return null;
}

function profileAssetYearInterval(profile: VehicleDbProfile): { start: number; end: number | null } | null {
  const asset = getVehicleAsset(profile.slug);
  if (profile.yearRange) {
    const parsed = normalizeYearRange(profile.yearRange);
    if (parsed) return { start: parsed.start, end: parsed.end };
  }
  if (asset?.yearStart != null) {
    const parsed = asset.yearRange ? normalizeYearRange(asset.yearRange) : null;
    return { start: asset.yearStart, end: parsed?.end ?? null };
  }
  return null;
}

function recordHaystack(r: VehicleBatteryRecord): string {
  return `${r.displayName} ${r.detail} ${r.aliases.join(" ")} ${r.years ?? ""} ${r.fuel ?? ""}`;
}

function profileBrandMatchesRecord(profileBrand: string, recordBrand: string): boolean {
  if (!profileBrand) return true;
  const rb = norm(recordBrand);
  const aliases: Record<string, string[]> = {
    쉐보레: ["쉐보레", "gm", "대우"],
    KGM: ["kgm", "kg", "쌍용"],
    쌍용: ["kgm", "kg", "쌍용"],
    르노: ["르노", "르노삼성", "르노코리아"],
    르노코리아: ["르노코리아", "르노삼성", "르노"],
  };
  const list = aliases[profileBrand] ?? [profileBrand];
  return list.some((a) => {
    const na = norm(a);
    return rb === na || rb.includes(na) || na.includes(rb);
  });
}

function modelStemMatches(r: VehicleBatteryRecord, profile: VehicleDbProfile): boolean {
  return profile.dbModels.some(
    (m) => r.model === m || norm(r.displayName).includes(norm(m)) || norm(r.model).includes(norm(m)),
  );
}

function generationTokenHit(profile: VehicleDbProfile, r: VehicleBatteryRecord): boolean {
  const hay = norm(recordHaystack(r));
  return profile.generationTokens.some((t) => {
    const nt = norm(t);
    return nt.length >= 2 && hay.includes(nt);
  });
}

export function conflictingGenerationTokens(
  profileTokens: string[],
  recordTokens: string[],
): string[] {
  if (profileTokens.length === 0 || recordTokens.length === 0) return [];
  const profileSet = new Set(profileTokens.map((t) => norm(t)));
  return recordTokens.filter((rt) => {
    const nrt = norm(rt);
    if (profileSet.has(nrt)) return false;
    return GENERATION_CODE_TOKENS.some((known) => norm(known) === nrt);
  });
}

function assetIsHybridTagged(slug: string): boolean {
  const asset = getVehicleAsset(slug);
  if (!asset?.tags?.length) return false;
  return asset.tags.some((t) => /하이브리드|hev|phev/i.test(t));
}

function recordExplicitHybridForGeneration(r: VehicleBatteryRecord, profile: VehicleDbProfile): boolean {
  const hay = recordHaystack(r);
  const isHybrid =
    /하이브리드|hev|phev|hybrid/i.test(`${r.fuel ?? ""} ${hay}`) ||
    mapCustomerFuelLabel(r.fuel) === "하이브리드";
  if (!isHybrid) return false;
  if (profile.generationTokens.length === 0) return true;
  return generationTokenHit(profile, r);
}

function yearOverlapsProfile(profile: VehicleDbProfile, r: VehicleBatteryRecord): boolean {
  const assetYears = profileAssetYearInterval(profile);
  if (!assetYears) return true;
  const recYears = recordYearInterval(r);
  if (!recYears) return false;
  return yearIntervalsOverlap(assetYears, recYears);
}

/**
 * 차량 상세 고객 추천용 — DB 레코드 1건 분류
 */
export function classifyRecommendationCandidate(
  r: VehicleBatteryRecord,
  profile: VehicleDbProfile,
): GenerationMatchResult {
  if (!modelStemMatches(r, profile)) {
    return {
      class: "broadModelOnlyCandidate",
      renderable: false,
      reason: "model 불일치",
    };
  }

  if (profile.brand && !profileBrandMatchesRecord(profile.brand, r.brand)) {
    return {
      class: "broadModelOnlyCandidate",
      renderable: false,
      reason: "브랜드 불일치",
    };
  }

  if (!yearOverlapsProfile(profile, r)) {
    return {
      class: "yearOverlapOnlyCandidate",
      renderable: false,
      reason: "연식 구간 불일치",
    };
  }

  const profileTokens = [
    ...new Set([
      ...profile.generationTokens,
      ...extractGenerationTokensFromText(profile.title),
    ]),
  ];
  const recordTokens = extractGenerationTokensFromText(recordHaystack(r));
  const conflicts = conflictingGenerationTokens(profileTokens, recordTokens);

  if (profileTokens.length > 0) {
    if (conflicts.length > 0) {
      return {
        class: "otherGenerationCandidate",
        renderable: false,
        reason: `다른 세대 토큰: ${conflicts.join(",")}`,
      };
    }
    if (!generationTokenHit(profile, r)) {
      const fuelLabel = mapCustomerFuelLabel(r.fuel);
      if (fuelLabel === "하이브리드" || /하이브리드|hev/i.test(recordHaystack(r))) {
        return {
          class: "hybridWithoutGenerationCandidate",
          renderable: false,
          reason: "세대 미명시 하이브리드",
        };
      }
      return {
        class: "broadModelOnlyCandidate",
        renderable: false,
        reason: "세대 토큰 미포함(모델만 일치)",
      };
    }
  }

  const fuelLabel = mapCustomerFuelLabel(r.fuel);
  if (fuelLabel === "하이브리드" && !assetIsHybridTagged(profile.slug)) {
    if (!recordExplicitHybridForGeneration(r, profile)) {
      return {
        class: "hybridWithoutGenerationCandidate",
        renderable: false,
        reason: "비하이브리드 세대에 하이브리드 행",
      };
    }
  }

  if (r.status === "confirmed") {
    return {
      class: "userConfirmedCandidate",
      renderable: true,
      reason: "confirmed",
    };
  }

  if (generationTokenHit(profile, r)) {
    return {
      class: "sameGenerationCandidate",
      renderable: true,
      reason: "세대 토큰 일치",
    };
  }

  return {
    class: "exactYearFuelCandidate",
    renderable: true,
    reason: "연식·연료·모델 일치",
  };
}

export function isCustomerFacingDbRecord(
  r: VehicleBatteryRecord,
  profile: VehicleDbProfile,
): boolean {
  return classifyRecommendationCandidate(r, profile).renderable;
}

export function filterCustomerFacingRecords(
  records: VehicleBatteryRecord[],
  profile: VehicleDbProfile,
): VehicleBatteryRecord[] {
  return records.filter((r) => isCustomerFacingDbRecord(r, profile));
}
