/**
 * 차량 등록 공통 — 차종검색·차량정보등록·회원가입 차량 선택 동일 기준
 */

import { getVehicleAsset } from "@/lib/car-assets";
import { getVehicle } from "@/lib/platform-data";
import type { SaveVehicleFromDetailInput } from "@/lib/save-vehicle-from-detail";
import { appendSignupVehicleMode } from "@/lib/signup-vehicle-draft";
import {
  getVehicleConditionSpecLines,
  type VehicleConditionSpecLine,
} from "@/lib/vehicle-condition-spec-lines";

export type VehicleRegistrationPayload = SaveVehicleFromDetailInput & {
  selectedFuel: string | null;
  manufacturer?: string;
};

const YEAR_HIGHLIGHT_KEYS = new Set(["to2019", "from2020"]);

/** 연료/연식 옵션 목록 */
export function getVehicleFuelOptions(slug: string): VehicleConditionSpecLine[] {
  return getVehicleConditionSpecLines(slug);
}

export function vehicleRequiresFuelSelection(slug: string): boolean {
  return getVehicleFuelOptions(slug).length >= 2;
}

export function getVehicleSelectionLabel(slug: string): string {
  return /porter2/i.test(slug) ? "연식" : "연료";
}

export function getDefaultSelectedFuel(slug: string): string | null {
  const options = getVehicleFuelOptions(slug);
  return options.length === 1 ? options[0]!.conditionLabel : null;
}

export function findConditionByLabel(
  slug: string,
  label: string | null | undefined,
): VehicleConditionSpecLine | null {
  if (!label) return null;
  return getVehicleFuelOptions(slug).find((c) => c.conditionLabel === label) ?? null;
}

/** 선택 연료 기준 추천 규격 */
export function resolveBatterySpecForFuel(
  slug: string,
  selectedFuel: string | null | undefined,
): string | undefined {
  return findConditionByLabel(slug, selectedFuel)?.code;
}

export function guessVehicleManufacturer(slug: string): string | undefined {
  const asset = getVehicleAsset(slug);
  const vehicle = getVehicle(slug);
  const brand = asset?.brand ?? vehicle.brand;
  const map: Record<string, string> = {
    hyundai: "현대",
    kia: "기아",
    genesis: "제네시스",
    chevrolet: "쉐보레",
    ssangyong: "KG모빌리티",
    kg: "KG모빌리티",
    renault: "르노코리아",
  };
  if (brand) {
    const key = brand.toLowerCase();
    if (map[key]) return map[key];
    if (["현대", "기아", "제네시스", "쉐보레", "KG모빌리티", "르노코리아"].includes(brand)) {
      return brand;
    }
  }
  const prefix = slug.split("-")[0]?.toLowerCase();
  return prefix ? map[prefix] : undefined;
}

/** 차량 상세/규격보기 URL — 선택 연료·연식 query 유지 */
export function getVehicleDetailUrlWithFuel(
  baseHref: string,
  condition: VehicleConditionSpecLine | null,
  signupVehicleSelect = false,
): string {
  let url = baseHref.split("#")[0]!;
  if (condition) {
    const sep = url.includes("?") ? "&" : "?";
    if (condition.highlightKey && YEAR_HIGHLIGHT_KEYS.has(condition.highlightKey)) {
      url = `${url}${sep}year=${encodeURIComponent(condition.highlightKey)}`;
    } else {
      url = `${url}${sep}fuel=${encodeURIComponent(condition.conditionLabel)}`;
    }
  }
  const hash = baseHref.includes("#") ? baseHref.slice(baseHref.indexOf("#")) : "";
  url = `${url}${hash || ""}`;
  return signupVehicleSelect ? appendSignupVehicleMode(url) : url;
}

/** 등록 payload — 다연료 미선택 시 null */
export function buildVehicleRegistrationPayload(input: {
  slug: string;
  displayName: string;
  yearRange?: string;
  selectedFuel: string | null;
  source?: SaveVehicleFromDetailInput["source"];
  batteryOptions?: string[];
}): VehicleRegistrationPayload | null {
  const options = getVehicleFuelOptions(input.slug);
  if (options.length >= 2 && !input.selectedFuel) return null;

  const condition = input.selectedFuel
    ? findConditionByLabel(input.slug, input.selectedFuel)
    : options[0] ?? null;

  if (!condition && options.length >= 2) return null;

  const fuelHint = condition?.conditionLabel;
  const recommendedBattery = condition?.code;

  return {
    slug: input.slug.trim(),
    displayName: input.displayName.trim(),
    yearRange: input.yearRange?.trim() || undefined,
    fuelHint,
    recommendedBattery,
    batteryOptions: input.batteryOptions,
    source: input.source,
    selectedFuel: fuelHint ?? null,
    manufacturer: guessVehicleManufacturer(input.slug),
  };
}
