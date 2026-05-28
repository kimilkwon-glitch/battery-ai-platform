import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { normalizeBatteryCode } from "@/lib/batteryNormalize";
import { resolveVehicleFuelPrimaryBattery } from "@/lib/vehicle-fuel-primary-battery";
import {
  getRecordsForSlug,
  groupRecordsByFuel,
  hasConfirmedBatteryData,
  type VehicleBatteryRecord,
} from "@/lib/vehicleBattery";
import { resolveDbBridge } from "@/lib/search/vehicle-canonical-db-bridge";
import {
  vehicleBatteryCandidateMap,
  type VehicleBatteryCandidateEntry,
} from "@/lib/search/vehicle-battery-candidate-map";
import { resolveFitmentOverride } from "@/lib/search/fitment-overrides";
import { SECONDARY_PHOTO_NOTE } from "@/lib/search/battery-recommendation-copy";

export type VehicleBatterySpecTier = "exact" | "db" | "map" | "none";

export type ResolvedVehicleBatterySpec = {
  tier: VehicleBatterySpecTier;
  /** UI 라벨: 검색한 규격 | 추천 규격 | 대표 확인 후보 */
  fieldLabel: string | null;
  /** 화면 표시값: AGM60L 또는 AGM60L 계열 */
  displayValue: string | null;
  primaryCodes: string[];
  source: "vehicle-battery-db" | "fitment-override" | "car-asset-default" | "candidate-map" | null;
  /** 보고용 — 매칭된 DB slug */
  dbMatchKey: string | null;
  /** 보고용 — 대표 row id·표시명 */
  dbRecordId: string | null;
  dbRecordDisplayName: string | null;
  caution: string | null;
  bodyMessage: string | null;
  confidenceLabel: string | null;
};

function fuelLabelMatch(recordFuel: string | null, targetFuel: string | null): boolean {
  if (!targetFuel) return true;
  const f = (recordFuel ?? "").replace(/\s+/g, "");
  const t = targetFuel.replace(/\s+/g, "");
  if (f === t) return true;
  if (/하이브/i.test(f) && /하이브/i.test(t)) return true;
  if (/전기|ev/i.test(f) && /전기|ev/i.test(t)) return true;
  if (/디젤/i.test(f) && /디젤/i.test(t)) return true;
  if (/가솔/i.test(f) && /가솔/i.test(t)) return true;
  return false;
}

function pickConfirmedRecords(
  recs: VehicleBatteryRecord[],
  fuel: string | null,
): VehicleBatteryRecord[] {
  return recs.filter(
    (r) => hasConfirmedBatteryData(r) && fuelLabelMatch(r.fuel, fuel),
  );
}

function codesFromRecords(recs: VehicleBatteryRecord[]): string[] {
  const codes: string[] = [];
  for (const r of recs) {
    const p = canonicalBatteryCode(r.primaryBattery);
    if (p) codes.push(p);
    for (const o of r.batteryOptions) {
      const c = canonicalBatteryCode(o);
      if (c) codes.push(c);
    }
  }
  return [...new Set(codes)].slice(0, 4);
}

function isIceSpecOnHybridSearch(fuel: string | null, primaryCode: string): boolean {
  if (!fuel || !/하이브|hev/i.test(fuel)) return false;
  const p = canonicalBatteryCode(primaryCode);
  return /^DIN/i.test(p);
}

function resolveHybridCandidateBeforeDb(
  canonicalKey: string | null,
  fuel: string | null,
  displayName: string,
): ResolvedVehicleBatterySpec | null {
  if (!canonicalKey?.endsWith("-hybrid")) return null;
  if (!fuel || !/하이브|hev/i.test(fuel)) return null;
  const mapHit = mapFallback(canonicalKey, displayName);
  if (!mapHit) return null;
  const displayValue = formatDisplayValue(mapHit.codes, false);
  return {
    tier: "map",
    fieldLabel: "추천 규격",
    displayValue,
    primaryCodes: mapHit.codes.map((c) => canonicalBatteryCode(c) || c),
    source: "candidate-map",
    dbMatchKey: null,
    dbRecordId: null,
    dbRecordDisplayName: null,
    caution: mapHit.entry.caution?.trim() || SECONDARY_PHOTO_NOTE,
    bodyMessage: null,
    confidenceLabel: "하이브리드 기준",
  };
}

export type DbBatteryLookupResult = {
  codes: string[];
  dbMatchKey: string;
  record: VehicleBatteryRecord | null;
};

/**
 * 1순위: src/data/vehicle-battery-db.json (getRecordsForSlug + 연료별 confirmed)
 */
