/**
 * 배터리 규격 canonical code — UI·href·검색·상세 제목의 단일 기준
 * CMF80L 등 prefix 포함 전체 코드 유지. 80L 등은 family/별칭 매칭에만 사용.
 */
import { getCanonicalBatteryCode } from "@/lib/battery-alias-map";
import { normalizeBatteryCode, productBatteryCode } from "@/lib/batteryNormalize";

/** 화면 표시·href·displayCode·specDisplay·data-primary-battery */
export function canonicalBatteryCode(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  const trimmed = raw.trim();
  const viaProduct = productBatteryCode(trimmed);
  if (viaProduct) return viaProduct;

  const alias = getCanonicalBatteryCode(trimmed);
  if (alias) {
    const viaAlias = productBatteryCode(alias);
    return viaAlias || alias;
  }

  // 90R·100R 등 family-only 코드만 normalize; CMF80L→80L 붕괴 방지
  if (/^(CMF|AGM|DIN|GB|DF|EFB|MF|EV)/i.test(trimmed)) {
    return trimmed.replace(/\s+/g, "").toUpperCase();
  }
  return normalizeBatteryCode(trimmed) || trimmed.toUpperCase();
}

export function batteryDetailHref(raw: string | null | undefined): string {
  const code = canonicalBatteryCode(raw);
  return code ? `/batteries/${encodeURIComponent(code)}` : "/batteries";
}

/** DB 매칭·비교용 family key (내부) */
export function batteryFamilyKey(raw: string | null | undefined): string {
  const canonical = canonicalBatteryCode(raw);
  return canonical ? normalizeBatteryCode(canonical) : normalizeBatteryCode(raw ?? "");
}
