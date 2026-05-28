/**
 * 차량 slug + 연료 → 대표 primary battery (단일 기준)
 * 검색 카드 / 차량 상세 히어로 / 하단 CTA / 상세표 / data-primary-battery
 */
import enrichmentJson from "@/data/vehicle-battery-enrichment.json";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import {
  getRecordFuelLabel,
  getRecordsForSlug,
  getYearChipsForSlug,
  pickPrimaryBatteryFromRecords,
  type VehicleBatteryRecord,
} from "@/lib/vehicleBattery";

type EnrichmentRow = {
  vehicleId?: string;
  fuelType?: string;
  primaryBattery?: string;
  status?: string;
};

const enrichments = (enrichmentJson as { records?: EnrichmentRow[] }).records ?? [];

/** P0 합의 — DB·enrichment·legacy raw 불일치 시 운영 단일 기준 (검색·히어로·CTA·상세표 동일) */
const OPERATOR_FUEL_PRIMARY: Record<string, Record<string, string>> = {
  "grandeur-ig": {
    가솔린: "AGM70L",
    디젤: "AGM80L",
    LPG: "DIN80L",
    하이브리드: "DIN74R",
  },
};

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
  const t = raw.trim();
  if (/하이브|hev/i.test(t)) return "하이브리드";
  if (/디젤/i.test(t)) return "디젤";
  if (/가솔|휘발/i.test(t)) return "가솔린";
  if (/lpg/i.test(t)) return "LPG";
  if (/전기|ev/i.test(t)) return "전기";
  return t;
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