export function lookupVehicleBatteryFromDb(options: {
  canonicalKey: string | null;
  assetId?: string;
  fuel: string | null;
  displayName?: string;
}): DbBatteryLookupResult | null {
  const { canonicalKey, assetId, fuel } = options;
  const bridge = resolveDbBridge(canonicalKey, assetId);
  const fuelFilter = fuel ?? bridge?.fuelHint ?? null;

  if (bridge) {
    for (const slug of bridge.dbSlugs) {
      const recs = getRecordsForSlug(slug);
      const confirmed = pickConfirmedRecords(recs, fuelFilter);
      if (confirmed.length) {
        const codes = codesFromRecords(confirmed);
        if (codes.length) {
          return {
            codes,
            dbMatchKey: slug,
            record: confirmed[0] ?? null,
          };
        }
      }

      const groups = groupRecordsByFuel(recs);
      for (const g of groups) {
        if (!fuelLabelMatch(g.fuelLabel, fuelFilter)) continue;
        const gConfirmed = g.records.filter(hasConfirmedBatteryData);
        if (!gConfirmed.length || !g.primaryBattery) continue;
        const codes = [
          normalizeBatteryCode(g.primaryBattery),
          ...g.batteryOptions.map(normalizeBatteryCode).filter(Boolean),
        ].filter(Boolean);
        if (codes.length) {
          return {
            codes: [...new Set(codes)].slice(0, 4),
            dbMatchKey: slug,
            record: gConfirmed[0] ?? null,
          };
        }
      }
    }

    for (const pattern of bridge.displayNamePatterns ?? []) {
      for (const slug of bridge.dbSlugs) {
        const recs = getRecordsForSlug(slug);
        const matched = recs.filter(
          (r) =>
            pattern.test(r.displayName) &&
            hasConfirmedBatteryData(r) &&
            fuelLabelMatch(r.fuel, fuelFilter),
        );
        if (matched.length) {
          const codes = codesFromRecords(matched);
          if (codes.length) {
            return {
              codes,
              dbMatchKey: slug,
              record: matched[0] ?? null,
            };
          }
        }
      }
    }
  }

  if (assetId) {
    const recs = getRecordsForSlug(assetId);
    const confirmed = pickConfirmedRecords(recs, fuelFilter);
    if (confirmed.length) {
      const codes = codesFromRecords(confirmed);
      if (codes.length) {
        return { codes, dbMatchKey: assetId, record: confirmed[0] ?? null };
      }
    }
  }

  return null;
}

function lookupVehicleBatteryByDbQuery(
  dbQuery: string,
  fuel: string | null,
): DbBatteryLookupResult | null {
  const q = dbQuery.trim();
  if (!q) return null;
  const recs = getRecordsForSlug(q);
  const confirmed = pickConfirmedRecords(recs, fuel);
  if (confirmed.length) {
    const codes = codesFromRecords(confirmed);
    if (codes.length) {
      return { codes, dbMatchKey: q, record: confirmed[0] ?? null };
    }
  }
  return null;
}

function formatDisplayValue(codes: string[], useSeriesSuffix: boolean): string {
  const unique = [
    ...new Set(codes.map((c) => canonicalBatteryCode(c) || normalizeBatteryCode(c)).filter(Boolean)),
  ];
  if (!unique.length) return "";
  if (!useSeriesSuffix && unique.length === 1) return unique[0]!;
  return `${unique[0]} 계열`;
}

function mapFallback(canonicalKey: string | null, displayName: string): {
  entry: VehicleBatteryCandidateEntry;
  codes: string[];
} | null {
  if (!canonicalKey) return null;
  const entry = vehicleBatteryCandidateMap[canonicalKey];
  if (!entry) return null;
  return { entry, codes: entry.primaryCandidates };
}

function resolvedFromOverride(
  override: NonNullable<ReturnType<typeof resolveFitmentOverride>>,
): ResolvedVehicleBatterySpec {
  const single = override.recommendedSpecs.length === 1;
  return {
    tier: "db",
    fieldLabel: override.fieldLabel,
    displayValue: single
      ? override.recommendedSpecs[0]!
      : override.recommendedSpecs.join(" / "),
    primaryCodes: override.recommendedSpecs,
    source: "fitment-override",
    dbMatchKey: override.assetId,
    dbRecordId: null,
    dbRecordDisplayName: override.displayName,
    caution: override.note,
    bodyMessage: null,
    confidenceLabel: override.confidenceLabel,
  };
}

/**
 * 검색 요약용 규격 결정
 * 1) exact spec 2) fitment override 3) vehicle-battery-db 4) candidateMap 5) none
 */
