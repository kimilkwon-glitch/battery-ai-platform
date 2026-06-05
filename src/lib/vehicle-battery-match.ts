/**
 * 차종표·고객 UI — 배터리 매칭 여부 (검수 상태와 분리)
 * hasBatteryMatch = 유효한 대표 규격 또는 후보 존재
 */
import { getVehicleAsset, type VehicleAsset } from "@/lib/car-assets";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
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

const PLACEHOLDER_RE =
  /^(—|-|없음|미등록|확인\s*필요|사진\s*확인|상담\s*확인|문의\s*필요|준비\s*중)$/i;

export function isValidBatterySpecCode(spec: string | null | undefined): boolean {
  if (!spec?.trim()) return false;
  const t = spec.trim();
  if (PLACEHOLDER_RE.test(t)) return false;
  if (/확인\s*필요|사진\s*확인|상담|문의|미등록|준비\s*중/i.test(t)) return false;
  return true;
}

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

/** 차종표 기준 대표 규격 (운영 단일 기준) */
export function resolveCatalogPrimaryBattery(
  slug: string,
  asset?: VehicleAsset | null,
): string {
  const a = asset ?? getVehicleAsset(slug);
  return OPERATOR_SLUG_PRIMARY_BATTERY[slug] ?? a?.defaultBatteryCode ?? "—";
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
      if (isValidBatterySpecCode(code)) out.push(code.trim());
    }
  }

  return [...new Set(out)];
}

export function hasCatalogBatteryMatch(slug: string, asset?: VehicleAsset | null): boolean {
  return resolveCatalogBatteryCandidates(slug, asset).length > 0;
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
  asset?: VehicleAsset | null,
): string {
  const slugPrimary = OPERATOR_SLUG_PRIMARY_BATTERY[slug];
  if (isValidBatterySpecCode(slugPrimary)) {
    return canonicalBatteryCode(slugPrimary!);
  }

  const fuel = normalizeFuelParam(fuelRaw);
  const operator = fuel ? OPERATOR_FUEL_PRIMARY[slug]?.[fuel] : undefined;
  if (isValidBatterySpecCode(operator)) {
    return canonicalBatteryCode(operator!);
  }

  const a = asset ?? getVehicleAsset(slug);
  if (isValidBatterySpecCode(a?.defaultBatteryCode)) {
    return canonicalBatteryCode(a!.defaultBatteryCode!);
  }

  return "";
}

export function customerBatteryPendingMessage(): string {
  return BATTERY_MATCH_PENDING_MESSAGE;
}
