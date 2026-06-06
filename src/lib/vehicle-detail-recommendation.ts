/**
 * 차량 상세 — 고객-facing 배터리 추천 노출 우선순위
 * (구조화 추천 > 단일 추천 > fallback, 중복·경고 억제)
 */
import {
  EV_LOW_VOLTAGE_BATTERY_STATUS,
  EV_LOW_VOLTAGE_DISPLAY_TITLE,
  isEvLowVoltageBatteryStatus,
  isEvLowVoltageVehicle,
  shouldShowEvLowVoltageCard,
} from "@/lib/ev-low-voltage-battery-policy";
import {
  hasCatalogBatteryMatch,
  isIceBatteryProductSpecCode,
  isValidBatterySpecCode,
  resolveCustomerCatalogPrimaryBattery,
} from "@/lib/vehicle-battery-match";
import {
  CUSTOMER_FUEL_DISPLAY_ORDER,
  sortFuelGroupsByDisplayOrder,
} from "@/lib/vehicle-fuel-display";
import { hasStrictBrandProductImage } from "@/lib/battery-alias-map";
import type { FuelBatteryGroup } from "@/lib/vehicleBattery";

export const VEHICLE_TRIM_CAUTION_COPY =
  "연식·트림·ISG 여부에 따라 규격이 달라질 수 있습니다. 장착 전 단자 방향과 트레이 공간을 확인해 주세요.";

const FALLBACK_FUEL_LABELS = new Set(["확인 필요", "공통"]);

const STRUCTURED_FUEL_LABELS: Set<string> = new Set(
  CUSTOMER_FUEL_DISPLAY_ORDER.filter((l) => !FALLBACK_FUEL_LABELS.has(l)),
);

export function isFallbackFuelLabel(fuelLabel: string): boolean {
  return FALLBACK_FUEL_LABELS.has(fuelLabel);
}

export function isStructuredFuelLabel(fuelLabel: string): boolean {
  return STRUCTURED_FUEL_LABELS.has(fuelLabel);
}

function groupHasRenderableBattery(slug: string, group: FuelBatteryGroup): boolean {
  if (!hasCatalogBatteryMatch(slug)) return false;
  if (shouldShowEvLowVoltageCard(slug, group.fuelLabel)) return true;
  const code = resolveCustomerCatalogPrimaryBattery(slug, group.fuelLabel) || "";
  return isIceBatteryProductSpecCode(code);
}

/** 연료·조건별 구조화 추천(확인 필요/공통 제외) */
export function hasStructuredFuelRecommendations(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
): boolean {
  return fuelGroups.some(
    (g) => isStructuredFuelLabel(g.fuelLabel) && groupHasRenderableBattery(slug, g),
  );
}

/** 단일 대표 규격(연료 라벨 무관) */
export function hasSingleFuelRecommendation(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
): boolean {
  if (fuelGroups.length === 0) return false;
  const codes = new Set(
    fuelGroups
      .map((g) => resolveCustomerCatalogPrimaryBattery(slug, g.fuelLabel) || "")
      .filter(isValidBatterySpecCode),
  );
  return codes.size === 1 && groupHasRenderableBattery(slug, fuelGroups[0]!);
}

function countBrandCatalogCardsForSpec(specCode: string): number {
  let n = 0;
  if (hasStrictBrandProductImage(specCode, "rocket")) n += 1;
  if (hasStrictBrandProductImage(specCode, "solite")) n += 1;
  return n;
}

export function countCustomerProductCards(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
): number {
  const cards = prepareCustomerFacingFuelGroups(slug, fuelGroups);
  return cards.reduce((sum, g) => {
    if (!groupHasRenderableBattery(slug, g)) return sum;
    const code = resolveCustomerCatalogPrimaryBattery(slug, g.fuelLabel) || "";
    return sum + (code ? countBrandCatalogCardsForSpec(code) : 0);
  }, 0);
}