export function resolveVehicleBatterySpecForSearch(options: {
  exactSpec: string | null;
  canonicalKey: string | null;
  assetId?: string;
  fuel: string | null;
  displayName: string;
  dbQuery?: string | null;
  normalizedQuery?: string | null;
  model?: string | null;
  year?: number | null;
}): ResolvedVehicleBatterySpec {
  const { exactSpec, canonicalKey, assetId, fuel, displayName, dbQuery, normalizedQuery, model, year } =
    options;
  const empty: ResolvedVehicleBatterySpec = {
    tier: "none",
    fieldLabel: null,
    displayValue: null,
    primaryCodes: [],
    source: null,
    dbMatchKey: null,
    dbRecordId: null,
    dbRecordDisplayName: null,
    caution: null,
    bodyMessage: null,
    confidenceLabel: null,
  };

  if (exactSpec) {
    const code = canonicalBatteryCode(exactSpec);
    return {
      tier: "exact",
      fieldLabel: "검색한 규격",
      displayValue: code || exactSpec,
      primaryCodes: code ? [code] : [exactSpec],
      source: null,
      dbMatchKey: null,
      dbRecordId: null,
      dbRecordDisplayName: null,
      caution: SECONDARY_PHOTO_NOTE,
      bodyMessage: null,
      confidenceLabel: null,
    };
  }

  if (normalizedQuery) {
    const override = resolveFitmentOverride({
      normalizedQuery,
      model: model ?? null,
      canonicalKey,
      year: year ?? null,
    });
    if (override?.recommendedSpecs.length) {
      return resolvedFromOverride(override);
    }
  }

  const hybridCandidate = resolveHybridCandidateBeforeDb(canonicalKey, fuel, displayName);

  const evCandidate =
    canonicalKey === "kia-ev6-cv" || canonicalKey === "hyundai-ioniq5-ne"
      ? mapFallback(canonicalKey, displayName)
      : null;

  const dbHit =
    lookupVehicleBatteryFromDb({
      canonicalKey,
      assetId,
      fuel,
      displayName,
    }) ?? (dbQuery ? lookupVehicleBatteryByDbQuery(dbQuery, fuel) : null);

  if (dbHit?.codes.length) {
    const slug = dbHit.dbMatchKey;
    const unifiedPrimary = resolveVehicleFuelPrimaryBattery(slug, fuel);
    const codes = dbHit.codes.map((c) => canonicalBatteryCode(c) || c);
    const dbPrimary = unifiedPrimary || (codes[0] ?? "");
    if (hybridCandidate && isIceSpecOnHybridSearch(fuel, dbPrimary)) {
      return hybridCandidate;
    }
    const primaryCodes = unifiedPrimary
      ? [unifiedPrimary, ...codes.filter((c) => c !== unifiedPrimary)]
      : codes;
    const singleConfirmed =
      Boolean(unifiedPrimary) ||
      (primaryCodes.length === 1 && dbHit.record?.status === "confirmed");
    const displayValue = unifiedPrimary || formatDisplayValue(primaryCodes, !singleConfirmed);
    const fieldLabel = singleConfirmed ? "추천 규격" : "대표 확인 후보";
    const isPorterYearSplit =
      canonicalKey === "hyundai-porter2-from2020" || assetId === "porter2-new";
    const porterCaution =
      "연식 경계가 있으므로 2020년 전후·현재 장착 규격을 한 번 더 확인해 주세요.";
    const caution = isPorterYearSplit
      ? porterCaution
      : dbHit.record?.caution?.trim() || SECONDARY_PHOTO_NOTE;

    return {
      tier: "db",
      fieldLabel,
      displayValue,
      primaryCodes,
      source: "vehicle-battery-db",
      dbMatchKey: dbHit.dbMatchKey,
      dbRecordId: dbHit.record?.id ?? null,
      dbRecordDisplayName: dbHit.record?.displayName ?? null,
      caution,
      bodyMessage: null,
      confidenceLabel: singleConfirmed ? "DB 확인" : "후보",
    };
  }

  const mapHit = mapFallback(canonicalKey, displayName) ?? evCandidate;
  if (mapHit) {
    const single = mapHit.codes.length === 1;
    const displayValue = formatDisplayValue(mapHit.codes, !single);
    return {
      tier: "map",
      fieldLabel: single ? "추천 규격" : mapHit.entry.candidateLabel,
      displayValue,
      primaryCodes: mapHit.codes.map((c) => canonicalBatteryCode(c) || c),
      source: "candidate-map",
      dbMatchKey: null,
      dbRecordId: null,
      dbRecordDisplayName: null,
      caution: mapHit.entry.caution?.trim() || SECONDARY_PHOTO_NOTE,
      bodyMessage: null,
      confidenceLabel: mapHit.entry.confidenceLabel,
    };
  }

  return empty;
}

/** @deprecated — resolveVehicleBatterySpecForSearch 사용 */
export function resolveVehicleBatteryCandidates(options: {
  canonicalKey: string | null;
  assetId?: string;
  fuel: string | null;
  displayName: string;
}) {
  const resolved = resolveVehicleBatterySpecForSearch({
    exactSpec: null,
    ...options,
  });
  if (resolved.tier === "none") return null;
  return {
    displayName: options.displayName,
    primaryCandidates: resolved.primaryCodes,
    candidateLabel: resolved.fieldLabel ?? "대표 확인 후보",
    candidateDisplay: resolved.displayValue ?? "",
    caution: resolved.caution ?? "",
    confidenceLabel: resolved.confidenceLabel ?? "후보",
    confirmRequired: true,
    bodyMessage: resolved.bodyMessage ?? "",
    source: resolved.source === "vehicle-battery-db" ? ("db" as const) : ("map" as const),
  };
}
