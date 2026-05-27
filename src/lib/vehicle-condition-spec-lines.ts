import { getVehicleFuelSpecLines, type VehicleFuelSpecLine } from "@/lib/vehicle-fuel-spec-lines";

export type VehicleConditionSpecLine = {
  conditionLabel: string;
  code: string;
  highlightKey?: string;
};

const PORTER2_YEAR_LINES: VehicleConditionSpecLine[] = [
  { conditionLabel: "2020년형 이전", code: "90R", highlightKey: "to2019" },
  { conditionLabel: "2020년형 이후", code: "100R", highlightKey: "from2020" },
];

/** 차종/메인 카드 — 연료별 또는 연식별 조건 규격 */
export function getVehicleConditionSpecLines(slug: string): VehicleConditionSpecLine[] {
  if (/porter2/i.test(slug)) {
    return PORTER2_YEAR_LINES;
  }
  return getVehicleFuelSpecLines(slug).map((l) => ({
    conditionLabel: l.fuelLabel,
    code: l.code,
    highlightKey: l.fuelLabel,
  }));
}

export function formatConditionSpecSummary(lines: VehicleConditionSpecLine[]): string {
  if (!lines.length) return "";
  return lines.map((l) => `${l.conditionLabel} ${l.code}`).join(" / ");
}

export function hasMultiConditionSpecs(slug: string): boolean {
  const lines = getVehicleConditionSpecLines(slug);
  return lines.length >= 2;
}

export type { VehicleFuelSpecLine };
