/**
 * 기존 vehicle-battery-db.json 레코드 → 표준 VehicleBatteryRecord 변환
 * 기존 값은 덮어쓰지 않고, 부족한 필드만 needsCheck / notes 로 표시
 */
import type { VehicleBatteryRecord as LegacyRecord } from "@/lib/vehicleBattery";
import type { VehicleBatteryRecord } from "@/data/vehicles/vehicles.schema";
import type { VehicleBatteryEnrichment } from "@/data/types";

const BRAND_SLUG: Record<string, string> = {
  현대: "hyundai",
  기아: "kia",
  제네시스: "genesis",
  BMW: "bmw",
  벤츠: "mercedes",
  Mercedes: "mercedes",
  아udi: "audi",
  Audi: "audi",
};

function norm(s: string | null | undefined) {
  return (s ?? "").toLowerCase().replace(/\s+/g, "").replace(/[()~·]/g, "");
}

function brandToSlug(brand: string | null | undefined): string {
  const b = brand ?? "";
  return BRAND_SLUG[b] ?? b.toLowerCase().replace(/\s+/g, "-");
}

function inferTerminal(spec: string): string {
  if (!spec) return "";
  if (/R$/i.test(spec.trim())) return "R";
  if (/L$/i.test(spec.trim())) return "L";
  return "";
}

function inferBatteryType(spec: string): string {
  if (!spec) return "";
  if (/^AGM/i.test(spec)) return "AGM";
  if (/^DIN/i.test(spec) || /^GB/i.test(spec) || /^CMF/i.test(spec)) return "DIN";
  if (/12V|EV/i.test(spec)) return "EV";
  if (/^EFB/i.test(spec)) return "EFB";
  return "일반";
}

function extractGeneration(legacy: LegacyRecord): string {
  const fromDisplay = legacy.displayName.match(/\b([A-Z]{2,3}\d?)\b/);
  if (fromDisplay) return fromDisplay[1];
  const fromDetail = legacy.detail.match(/\b(IG|MQ4|DL3|GN7|US4|RG3|DN8|KA4|NQ5)\b/i);
  return fromDetail ? fromDetail[1].toUpperCase() : "";
}

function mapConfidence(legacy: LegacyRecord): VehicleBatteryRecord["confidence"] {
  if (legacy.status === "needs_review") return "needs_check";
  const missingFuel = !legacy.fuel || legacy.fuel.trim() === "";
  const missingYears = !legacy.years && legacy.startYear == null;
  if (missingFuel || missingYears) return "needs_photo";
  if (legacy.status === "confirmed" || legacy.confidence === "high") return "confirmed";
  if (legacy.confidence === "medium") return "likely";
  return "needs_check";
}

function buildNotes(legacy: LegacyRecord): string {
  const gaps: string[] = [];
  if (!legacy.fuel?.trim()) gaps.push("연료 미확인");
  if (!legacy.years && legacy.startYear == null) gaps.push("연식 미확인");
  if (!inferTerminal(legacy.primaryBattery)) gaps.push("단자방향 미확인");
  const parts = gaps.length ? [`[확인 필요] ${gaps.join(", ")}`] : [];
  if (legacy.caution?.trim()) parts.push(legacy.caution.trim());
  return parts.join(" · ");
}

/** 레거시 DB 레코드 1건 → 표준 스키마 (primaryBattery 등 기존 값 유지) */
export function normalizeLegacyVehicleRecord(legacy: LegacyRecord): VehicleBatteryRecord {
  const missingFuel = !legacy.fuel?.trim();
  const missingYears = !legacy.years && legacy.startYear == null;
  const needsCheck =
    legacy.status === "needs_review" || legacy.status === "raw" || missingFuel || missingYears;

  const candidates = (legacy.batteryOptions ?? []).filter((b) => b && b !== legacy.primaryBattery);

  return {
    vehicleId: legacy.id,
    manufacturer: legacy.brand,
    brandSlug: brandToSlug(legacy.brand),
    vehicleName: legacy.displayName,
    generationName: extractGeneration(legacy),
    codeName: legacy.model ?? "",
    yearStart: legacy.startYear ?? 0,
    yearEnd: legacy.endYear ?? 0,
    yearLabel: legacy.years ?? "",
    fuelType: legacy.fuel ?? "",
    trim: legacy.detail !== legacy.displayName ? legacy.detail : "",
    mainBatterySpec: legacy.primaryBattery,
    mainBatteryId: legacy.primaryBattery,
    candidateBatterySpecs: candidates,
    candidateBatteryIds: candidates,
    terminalPosition: inferTerminal(legacy.primaryBattery),
    batteryType: inferBatteryType(legacy.primaryBattery),
    agmRequired: /^AGM/i.test(legacy.primaryBattery),
    isgRelated: /ISG|IBS|스마트/i.test(`${legacy.caution} ${legacy.detail}`),
    ev12vRelated: /EV|12V|전기/i.test(`${legacy.fuel ?? ""} ${legacy.primaryBattery}`),
    confidence: mapConfidence(legacy),
    needsCheck,
    aliases: [...new Set([legacy.displayName, legacy.model, ...(legacy.aliases ?? [])].filter(Boolean))],
    imageFile: "",
    relatedGuideIds: [],
    relatedQaIds: [],
    notes: buildNotes(legacy),
  };
}

type EnrichmentRoot = { records: VehicleBatteryEnrichment[] };

/** slug 기준 enrichment — 배터리 규격은 덮어쓰지 않고 메타만 보강 */
export function applyVehicleEnrichment(
  record: VehicleBatteryRecord,
  enrichment: VehicleBatteryEnrichment,
): VehicleBatteryRecord {
  return {
    ...record,
    generationName: enrichment.generation || record.generationName,
    fuelType: record.fuelType || enrichment.fuelType || "",
    trim: record.trim || enrichment.trim || "",
    terminalPosition:
      record.terminalPosition || enrichment.terminalDirection?.toString() || "",
    imageFile: enrichment.imagePath || record.imageFile,
    relatedGuideIds: enrichment.relatedGuides ?? record.relatedGuideIds,
    relatedQaIds: enrichment.relatedQuestions ?? record.relatedQaIds,
    aliases: [...new Set([...record.aliases, ...(enrichment.aliases ?? [])])],
    notes: [record.notes, enrichment.notes].filter(Boolean).join(" · "),
  };
}

export function enrichmentMatchesRecord(
  record: VehicleBatteryRecord,
  enrichment: VehicleBatteryEnrichment,
): boolean {
  const slug = enrichment.vehicleId ?? "";
  const hay = norm(
    `${record.vehicleName ?? ""} ${record.codeName ?? ""} ${record.generationName ?? ""} ${(record.aliases ?? []).filter(Boolean).join(" ")}`,
  );
  const slugNorm = norm(slug.replace(/-/g, " "));
  if (slugNorm && hay.includes(slugNorm)) return true;
  const model = enrichment.model ?? "";
  if (model && norm(record.codeName).includes(norm(model))) {
    const gen = enrichment.generation ?? "";
    if (gen && record.generationName) {
      return norm(record.generationName).includes(norm(gen));
    }
    return true;
  }
  return false;
}

export { norm as normalizeVehicleToken };
