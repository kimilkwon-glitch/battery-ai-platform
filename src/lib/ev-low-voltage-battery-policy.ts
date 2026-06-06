/**
 * EV 저전압(보조 12V) 배터리 — 일반 batteryCode와 분리된 매칭 상태
 * EV 12V placeholder는 상품 규격으로 사용하지 않음
 */
import { mapCustomerFuelLabel } from "@/lib/vehicle-fuel-display";
import {
  OPERATOR_FUEL_PRIMARY,
  OPERATOR_SLUG_PRIMARY_BATTERY,
} from "@/lib/vehicle-operator-battery-tables";
import { normalizeBatterySpecCode } from "@/lib/battery-spec-normalization";

/** 내부 매칭 상태값 — /batteries/[code] 상품 코드가 아님 */
export const EV_LOW_VOLTAGE_BATTERY_STATUS = "ev_low_voltage_battery" as const;

/** @deprecated alias — ev_low_voltage_battery와 동일 의미 */
export const EV_AUX_12V_STATUS = "ev_aux_12v" as const;

export type EvLowVoltageBatteryStatus =
  | typeof EV_LOW_VOLTAGE_BATTERY_STATUS
  | typeof EV_AUX_12V_STATUS;

export const EV_LOW_VOLTAGE_DISPLAY_TITLE = "EV 저전압 배터리";
export const EV_LOW_VOLTAGE_DISPLAY_SUBTITLE = "전기차 보조 전원용 12V 배터리";

/** 전체 차량이 EV 저전압 대상 (연료 무관) */
export const EV_LOW_VOLTAGE_VEHICLE_SLUGS = [
  "ioniq5-ne",
  "ioniq6-ce",
  "renault-samsung-sm3-ze-2013",
  "ssangyong-korando-emotion-2022",
] as const;

const EV_LOW_VOLTAGE_VEHICLE_SET = new Set<string>(EV_LOW_VOLTAGE_VEHICLE_SLUGS);

const EV_STATUS_ALIASES = new Set([
  EV_LOW_VOLTAGE_BATTERY_STATUS,
  EV_AUX_12V_STATUS,
  "ev12v",
  "ev 12v",
  "ev12vagm",
]);

export type CustomerBatteryPresentationKind =
  | "ice_product"
  | "ev_low_voltage"
  | "lithium_excluded"
  | "none";

export type CustomerBatteryPresentation = {
  kind: CustomerBatteryPresentationKind;
  /** ICE 상품 규격 (AGM60L 등) */
  productCode: string;
  /** ev_low_voltage_battery 등 내부 상태 */
  matchStatus: string;
  displayTitle: string;
  displaySubtitle: string;
  fuelLabel: string | null;
  allowsOrderFlow: boolean;
  allowsBatteryDetailHref: boolean;
};

export function isEvLowVoltageBatteryStatus(
  code: string | null | undefined,
): boolean {
  if (!code?.trim()) return false;
  const key = code.trim().toLowerCase().replace(/\s+/g, "");
  return EV_STATUS_ALIASES.has(key) || key === "ev_low_voltage_battery";
}

export function isEvLowVoltageVehicle(slug: string): boolean {
  return EV_LOW_VOLTAGE_VEHICLE_SET.has(slug);
}

export function isEvLowVoltageFuel(slug: string, fuelLabel: string): boolean {
  if (isEvLowVoltageVehicle(slug)) return true;
  if (slug !== "kona-sx2") return false;
  return mapCustomerFuelLabel(fuelLabel) === "전기";
}

export function shouldShowEvLowVoltageCard(
  slug: string,
  fuelLabel?: string | null,
): boolean {
  if (isEvLowVoltageVehicle(slug)) return true;
  if (fuelLabel && isEvLowVoltageFuel(slug, fuelLabel)) return true;
  return false;
}

function operatorTokenForSlugFuel(slug: string, fuel?: string | null): string | null {
  const fuelNorm = fuel ? mapCustomerFuelLabel(fuel.trim()) : null;
  if (fuelNorm) {
    const fromFuel = OPERATOR_FUEL_PRIMARY[slug]?.[fuelNorm];
    const norm = normalizeBatterySpecCode(fromFuel);
    if (norm) return norm;
  }
  const fromSlug = normalizeBatterySpecCode(OPERATOR_SLUG_PRIMARY_BATTERY[slug]);
  return fromSlug ?? null;
}

/** 운영자가 EV 차량에 명시한 판매 가능 ICE 규격 (없으면 null) */
export function resolveEvOperatorSellableSpec(
  slug: string,
  fuel?: string | null,
): string | null {
  const token = operatorTokenForSlugFuel(slug, fuel);
  if (!token || isEvLowVoltageBatteryStatus(token)) return null;
  return token;
}

export function resolveCustomerBatteryPresentation(
  slug: string,
  fuelRaw?: string | null,
): CustomerBatteryPresentation {
  const fuelLabel = fuelRaw ? mapCustomerFuelLabel(fuelRaw.trim()) : null;
  const token = operatorTokenForSlugFuel(slug, fuelLabel ?? fuelRaw);

  if (shouldShowEvLowVoltageCard(slug, fuelLabel ?? fuelRaw)) {
    const sellable = resolveEvOperatorSellableSpec(slug, fuelLabel ?? fuelRaw);
    return {
      kind: "ev_low_voltage",
      productCode: sellable ?? "",
      matchStatus: EV_LOW_VOLTAGE_BATTERY_STATUS,
      displayTitle: EV_LOW_VOLTAGE_DISPLAY_TITLE,
      displaySubtitle: EV_LOW_VOLTAGE_DISPLAY_SUBTITLE,
      fuelLabel,
      allowsOrderFlow: Boolean(sellable),
      allowsBatteryDetailHref: Boolean(sellable),
    };
  }

  if (token && !isEvLowVoltageBatteryStatus(token)) {
    return {
      kind: "ice_product",
      productCode: token,
      matchStatus: "",
      displayTitle: token,
      displaySubtitle: "",
      fuelLabel,
      allowsOrderFlow: true,
      allowsBatteryDetailHref: true,
    };
  }

  return {
    kind: "none",
    productCode: "",
    matchStatus: "",
    displayTitle: "",
    displaySubtitle: "",
    fuelLabel,
    allowsOrderFlow: false,
    allowsBatteryDetailHref: false,
  };
}

/** 검색·카드 요약용 표시 문자열 */
export function evLowVoltageSearchDisplayLabel(): string {
  return EV_LOW_VOLTAGE_DISPLAY_TITLE;
}
