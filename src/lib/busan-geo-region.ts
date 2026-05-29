import type { BusanStoreId } from "@/lib/busan-store-matcher";

/** 행정동 GeoJSON feature → 덕천점/학장점/기타 권역 (검색 로직과 분리) */

export type BusanGeoRegion = BusanStoreId | "neutral";

export type BusanHangjeongProps = {
  adm_nm: string;
  adm_cd: string;
  sggnm: string;
};

/**
 * 대저1동 → 덕천점, 대저2동·명지 → 학장점 예외 후 구 단위 매핑.
 * 강서구는 대저1동만 덕천, 나머지 동(명지 포함)은 학장점.
 */
export function assignBusanGeoRegion(props: BusanHangjeongProps): BusanGeoRegion {
  const { adm_nm, sggnm } = props;

  if (/대저1/.test(adm_nm)) return "deokcheon";
  if (/대저2/.test(adm_nm)) return "hakjang";
  if (/명지/.test(adm_nm)) return "hakjang";

  const gu = sggnm?.trim() || adm_nm.replace(/^부산광역시\s*/, "").split(/\s/)[0] || "";

  if (gu === "북구" || gu === "금정구" || gu === "연제구") return "deokcheon";
  if (gu === "사상구" || gu === "사하구" || gu === "부산진구") return "hakjang";
  if (gu === "강서구") return "hakjang";

  return "neutral";
}

export function regionLabel(adm_nm: string): string {
  const short = adm_nm.replace(/^부산광역시\s*/, "");
  const parts = short.split(/\s+/);
  return parts[parts.length - 1] ?? short;
}
