/**
 * 차량 slug + 연료 → 대표 primary battery (단일 기준)
 * 검색 카드 / 차량 상세 히어로 / 하단 CTA / 상세표 / data-primary-battery
 */
import enrichmentJson from "@/data/vehicle-battery-enrichment.json";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { mapCustomerFuelLabel, sortFuelGroupsByDisplayOrder } from "@/lib/vehicle-fuel-display";
import { prepareCustomerFacingFuelGroups } from "@/lib/vehicle-detail-recommendation";
import {
  getRecordFuelLabel,
  getRecordsForSlug,
  getYearChipsForSlug,
  pickPrimaryBatteryFromRecords,
  type FuelBatteryGroup,
  type VehicleBatteryRecord,
} from "@/lib/vehicleBattery";

type EnrichmentRow = {
  vehicleId?: string;
  fuelType?: string;
  primaryBattery?: string;
  status?: string;
};

const enrichments = (enrichmentJson as { records?: EnrichmentRow[] }).records ?? [];

/** 차량 slug 단일 대표 규격 — 연료 미지정·카드·검색 히어로 */
export const OPERATOR_SLUG_PRIMARY_BATTERY: Record<string, string> = {
  gv70: "AGM80R",
  gv80: "AGM95R",
  "g80-rg3": "AGM95R",
  g90: "AGM95R",
  "genesis-gv70": "AGM80R",
  "genesis-gv80": "AGM95R",
  "genesis-gv60": "AGM60L",
  "staria-us4": "AGM80R",
  "porter2-new": "100R",
  "hyundai-porter2-from2020": "100R",
};

/** P0 합의 — DB·enrichment·legacy raw 불일치 시 운영 단일 기준 (검색·히어로·CTA·상세표 동일) */
const OPERATOR_FUEL_PRIMARY: Record<string, Record<string, string>> = {
  "grandeur-ig": {
    가솔린: "AGM70L",
    디젤: "AGM80L",
    LPG: "DIN80L",
    하이브리드: "DIN74R",
  },
  "sportage-nq5": { 하이브리드: "AGM60L" },
  "k8-gl3": { 하이브리드: "AGM60L" },
  "sorento-mq4": { 하이브리드: "AGM60L" },
  "sorento-mq4-fl": { 하이브리드: "AGM60L" },
  "kona-sx2": {
    가솔린: "AGM60L",
    전기: "AGM60L",
  },
  "chevrolet-the-new-cruze-2015": {
    가솔린: "DIN60L",
    디젤: "DIN74L",
    "ISG/스마트충전": "AGM80L",
  },
};

function syntheticFuelGroup(fuelLabel: string, primary: string): FuelBatteryGroup {
  return {
    fuel: fuelLabel,
    fuelLabel,
    primaryBattery: primary,
    batteryOptions: [],
    alternatives: [],
    records: [],
    caution: "",
    needsReview: false,
    yearSummary: "",
  };
}

/** DB 연료 그룹 + operator 연료 — 기존 라벨은 operator 규격으로 덮어씀 */
export function mergeOperatorFuelGroups(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
): FuelBatteryGroup[] {
  const operator = OPERATOR_FUEL_PRIMARY[slug];
  if (!operator) return fuelGroups;

  const byLabel = new Map<string, FuelBatteryGroup>();
  for (const g of fuelGroups) {
    const op = operator[g.fuelLabel];
    byLabel.set(
      g.fuelLabel,
      op ? { ...g, primaryBattery: canonicalBatteryCode(op) } : g,
    );
  }

  for (const [fuelLabel, code] of Object.entries(operator)) {
    if (byLabel.has(fuelLabel)) continue;
    const primary = canonicalBatteryCode(code);
    if (primary) byLabel.set(fuelLabel, syntheticFuelGroup(fuelLabel, primary));
  }

  return [...byLabel.values()];
}

/** 상단 fuel hero 카드 — highlight 연료 우선·operator 누락 시 주입 */
export function buildFuelHeroCardGroups(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
  highlightFuelRaw?: string | null,
): FuelBatteryGroup[] {
  const highlightFuel = normalizeVehicleFuelParam(highlightFuelRaw);
  const merged = mergeOperatorFuelGroups(slug, fuelGroups);

  let cards = merged.filter((g) => {
    const code = resolveVehicleFuelPrimaryBattery(slug, g.fuelLabel);
    return Boolean(code);
  });

  if (highlightFuel) {
    const opCode = OPERATOR_FUEL_PRIMARY[slug]?.[highlightFuel];
    const resolved = resolveVehicleFuelPrimaryBattery(slug, highlightFuel);
    const code = canonicalBatteryCode(opCode || resolved);
    if (code && !cards.some((c) => c.fuelLabel === highlightFuel)) {
      cards = [syntheticFuelGroup(highlightFuel, code), ...cards];
    }
    cards = [...cards].sort((a, b) => {
      if (a.fuelLabel === highlightFuel) return -1;
      if (b.fuelLabel === highlightFuel) return 1;
      return 0;
    });
  }

  return prepareCustomerFacingFuelGroups(slug, sortFuelGroupsByDisplayOrder(cards));
}