/** 동일 연료 라벨 다연식 버킷 → 카드 1장 */
export function dedupeFuelGroupsByLabel(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
): FuelBatteryGroup[] {
  const byLabel = new Map<string, FuelBatteryGroup>();

  for (const g of fuelGroups) {
    const unified =
      resolveCustomerCatalogPrimaryBattery(slug, g.fuelLabel) ||
      (shouldShowEvLowVoltageCard(slug, g.fuelLabel) ||
      isEvLowVoltageBatteryStatus(g.primaryBattery)
        ? EV_LOW_VOLTAGE_BATTERY_STATUS
        : "");
    if (!unified) continue;

    const existing = byLabel.get(g.fuelLabel);
    if (!existing) {
      byLabel.set(g.fuelLabel, { ...g, primaryBattery: unified });
      continue;
    }
    byLabel.set(g.fuelLabel, {
      ...existing,
      primaryBattery: unified,
      records: [...existing.records, ...g.records],
      batteryOptions: [
        ...new Set([...existing.batteryOptions, ...g.batteryOptions, unified]),
      ],
      alternatives: [...existing.alternatives, ...g.alternatives],
      needsReview: existing.needsReview && g.needsReview,
      yearSummary: existing.yearSummary || g.yearSummary,
    });
  }

  return sortFuelGroupsByDisplayOrder([...byLabel.values()]);
}

/**
 * 구조화 추천이 있으면 확인 필요/공통 fallback 그룹 제거
 */
export function filterFallbackFuelGroups(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
): FuelBatteryGroup[] {
  const withBattery = fuelGroups.filter((g) => groupHasRenderableBattery(slug, g));
  if (!hasStructuredFuelRecommendations(slug, withBattery)) {
    return withBattery;
  }
  return withBattery.filter((g) => !isFallbackFuelLabel(g.fuelLabel));
}

export function prepareCustomerFacingFuelGroups(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
): FuelBatteryGroup[] {
  return filterFallbackFuelGroups(slug, dedupeFuelGroupsByLabel(slug, fuelGroups));
}

export function shouldRenderFallbackRecommendation(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
): boolean {
  const facing = prepareCustomerFacingFuelGroups(slug, fuelGroups);
  if (hasStructuredFuelRecommendations(slug, facing)) return false;
  if (hasSingleFuelRecommendation(slug, facing)) return false;
  if (countCustomerProductCards(slug, facing) > 0) return false;
  return facing.some((g) => isFallbackFuelLabel(g.fuelLabel) && groupHasRenderableBattery(slug, g));
}

/** 상세 히어로 대표 규격 — 구조화 연료 우선 */
export function customerFacingRepresentativeBattery(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
  _summaryRep?: string | null,
): string {
  if (!hasCatalogBatteryMatch(slug)) return "";
  if (isEvLowVoltageVehicle(slug)) {
    return EV_LOW_VOLTAGE_DISPLAY_TITLE;
  }
  const facing = prepareCustomerFacingFuelGroups(slug, fuelGroups);
  const gas = resolveCustomerCatalogPrimaryBattery(slug, "가솔린");
  const diesel = resolveCustomerCatalogPrimaryBattery(slug, "디젤");
  if (gas && diesel && gas === diesel) return gas;
  if (gas) return gas;
  if (diesel) return diesel;
  for (const g of facing) {
    const code = resolveCustomerCatalogPrimaryBattery(slug, g.fuelLabel);
    if (isValidBatterySpecCode(code)) return code!;
  }
  return resolveCustomerCatalogPrimaryBattery(slug) || "";
}

/**
 * 연식·트림·ISG 노란 안내 — 추천·상품이 없을 때만
 */
export function shouldShowVehicleTrimCautionNotice(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
): boolean {
  const facing = prepareCustomerFacingFuelGroups(slug, fuelGroups);
  if (facing.length > 0 && facing.some((g) => groupHasRenderableBattery(slug, g))) {
    return false;
  }
  return true;
}

/** 검색·카드 review 플래그 — 실질 추천·상품 없을 때만 */
export function isVehicleReviewOnlyState(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
  options?: {
    primaryBattery?: string | null;
    batteryOptions?: string[];
    defaultBatteryCode?: string | null;
    usableDbCandidate?: boolean;
  },
): boolean {
  const facing = prepareCustomerFacingFuelGroups(slug, fuelGroups);
  if (hasStructuredFuelRecommendations(slug, facing)) return false;
  if (hasSingleFuelRecommendation(slug, facing)) return false;
  if (countCustomerProductCards(slug, facing) > 0) return false;
  if (isValidBatterySpecCode(options?.primaryBattery)) return false;
  if (options?.batteryOptions?.some(isValidBatterySpecCode)) return false;
  if (hasCatalogBatteryMatch(slug)) return false;
  if (isValidBatterySpecCode(options?.defaultBatteryCode) && !facing.length) return false;
  return true;
}
