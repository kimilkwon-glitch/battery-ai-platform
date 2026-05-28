import type { SearchCtaLink } from "@/lib/search/battery-recommendation-copy";
import { productBatteryCode } from "@/lib/batteryNormalize";
import { pickRepresentativeBatteryCodes } from "@/lib/vehicleBattery";

export const CTA_PRIMARY_LABELS = new Set([
  "이 규격 자세히 보기",
  "내 차 기준으로 확인",
  "상품 상세보기",
  "해당 규격 보기",
]);

export const CTA_SECONDARY_LABELS = new Set([
  "사진으로 최종 확인",
  "사진으로 확인",
  "사진 보내기",
  "문의하기",
]);

export function isPrimaryCtaLabel(label: string): boolean {
  return CTA_PRIMARY_LABELS.has(label) || /규격 상세$/.test(label);
}

export function isSecondaryCtaLabel(label: string): boolean {
  return CTA_SECONDARY_LABELS.has(label);
}

function decodeFuelQueryParam(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    return decodeURIComponent(raw.trim());
  } catch {
    return raw.trim();
  }
}

/** URL fuel 쿼리 → 폴백 규격 (DB fuelGroups에 없을 때만) */
export function batteryCodeForFuelParam(fuel: string | null | undefined): string | null {
  const t = decodeFuelQueryParam(fuel);
  if (!t) return null;
  if (/하이브|hev/i.test(t)) return "AGM60L";
  if (/디젤/i.test(t)) return "AGM80L";
  if (/lpg/i.test(t)) return "AGM80L";
  return null;
}

function normalizeFuelLabelFromQuery(fuel: string): string {
  if (/하이브|hev/i.test(fuel)) return "하이브리드";
  if (/디젤/i.test(fuel)) return "디젤";
  if (/가솔|휘발/i.test(fuel)) return "가솔린";
  if (/lpg/i.test(fuel)) return "LPG";
  if (/전기|ev/i.test(fuel)) return "전기";
  return fuel;
}

export type FuelGroupBatteryPick = { fuelLabel: string; primaryBattery: string };

/** 차량 상세 — fuel 쿼리 우선, 없으면 fuelGroups·fallback */
export function resolvePrimaryBatteryForFuelQuery(
  fuelRaw: string | null | undefined,
  fuelGroups: FuelGroupBatteryPick[],
  fallback?: string,
): string {
  const fuel = decodeFuelQueryParam(fuelRaw);
  if (fuel && fuelGroups.length) {
    const normalized = normalizeFuelLabelFromQuery(fuel);
    const matching = fuelGroups.filter((g) => g.fuelLabel === normalized);
    const codes = matching.map((g) => g.primaryBattery).filter(Boolean);
    const picked = pickRepresentativeBatteryCodes(codes);
    if (picked) return picked;
  }

  const fromParam = batteryCodeForFuelParam(fuelRaw);
  if (fromParam) return fromParam;

  if (fallback) return productBatteryCode(fallback) || fallback;
  return "AGM80L";
}

export function buildVehicleDetailHref(
  slug: string,
  fuel?: string | null,
  yearChipId?: string | null,
): string {
  const base = `/vehicle/${slug}`;
  const params = new URLSearchParams();
  if (fuel && fuel !== "확인 필요") params.set("fuel", fuel);
  if (yearChipId) params.set("year", yearChipId);
  const qs = params.toString();
  return qs ? `${base}?${qs}#fuel-batteries` : `${base}#fuel-batteries`;
}

export function splitBatteryCtas(ctas: SearchCtaLink[]): {
  primary: SearchCtaLink[];
  secondary: SearchCtaLink[];
} {
  const primary: SearchCtaLink[] = [];
  const secondary: SearchCtaLink[] = [];
  const seen = new Set<string>();

  for (const cta of ctas) {
    if (seen.has(cta.label)) continue;
    seen.add(cta.label);
    if (CTA_PRIMARY_LABELS.has(cta.label)) primary.push(cta);
    else if (CTA_SECONDARY_LABELS.has(cta.label)) secondary.push(cta);
    else secondary.push(cta);
  }

  return {
    primary: primary.slice(0, 2),
    secondary: secondary.slice(0, 4),
  };
}
