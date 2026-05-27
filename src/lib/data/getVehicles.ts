/**
 * 차량-배터리 데이터 로더
 *
 * 우선순위:
 * 1. 기존 차종표 DB (vehicle-battery-db.json) — 운영 원본
 * 2. vehicles.real.json — 운영자 추가/보강
 * 3. vehicles.sample.json — 개발 fallback (운영 DB 없을 때만)
 * 4. fallback 안내
 */
import legacyDbJson from "@/data/vehicle-battery-db.json";
import vehiclesRealJson from "@/data/vehicles/vehicles.real.json";
import vehiclesSampleJson from "@/data/vehicles/vehicles.sample.json";
import enrichmentJson from "@/data/vehicle-battery-enrichment.json";
import type { VehicleBatteryRecord } from "@/data/vehicles/vehicles.schema";
import type { DataLoadResult, DataSourceKind } from "@/data/common/dataStatus";
import { getFallback } from "@/data/common/fallback";
import type { VehicleBatteryRecord as LegacyRecord } from "@/lib/vehicleBattery";
import type { VehicleBatteryEnrichment } from "@/data/types";
import {
  applyVehicleEnrichment,
  enrichmentMatchesRecord,
  normalizeLegacyVehicleRecord,
  normalizeVehicleToken,
} from "./normalizeVehicle";

type LegacyDbRoot = {
  meta?: { recordCount?: number };
  records: LegacyRecord[];
};

type EnrichmentRoot = { records: VehicleBatteryEnrichment[] };

const DEV_FALLBACK_ID = "_dev_fallback_only";

let cached: { items: VehicleBatteryRecord[]; source: DataSourceKind } | null = null;

function loadLegacyRecords(): LegacyRecord[] {
  const root = legacyDbJson as LegacyDbRoot;
  return root.records ?? [];
}

function mergeRealRecords(base: VehicleBatteryRecord[], real: VehicleBatteryRecord[]): VehicleBatteryRecord[] {
  if (!real.length) return base;
  const byId = new Map(base.map((r) => [r.vehicleId, r]));
  for (const row of real) {
    const existing = byId.get(row.vehicleId);
    if (existing) {
      byId.set(row.vehicleId, {
        ...existing,
        ...row,
        mainBatterySpec: existing.mainBatterySpec || row.mainBatterySpec,
        mainBatteryId: existing.mainBatteryId || row.mainBatteryId,
        candidateBatterySpecs: existing.candidateBatterySpecs.length
          ? existing.candidateBatterySpecs
          : row.candidateBatterySpecs,
        candidateBatteryIds: existing.candidateBatteryIds.length
          ? existing.candidateBatteryIds
          : row.candidateBatteryIds,
      });
    } else {
      byId.set(row.vehicleId, row);
    }
  }
  return [...byId.values()];
}

function applyAllEnrichment(items: VehicleBatteryRecord[]): VehicleBatteryRecord[] {
  const enrichments = (enrichmentJson as EnrichmentRoot).records ?? [];
  if (!enrichments.length) return items;
  return items.map((record) => {
    const hit = enrichments.find((e) => enrichmentMatchesRecord(record, e));
    return hit ? applyVehicleEnrichment(record, hit) : record;
  });
}

function buildFromLegacy(): VehicleBatteryRecord[] {
  const legacy = loadLegacyRecords();
  let normalized = legacy.map(normalizeLegacyVehicleRecord);
  normalized = applyAllEnrichment(normalized);
  normalized = mergeRealRecords(normalized, vehiclesRealJson as VehicleBatteryRecord[]);
  return normalized;
}

export function getVehicles(): DataLoadResult<VehicleBatteryRecord> {
  if (cached) {
    return { items: cached.items, source: cached.source, isEmpty: cached.items.length === 0 };
  }

  const legacy = loadLegacyRecords();
  if (legacy.length > 0) {
    const items = buildFromLegacy();
    cached = { items, source: "legacy" };
    return { items, source: "legacy", isEmpty: false };
  }

  const real = (vehiclesRealJson as VehicleBatteryRecord[]).filter(Boolean);
  if (real.length > 0) {
    cached = { items: real, source: "real" };
    return { items: real, source: "real", isEmpty: false };
  }

  const sample = (vehiclesSampleJson as VehicleBatteryRecord[]).filter(
    (r) => r.vehicleId !== DEV_FALLBACK_ID,
  );
  if (sample.length > 0) {
    cached = { items: sample, source: "sample" };
    return { items: sample, source: "sample", isEmpty: false };
  }

  cached = { items: [], source: "fallback" };
  return { items: [], source: "fallback", isEmpty: true };
}

export function getVehicleDataSource(): DataSourceKind {
  return getVehicles().source;
}

export function getVehicleFallback() {
  return getFallback("vehicleData");
}

export function getVehicleCount(): number {
  return getVehicles().items.length;
}

/** vehicleId · slug · displayName · alias 로 검색 */
export function findVehicles(query: string, limit = 24): VehicleBatteryRecord[] {
  const q = normalizeVehicleToken(query);
  if (!q) return [];
  const { items } = getVehicles();
  const scored: { record: VehicleBatteryRecord; score: number }[] = [];

  for (const r of items) {
    let score = 0;
    const hay = normalizeVehicleToken(
      `${r.manufacturer ?? ""} ${r.codeName ?? ""} ${r.vehicleName ?? ""} ${r.generationName ?? ""} ${r.fuelType ?? ""} ${r.mainBatterySpec ?? ""} ${(r.aliases ?? []).filter(Boolean).join(" ")}`,
    );
    if (r.vehicleId === query) score += 100;
    if (hay.includes(q)) score += 80;
    else if (q.length >= 3 && [...q].every((c) => hay.includes(c))) score += 35;
    if (normalizeVehicleToken(r.mainBatterySpec).includes(q)) score += 60;
    if (score > 0) scored.push({ record: r, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.record);
}

export function getVehiclesByBatterySpec(spec: string, limit = 48): VehicleBatteryRecord[] {
  const canonical = normalizeVehicleToken(spec);
  const { items } = getVehicles();
  return items
    .filter(
      (r) =>
        normalizeVehicleToken(r.mainBatterySpec) === canonical ||
        r.candidateBatterySpecs.some((b) => normalizeVehicleToken(b) === canonical),
    )
    .slice(0, limit);
}

/** 캐시 초기화 (테스트용) */
export function resetVehicleCache() {
  cached = null;
}
