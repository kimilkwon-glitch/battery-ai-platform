import {
  getBatteryRepresentativeLabel,
  type BatteryCardBrandId,
  type RepresentativeLabelInput,
} from "@/lib/battery-card-representatives";

export type { BatteryCardBrandId } from "@/lib/battery-card-representatives";

export function getBatteryCardRepresentativeDisplay(
  code: string,
  brand?: BatteryCardBrandId | null,
  title?: string | null,
): string | null {
  const label = getBatteryRepresentativeLabel({ brand, code, title });
  return label === "차종별 확인" ? null : label;
}

export function resolveBatteryCardRepresentativeVehicles(
  code: string,
  brand?: BatteryCardBrandId | null,
  title?: string | null,
): string {
  return getBatteryRepresentativeLabel({ brand, code, title });
}

export function resolveBatteryRepresentativeFromInput(input: RepresentativeLabelInput): string {
  return getBatteryRepresentativeLabel(input);
}
