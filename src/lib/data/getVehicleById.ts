import type { VehicleBatteryRecord } from "@/data/vehicles/vehicles.schema";
import { getFallback } from "@/data/common/fallback";
import { getRecordsForSlug } from "@/lib/vehicleBattery";
import { normalizeLegacyVehicleRecord, normalizeVehicleToken } from "./normalizeVehicle";
import { findVehicles, getVehicles } from "./getVehicles";
import enrichmentJson from "@/data/vehicle-battery-enrichment.json";
import type { VehicleBatteryEnrichment } from "@/data/types";
import { applyVehicleEnrichment } from "./normalizeVehicle";

type EnrichmentRoot = { records: VehicleBatteryEnrichment[] };

export type VehicleByIdResult = {
  record: VehicleBatteryRecord | null;
  records: VehicleBatteryRecord[];
  fallback: ReturnType<typeof getFallback> | null;
};

function enrichmentBySlug(slug: string): VehicleBatteryEnrichment | undefined {
  return (enrichmentJson as EnrichmentRoot).records.find((e) => e.vehicleId === slug);
}

/** vehicleId · catalog slug · 차량명 · alias 로 조회 */
export function getVehicleById(id: string): VehicleByIdResult {
  const trimmed = id.trim();
  if (!trimmed) {
    return { record: null, records: [], fallback: getFallback("vehicleData") };
  }

  const { items, isEmpty } = getVehicles();
  if (!isEmpty) {
    const direct = items.find(
      (r) =>
        r.vehicleId === trimmed ||
        normalizeVehicleToken(r.vehicleName) === normalizeVehicleToken(trimmed),
    );
    if (direct) {
      return { record: direct, records: [direct], fallback: null };
    }

    const aliasHits = findVehicles(trimmed, 12);
    if (aliasHits.length) {
      return { record: aliasHits[0], records: aliasHits, fallback: null };
    }
  }

  const slugRecords = getRecordsForSlug(trimmed);
  if (slugRecords.length) {
    let normalized = slugRecords.map(normalizeLegacyVehicleRecord);
    const enrich = enrichmentBySlug(trimmed);
    if (enrich) {
      normalized = normalized.map((r) => applyVehicleEnrichment(r, enrich));
    }
    return { record: normalized[0], records: normalized, fallback: null };
  }

  return { record: null, records: [], fallback: getFallback("vehicleData") };
}

export function getVehicleByIdOrThrow(id: string): VehicleBatteryRecord {
  const { record, fallback } = getVehicleById(id);
  if (record) return record;
  throw new Error(fallback?.title ?? "차량 데이터 없음");
}
