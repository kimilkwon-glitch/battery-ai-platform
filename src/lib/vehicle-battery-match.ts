/**
 * 차종표·고객 UI — 배터리 매칭 여부 (검수 상태와 분리)
 * hasBatteryMatch = 유효한 대표 규격 또는 후보 존재
 */
import type { VehicleAsset } from "@/lib/car-assets";
import { customerFacingBatteryCode } from "@/lib/canonical-battery-code";
import {
  isEvLowVoltageBatteryStatus,
  shouldShowEvLowVoltageCard,
} from "@/lib/ev-low-voltage-battery-policy";
import {
  isValidBatterySpecCode,
  normalizeBatterySpecCode,
} from "@/lib/battery-spec-normalization";
import { mapCustomerFuelLabel } from "@/lib/vehicle-fuel-display";
import {
  OPERATOR_FUEL_PRIMARY,
  OPERATOR_SLUG_PRIMARY_BATTERY,
} from "@/lib/vehicle-operator-battery-tables";

export type BatteryMatchStatus = "matched" | "unmatched";
export type VehicleImageStatus = "present" | "missing";

/** 고객 안내 — 대표 규격 미등록 */
export const BATTERY_MATCH_PENDING_MESSAGE = "현재 배터리 규격 확인 중";
export const BATTERY_MATCH_PHOTO_MESSAGE = "사진 확인/문의 필요";

export { isValidBatterySpecCode, normalizeBatterySpecCode } from "@/lib/battery-spec-normalization";

export function hasBatteryMatch(
  primary: string | null | undefined,
  candidates?: Iterable<string | null | undefined>,
): boolean {
  if (isValidBatterySpecCode(primary)) return true;
  if (!candidates) return false;
  for (const c of candidates) {
    if (isValidBatterySpecCode(c)) return true;
  }
  return false;
}

export function resolveBatteryMatchStatus(
  primary: string | null | undefined,
  candidates?: Iterable<string | null | undefined>,
): BatteryMatchStatus {
  return hasBatteryMatch(primary, candidates) ? "matched" : "unmatched";
}

function operatorPrimaryRaw(slug: string): string | null {
  const raw = OPERATOR_SLUG_PRIMARY_BATTERY[slug];
  return normalizeBatterySpecCode(raw) ?? null;
}

function operatorFuelRaw(slug: string, fuel: string): string | null {
  const raw = OPERATOR_FUEL_PRIMARY[slug]?.[fuel];
  return normalizeBatterySpecCode(raw) ?? null;
}

/** 차종표 기준 대표 규격 (운영 단일 기준) */
export function resolveCatalogPrimaryBattery(
  slug: string,
  _asset?: VehicleAsset | null,
): string {
  return operatorPrimaryRaw(slug) ?? "—";
}

/** 차종표·연료별 운영 후보 */
export function resolveCatalogBatteryCandidates(
  slug: string,
  asset?: VehicleAsset | null,
): string[] {
  const out: string[] = [];
  const primary = resolveCatalogPrimaryBattery(slug, asset);
  if (isValidBatterySpecCode(primary)) out.push(primary.trim());

  const fuelMap = OPERATOR_FUEL_PRIMARY[slug];
  if (fuelMap) {
    for (const code of Object.values(fuelMap)) {
      const norm = normalizeBatterySpecCode(code);
      if (norm) out.push(norm);
    }
  }

  return [...new Set(out)];
}

export function isIceBatteryProductSpecCode(spec: string | null | undefined): boolean {
  const norm = normalizeBatterySpecCode(spec);
  return Boolean(norm && !isEvLowVoltageBatteryStatus(norm));
}

export function hasCatalogBatteryMatch(slug: string, asset?: VehicleAsset | null): boolean {
  if (shouldShowEvLowVoltageCard(slug)) return true;
  return resolveCatalogBatteryCandidates(slug, asset).some(isIceBatteryProductSpecCode);
}

function normalizeFuelParam(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return mapCustomerFuelLabel(raw.trim());
}

/**
 * 고객-facing 대표 규격 — DB·enrichment 미사용 (차종표·운영 후보만)
 */
export function resolveCustomerCatalogPrimaryBattery(
  slug: string,
  fuelRaw?: string | null,
  _asset?: VehicleAsset | null,
): string {
  const fuel = normalizeFuelParam(fuelRaw);
  if (fuel) {
    const fuelPrimary = operatorFuelRaw(slug, fuel);
    if (fuelPrimary) return customerFacingBatteryCode(fuelPrimary);
  }

  const slugPrimary = operatorPrimaryRaw(slug);
  if (slugPrimary) return customerFacingBatteryCode(slugPrimary);

  return "";
}

/** 고객-facing 배터리 source — audit·디버그 */
export function customerFacingBatterySource(
  slug: string,
  fuelRaw?: string | null,
): "operator_slug_primary" | "operator_fuel_map" | "none" {
  const fuel = normalizeFuelParam(fuelRaw);
  if (fuel && operatorFuelRaw(slug, fuel)) return "operator_fuel_map";
  if (operatorPrimaryRaw(slug)) return "operator_slug_primary";
  return "none";
}

export function customerBatteryPendingMessage(): string {
  return BATTERY_MATCH_PENDING_MESSAGE;
}
