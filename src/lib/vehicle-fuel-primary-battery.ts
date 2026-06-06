/**
 * 차량 slug + 연료 → 대표 primary battery (고객-facing 단일 기준)
 * 검색 카드 / 차량 상세 히어로 / 하단 CTA — operator 테이블만 사용
 */
import { customerFacingBatteryCode } from "@/lib/canonical-battery-code";
import {
  EV_LOW_VOLTAGE_BATTERY_STATUS,
  isEvLowVoltageBatteryStatus,
  shouldShowEvLowVoltageCard,
} from "@/lib/ev-low-voltage-battery-policy";
import { normalizeBatterySpecCode } from "@/lib/battery-spec-normalization";
import { resolveCustomerCatalogPrimaryBattery } from "@/lib/vehicle-battery-match";
import {
  OPERATOR_FUEL_PRIMARY,
  OPERATOR_SLUG_PRIMARY_BATTERY,
} from "@/lib/vehicle-operator-battery-tables";
import { mapCustomerFuelLabel, sortFuelGroupsByDisplayOrder } from "@/lib/vehicle-fuel-display";
import { prepareCustomerFacingFuelGroups } from "@/lib/vehicle-detail-recommendation";
import type { FuelBatteryGroup } from "@/lib/vehicleBattery";

export { OPERATOR_SLUG_PRIMARY_BATTERY } from "@/lib/vehicle-operator-battery-tables";

function syntheticFuelGroup(fuelLabel: string, primary: string): FuelBatteryGroup {
  return {
    fuel: fuelLabel,
    fuelLabel,
    primaryBattery: primary,
    batteryOptions: [],
    alternatives: [],
    records: [],
    caution: "",
    needsReview: false,
    yearSummary: "",
  };
}

/** DB 연료 그룹 + operator 연료 — 기존 라벨은 operator 규격으로 덮어씀 */
export function mergeOperatorFuelGroups(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
): FuelBatteryGroup[] {
  const operator = OPERATOR_FUEL_PRIMARY[slug];
  if (!operator) return fuelGroups;

  const byLabel = new Map<string, FuelBatteryGroup>();
  for (const g of fuelGroups) {
    const op = normalizeBatterySpecCode(operator[g.fuelLabel]);
    const primary = op
      ? isEvLowVoltageBatteryStatus(op)
        ? EV_LOW_VOLTAGE_BATTERY_STATUS
        : customerFacingBatteryCode(op)
      : "";
    byLabel.set(g.fuelLabel, primary ? { ...g, primaryBattery: primary } : g);
  }

  for (const [fuelLabel, code] of Object.entries(operator)) {
    if (byLabel.has(fuelLabel)) continue;
    const norm = normalizeBatterySpecCode(code);
    const primary = norm
      ? isEvLowVoltageBatteryStatus(norm)
        ? EV_LOW_VOLTAGE_BATTERY_STATUS
        : customerFacingBatteryCode(norm)
      : "";
    if (primary) byLabel.set(fuelLabel, syntheticFuelGroup(fuelLabel, primary));
  }

  return [...byLabel.values()];
}

/** 상단 fuel hero 카드 — highlight 연료 우선·operator 누락 시 주입 */
export function buildFuelHeroCardGroups(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
  highlightFuelRaw?: string | null,
): FuelBatteryGroup[] {
  const highlightFuel = normalizeVehicleFuelParam(highlightFuelRaw);
  const merged = mergeOperatorFuelGroups(slug, fuelGroups);

  let cards = merged.filter((g) => {
    if (shouldShowEvLowVoltageCard(slug, g.fuelLabel)) return true;
    const code = resolveCustomerCatalogPrimaryBattery(slug, g.fuelLabel);
    return Boolean(code);
  });

  if (cards.length === 0) {
    const slugLevel = resolveCustomerCatalogPrimaryBattery(slug);
    if (slugLevel) {
      cards = [syntheticFuelGroup("공통", slugLevel)];
    } else if (shouldShowEvLowVoltageCard(slug)) {
      cards = [syntheticFuelGroup("전기", EV_LOW_VOLTAGE_BATTERY_STATUS)];
    }
  }

  if (highlightFuel) {
    const code = resolveCustomerCatalogPrimaryBattery(slug, highlightFuel);
    if (code && !cards.some((c) => c.fuelLabel === highlightFuel)) {
      cards = [syntheticFuelGroup(highlightFuel, code), ...cards];
    }
    cards = [...cards].sort((a, b) => {
      if (a.fuelLabel === highlightFuel) return -1;
      if (b.fuelLabel === highlightFuel) return 1;
      return 0;
    });
  }

  return prepareCustomerFacingFuelGroups(slug, sortFuelGroupsByDisplayOrder(cards));
}

/** URL fuel 쿼리 → 표준 연료 라벨 */
export function normalizeVehicleFuelParam(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return mapCustomerFuelLabel(raw.trim());
}

/**
 * 차량+연료 대표 규격 — operator 테이블만 (legacy DB/enrichment 미사용)
 */
export function resolveVehicleFuelPrimaryBattery(
  slug: string,
  fuelRaw: string | null | undefined,
  _options?: { yearChipId?: string | null; fallback?: string | null },
): string {
  return resolveCustomerCatalogPrimaryBattery(slug, fuelRaw);
}
