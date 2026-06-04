/**
 * 운영 확정 차량 — 고객 화면 배터리 정책 (판매 제외·고정 규격·안내 문구)
 */
import type { FuelBatteryGroup, VehicleBatteryRecord } from "@/lib/vehicleBattery";

export type VehicleBatteryCustomerPolicyKind =
  | "lithium_sales_excluded"
  | "fuel_sales_excluded";

export const LITHIUM_SALES_EXCLUDED_SLUGS = new Set(["niro-sg2"]);

export const FUEL_SALES_EXCLUDED: Record<string, Set<string>> = {
  "kona-sx2": new Set(["하이브리드"]),
};

export const FIXED_BATTERY_NO_UPGRADE_SLUGS = new Set([
  "santafe-mx5",
  "renault-samsung-qm6-quest-2023",
  "daewoo-tosca-2006",
]);

export const FIXED_BATTERY_CUSTOMER_COPY: Record<string, string> = {
  "santafe-mx5":
    "해당 차량은 AGM70L 고정 적용 차량입니다. 업그레이드 장착은 권장하지 않습니다.",
  "renault-samsung-qm6-quest-2023": "DIN74L 고정 적용 차량입니다.",
  "daewoo-tosca-2006": "해당 차량은 80R 고정 적용 차량입니다.",
};

export const LITHIUM_EXCLUDED_VEHICLE_COPY =
  "해당 차량은 리튬배터리 적용 차량으로 일반 납산/AGM 배터리 판매 대상이 아닙니다.";

export const LITHIUM_EXCLUDED_FUEL_COPY =
  "리튬배터리 적용 차량으로 일반 납산/AGM 배터리 판매 대상이 아닙니다.";

export const CRUZE_2015_BRANCH_COPY =
  "가솔린은 DIN60L 기본, 디젤은 DIN74L 기본, ISG 타입은 AGM80L 적용입니다. 트레이 여유에 따라 일부 업그레이드 장착이 가능합니다.";

export const SEARCH_LITHIUM_EXCLUDED_LABEL = "리튬배터리 적용 · 판매 제외";

export function isRecordLithiumSalesExcluded(record: VehicleBatteryRecord): boolean {
  return record.customerPolicy === "lithium_sales_excluded";
}

export function isVehicleFullyLithiumSalesExcluded(slug: string): boolean {
  return LITHIUM_SALES_EXCLUDED_SLUGS.has(slug);
}

export function isVehicleFuelSalesExcluded(slug: string, fuelLabel: string): boolean {
  if (isVehicleFullyLithiumSalesExcluded(slug)) return true;
  return FUEL_SALES_EXCLUDED[slug]?.has(fuelLabel) ?? false;
}

export function shouldRenderFuelGroupInShop(slug: string, fuelLabel: string): boolean {
  return !isVehicleFuelSalesExcluded(slug, fuelLabel);
}

export function applyCustomerBatteryPolicyToGroup(
  slug: string,
  group: FuelBatteryGroup,
): FuelBatteryGroup {
  let next = { ...group };

  if (isVehicleFuelSalesExcluded(slug, group.fuelLabel)) {
    return {
      ...next,
      primaryBattery: "",
      batteryOptions: [],
      alternatives: [],
    };
  }

  if (FIXED_BATTERY_NO_UPGRADE_SLUGS.has(slug)) {
    next = {
      ...next,
      batteryOptions: [],
      alternatives: [],
      caution: FIXED_BATTERY_CUSTOMER_COPY[slug] ?? next.caution,
    };
  }

  if (slug === "chevrolet-the-new-cruze-2015" && !next.caution) {
    next = { ...next, caution: CRUZE_2015_BRANCH_COPY };
  }

  return next;
}

export function applyCustomerBatteryPolicies(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
): FuelBatteryGroup[] {
  return fuelGroups.map((g) => applyCustomerBatteryPolicyToGroup(slug, g));
}

export function getVehicleFixedBatteryNotice(slug: string): string | null {
  return FIXED_BATTERY_CUSTOMER_COPY[slug] ?? null;
}

export function getVehicleSalesExcludedNotice(slug: string): string | null {
  if (isVehicleFullyLithiumSalesExcluded(slug)) return LITHIUM_EXCLUDED_VEHICLE_COPY;
  return null;
}