function decodeFuelQueryParam(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    return decodeURIComponent(raw.trim());
  } catch {
    return raw.trim();
  }
}

/** URL fuel 쿼리 → 폴백 규격 (DB·enrichment 없을 때만) */
export function batteryCodeForFuelParam(fuel: string | null | undefined): string | null {
  const t = decodeFuelQueryParam(fuel);
  if (!t) return null;
  if (/하이브|hev/i.test(t)) return "AGM60L";
  if (/디젤/i.test(t)) return "AGM80L";
  if (/lpg/i.test(t)) return "AGM80L";
  return null;
}

/** URL fuel 쿼리 → 표준 연료 라벨 */
export function normalizeVehicleFuelParam(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return mapCustomerFuelLabel(raw.trim());
}

function enrichmentForSlug(slug: string): EnrichmentRow | undefined {
  return enrichments.find((e) => e.vehicleId === slug);
}

function enrichmentMatchesFuel(row: EnrichmentRow, fuel: string | null): boolean {
  if (!fuel) return true;
  const ft = row.fuelType ?? "";
  if (!ft) return true;
  if (ft.includes(fuel)) return true;
  if (fuel === "가솔린" && /가솔|휘발/i.test(ft)) return true;
  if (fuel === "디젤" && /디젤|경유/i.test(ft)) return true;
  if (fuel === "하이브리드" && /하이브|hev/i.test(ft)) return true;
  if (fuel === "LPG" && /lpg|엘피지/i.test(ft)) return true;
  if (fuel === "전기" && /전기|ev/i.test(ft)) return true;
  return false;
}

function filterRecordsByYearChip(
  slug: string,
  recs: VehicleBatteryRecord[],
  yearChipId: string | null | undefined,
): VehicleBatteryRecord[] {
  if (!yearChipId) return recs;
  const chips = getYearChipsForSlug(slug, recs);
  const chip = chips.find((c) => c.id === yearChipId);
  if (!chip) return recs;
  return recs.filter((r) => {
    if (chip.maxEndYear != null) {
      return (r.endYear !== null && r.endYear <= chip.maxEndYear) || (r.years?.includes("19") ?? false);
    }
    if (chip.minStartYear != null) {
      return (r.startYear !== null && r.startYear >= chip.minStartYear) || (r.years?.includes("20") ?? false);
    }
    return true;
  });
}

function filterRecordsForFuel(
  recs: VehicleBatteryRecord[],
  fuel: string | null,
): VehicleBatteryRecord[] {
  if (!fuel) return recs;
  return recs.filter((r) => getRecordFuelLabel(r) === fuel);
}

/**
 * 차량+연료 대표 규격 (canonical)
 * @param slug platform vehicle id (e.g. grandeur-ig)
 * @param fuelRaw URL fuel param or 표준 연료 라벨
 */
export function resolveVehicleFuelPrimaryBattery(
  slug: string,
  fuelRaw: string | null | undefined,
  options?: { yearChipId?: string | null; fallback?: string | null },
): string {
  const slugPrimary = OPERATOR_SLUG_PRIMARY_BATTERY[slug];
  if (slugPrimary) return canonicalBatteryCode(slugPrimary);

  const fuel = normalizeVehicleFuelParam(fuelRaw);
  const operator = fuel ? OPERATOR_FUEL_PRIMARY[slug]?.[fuel] : undefined;
  if (operator) return canonicalBatteryCode(operator);

  let recs = getRecordsForSlug(slug);
  recs = filterRecordsByYearChip(slug, recs, options?.yearChipId);
  const fuelRecs = filterRecordsForFuel(recs, fuel);

  let picked = pickPrimaryBatteryFromRecords(fuelRecs.length ? fuelRecs : fuel ? [] : recs);
  if (!picked && fuel) {
    picked = pickPrimaryBatteryFromRecords(recs);
  }

  if (picked) return canonicalBatteryCode(picked);

  const enrich = enrichmentForSlug(slug);
  if (enrich?.primaryBattery && enrichmentMatchesFuel(enrich, fuel)) {
    return canonicalBatteryCode(enrich.primaryBattery);
  }

  const fromParam = batteryCodeForFuelParam(fuelRaw);
  if (fromParam) return canonicalBatteryCode(fromParam);

  if (options?.fallback) return canonicalBatteryCode(options.fallback);

  return "";
}
