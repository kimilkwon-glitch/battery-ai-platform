import { resolveVehicleFuelPrimaryBattery } from "@/lib/vehicle-fuel-primary-battery";
import { getVehicleBatteryPageData } from "@/lib/vehicleBattery";

export type VehicleFuelSpecLine = {
  fuelLabel: string;
  code: string;
};

const FUEL_ORDER = ["가솔린", "디젤", "LPG", "하이브리드", "전기", "공통"] as const;

/** 차종/메인 카드용 — 연료별 대표 규격 (단일 resolver) */
export function getVehicleFuelSpecLines(slug: string): VehicleFuelSpecLine[] {
  const { fuelGroups } = getVehicleBatteryPageData(slug);
  const labels = [...new Set(fuelGroups.map((g) => g.fuelLabel))].sort(
    (a, b) => FUEL_ORDER.indexOf(a as (typeof FUEL_ORDER)[number]) - FUEL_ORDER.indexOf(b as (typeof FUEL_ORDER)[number]),
  );
  const lines: VehicleFuelSpecLine[] = [];
  for (const fuelLabel of labels) {
    const code = resolveVehicleFuelPrimaryBattery(slug, fuelLabel);
    if (code) lines.push({ fuelLabel, code });
  }
  return lines;
}

export function formatFuelSpecSummary(lines: VehicleFuelSpecLine[]): string {
  if (!lines.length) return "";
  if (lines.length === 1) return `${lines[0]!.fuelLabel} ${lines[0]!.code}`;
  return lines.map((l) => `${l.fuelLabel} ${l.code}`).join(" / ");
}
