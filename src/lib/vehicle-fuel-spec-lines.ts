import { productBatteryCode } from "@/lib/batteryNormalize";
import { getVehicleBatteryPageData } from "@/lib/vehicleBattery";

export type VehicleFuelSpecLine = {
  fuelLabel: string;
  code: string;
};

/** 차종/메인 카드용 — 연료별 대표 규격 (DB fuelGroups) */
export function getVehicleFuelSpecLines(slug: string): VehicleFuelSpecLine[] {
  const { fuelGroups } = getVehicleBatteryPageData(slug);
  const seen = new Set<string>();
  const lines: VehicleFuelSpecLine[] = [];

  for (const g of fuelGroups) {
    const code = productBatteryCode(g.primaryBattery);
    if (!code || seen.has(g.fuelLabel)) continue;
    seen.add(g.fuelLabel);
    lines.push({ fuelLabel: g.fuelLabel, code });
  }

  return lines;
}

export function formatFuelSpecSummary(lines: VehicleFuelSpecLine[]): string {
  if (!lines.length) return "";
  if (lines.length === 1) return `${lines[0]!.fuelLabel} ${lines[0]!.code}`;
  return lines.map((l) => `${l.fuelLabel} ${l.code}`).join(" / ");
}
