/**
 * 배터리 규격 canonical code — UI·href·검색·상세 제목의 단일 기준
 * CMF80L 등 prefix 포함 전체 코드 유지. 80L 등은 family/별칭 매칭에만 사용.
 */
import { getCanonicalBatteryCode } from "@/lib/battery-alias-map";
import { isEvLowVoltageBatteryStatus } from "@/lib/ev-low-voltage-battery-policy";
import { normalizeBatterySpecCode } from "@/lib/battery-spec-normalization";
import {
  isBareJisBatterySpec,
  normalizeBatteryCode,
  productBatteryCode,
} from "@/lib/batteryNormalize";

/** 화면 표시·href·displayCode·specDisplay·data-primary-battery */
const PREFIXED_PRODUCT_INPUT =
  /^(AGM|DIN|CMF|GB|DF|EFB|MF|EV)\s*(\d+[A-Z]?|[A-Z]?\d+[LR])$/i;

/** URL·카드 입력이 CMF80L 등 전체 상품코드일 때 family(80L)로 붕괴하지 않음 */
export function canonicalBatteryCode(raw: string | null | undefined): string {
  const normalized = normalizeBatterySpecCode(raw);
  if (!normalized || isEvLowVoltageBatteryStatus(normalized)) return "";
  const trimmed = normalized.replace(/\s+/g, "");
  const upper = trimmed.toUpperCase();

  if (isBareJisBatterySpec(trimmed)) {
    return upper;
  }

  if (PREFIXED_PRODUCT_INPUT.test(upper)) {
    const viaProduct = productBatteryCode(upper);
    if (viaProduct) return viaProduct;
    return upper;
  }

  const viaProduct = productBatteryCode(trimmed);
  if (viaProduct) return viaProduct;

  const alias = getCanonicalBatteryCode(trimmed);
  if (alias) {
    const viaAlias = productBatteryCode(alias);
    return viaAlias || alias;
  }

  if (/^(CMF|AGM|DIN|GB|DF|EFB|MF|EV)/i.test(upper)) {
    return upper;
  }
  return normalizeBatteryCode(trimmed) || upper;
}

/** 상품 상세·구매 (/batteries/[code]) */
export function batteryDetailHref(raw: string | null | undefined): string {
  const code = canonicalBatteryCode(raw);
  return code ? `/batteries/${encodeURIComponent(code)}` : "/batteries";
}

/** 규격 확인 전용 (/battery-specs/[code]) — 주문·구매 UI 없음 */
export function batterySpecHref(raw: string | null | undefined): string {
  const code = canonicalBatteryCode(raw);
  return code ? `/battery-specs/${encodeURIComponent(code)}` : "/battery-specs";
}

/** @deprecated 고객 카드 CTA는 batteryDetailHref / batterySpecHref 사용 */
export const batteryPurchaseHref = batteryDetailHref;

/**
 * 고객 화면 표시용 — AGM/DIN/일반 JIS 규격 자동 변환 없음 (80R≠AGM80R, 50L≠DIN50L)
 */
export function customerFacingBatteryCode(raw: string | null | undefined): string {
  const normalized = normalizeBatterySpecCode(raw);
  if (!normalized || isEvLowVoltageBatteryStatus(normalized)) return "";
  const trimmed = normalized;
  const upper = trimmed.replace(/\s+/g, "").toUpperCase();

  if (isBareJisBatterySpec(trimmed)) return upper;

  const viaCanon = canonicalBatteryCode(trimmed);
  if (/^(AGM|DIN|CMF|GB|DF|EFB|MF|EV)/i.test(viaCanon)) return viaCanon;

  const viaProduct = productBatteryCode(trimmed);
  if (/^(AGM|DIN|CMF|GB|DF|EFB|MF|EV)/i.test(viaProduct)) return viaProduct;

  return viaCanon || viaProduct || upper;
}

/** DB 매칭·비교용 family key (내부) */
export function batteryFamilyKey(raw: string | null | undefined): string {
  const canonical = canonicalBatteryCode(raw);
  return canonical ? normalizeBatteryCode(canonical) : normalizeBatteryCode(raw ?? "");
}
