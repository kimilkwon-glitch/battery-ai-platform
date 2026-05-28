import type { VehicleBatterySpecTier } from "@/lib/search/resolve-vehicle-battery-spec";
import { HUB_PHOTO } from "@/lib/customer-hub-routes";

/** 검색·카드 전체에서 1회만 사용 */
export const SHORT_EXCEPTION_NOTE =
  "연식·트림에 따라 예외가 있을 수 있어 사진 확인을 권장합니다.";

/** @deprecated — SHORT_EXCEPTION_NOTE 사용 */
export const SECONDARY_PHOTO_NOTE = SHORT_EXCEPTION_NOTE;

export const NO_REGISTERED_SPEC_MESSAGE =
  "아직 등록된 차량 규격 정보가 없습니다. 차량 정보를 보내주시면 확인 후 반영할 수 있습니다.";

export const NO_VEHICLE_MATCH_MESSAGE =
  "일치하는 차량 정보를 찾지 못했습니다. 차량명, 연식, 연료를 다시 입력하거나 사진으로 확인해 주세요.";

export type SearchCtaLink = { label: string; href: string };

export const PRIMARY_BATTERY_CTAS = (code: string): SearchCtaLink[] => [
  { label: "이 규격 자세히 보기", href: `/batteries/${encodeURIComponent(code)}` },
  { label: "사진으로 확인", href: HUB_PHOTO },
  { label: "문의하기", href: "/ai" },
];

export function buildDbRegistrationHref(vehicleLabel: string, query?: string): string {
  const base = query?.trim() || vehicleLabel;
  const msg = `[차량 규격 등록 요청] ${base} — 차량명·연식·연료·현재 장착 배터리 사진`;
  return `/ai?q=${encodeURIComponent(msg)}`;
}

export function secondaryNoteForTier(tier: VehicleBatterySpecTier): string | null {
  if (tier === "exact" || tier === "db" || tier === "map") return SHORT_EXCEPTION_NOTE;
  return null;
}

export function basisLabelForTier(
  tier: VehicleBatterySpecTier,
  source: "vehicle-battery-db" | "fitment-override" | "car-asset-default" | "candidate-map" | null,
): string | null {
  if (tier === "none") return null;
  if (tier === "exact") return "검색 규격";
  if (source === "fitment-override") return "연식·차종 기준";
  if (tier === "db" || source === "vehicle-battery-db") return "차종·규격 기준";
  if (tier === "map") return "우선 확인 후보";
  return "확인 기준";
}

export function vehicleContextLine(vehicleLabel: string, fieldLabel: string): string {
  const short = vehicleLabel.replace(/^기아\s+|^현대\s+|^제네시스\s+/u, "").trim() || vehicleLabel;
  if (fieldLabel === "검색한 규격") {
    return `${short} 검색 기준 규격`;
  }
  return `${short} 기준 우선 확인 규격`;
}

export function buildNoSpecPrimaryCtas(vehicleLabel: string, query: string): SearchCtaLink[] {
  return [
    { label: "규격 등록 요청", href: buildDbRegistrationHref(vehicleLabel, query) },
    { label: "사진 보내기", href: HUB_PHOTO },
    { label: "문의하기", href: "/ai" },
  ];
}

export function buildNoSpecSecondaryLinks(): SearchCtaLink[] {
  return [{ label: "차량 정보 더 입력", href: "/vehicles" }];
}
