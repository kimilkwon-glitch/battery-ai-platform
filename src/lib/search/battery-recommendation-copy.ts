import type { VehicleBatterySpecTier } from "@/lib/search/resolve-vehicle-battery-spec";
import { buildBatteryCheckoutHref, batterySpecDetailViewHref } from "@/lib/battery-card-cta";
import { HUB_PHOTO } from "@/lib/customer-hub-routes";

/** 검색·카드 — 확정 규격 외 보조 1줄 (과도한 방어 문구 금지) */
export const SHORT_EXCEPTION_NOTE: string | null = null;

/** @deprecated — SHORT_EXCEPTION_NOTE 사용 */
export const SECONDARY_PHOTO_NOTE = SHORT_EXCEPTION_NOTE;

export const NO_REGISTERED_SPEC_MESSAGE =
  "아직 등록된 차량 규격 정보가 없습니다. 차량 정보를 보내주시면 확인 후 반영할 수 있습니다.";

export const NO_VEHICLE_MATCH_MESSAGE =
  "일치하는 차량 정보를 찾지 못했습니다. 차량명, 연식, 연료를 다시 입력하거나 사진으로 확인해 주세요.";

export type SearchCtaLink = { label: string; href: string };

export const PRIMARY_BATTERY_CTAS = (code: string): SearchCtaLink[] => [
  { label: "주문하기", href: buildBatteryCheckoutHref({ battery: code, flow: "buy_now" }) },
  { label: "배터리 규격 보기", href: batterySpecDetailViewHref(code) },
  { label: "사진으로 규격 확인", href: HUB_PHOTO },
  { label: "리뷰 보기", href: `/reviews?battery=${encodeURIComponent(code)}` },
];

export function buildDbRegistrationHref(vehicleLabel: string, query?: string): string {
  const base = query?.trim() || vehicleLabel;
  const msg = `[차량 규격 등록 요청] ${base} — 차량명·연식·연료·현재 장착 배터리 사진`;
  return `/ai?q=${encodeURIComponent(msg)}`;
}

export function secondaryNoteForTier(tier: VehicleBatterySpecTier): string | null {
  if (tier === "map") return "연료 선택 시 더 정확합니다.";
  return SHORT_EXCEPTION_NOTE;
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
