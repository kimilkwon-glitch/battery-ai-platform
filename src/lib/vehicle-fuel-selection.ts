import { normalizeVehicleFuelParam } from "@/lib/vehicle-fuel-primary-battery";
import {
  isVehicleFuelSalesExcluded,
  shouldRenderFuelGroupInShop,
} from "@/lib/vehicle-battery-customer-policy";
import { CUSTOMER_FUEL_DISPLAY_ORDER } from "@/lib/vehicle-fuel-display";
import type { FuelBatteryGroup } from "@/lib/vehicleBattery";

const FUEL_CHIP_ORDER = CUSTOMER_FUEL_DISPLAY_ORDER.filter(
  (f) => f !== "확인 필요" && f !== "공통",
);

/** 차량 상세·검색 — 고객에게 노출할 연료 옵션 */
export function resolveVehicleFuelOptions(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
): string[] {
  const available = new Set<string>();
  for (const group of fuelGroups) {
    if (
      shouldRenderFuelGroupInShop(slug, group.fuelLabel) ||
      isVehicleFuelSalesExcluded(slug, group.fuelLabel)
    ) {
      available.add(group.fuelLabel);
    }
  }

  const ordered: string[] = [];
  for (const fuel of FUEL_CHIP_ORDER) {
    if (available.has(fuel)) ordered.push(fuel);
  }
  for (const group of fuelGroups) {
    if (FUEL_CHIP_ORDER.includes(group.fuelLabel as (typeof FUEL_CHIP_ORDER)[number])) continue;
    if (!available.has(group.fuelLabel)) continue;
    if (!ordered.includes(group.fuelLabel)) ordered.push(group.fuelLabel);
  }
  return ordered;
}

/**
 * 기본 선택 연료
 * 1. URL/query fuel
 * 2. fuelOptions 첫 번째
 */
export function resolveDefaultSelectedFuel(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
  urlFuel: string | null | undefined,
): string | null {
  const options = resolveVehicleFuelOptions(slug, fuelGroups);
  if (options.length === 0) return null;

  const normalized = normalizeVehicleFuelParam(urlFuel);
  if (normalized && options.includes(normalized)) return normalized;

  return options[0] ?? null;
}

export const FUEL_MISMATCH_HINT =
  "연료가 다르면 배터리 규격이 달라질 수 있습니다.";

export const FUEL_FILTER_HINT =
  "선택한 연료 기준의 추천 규격만 표시됩니다.";

export const HYBRID_BATTERY_CHECK_MESSAGE =
  "하이브리드 모델은 배터리 구조 확인이 필요합니다.";

export const HYBRID_SPEC_PENDING_MESSAGE = "DIN72R 규격 확인 필요";
