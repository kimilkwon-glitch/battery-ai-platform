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

/** 행정구(區) 이름 — 지도 구 단위 그룹·툴팁용 */
export function guLabel(props: BusanHangjeongProps): string {
  const gu = props.sggnm?.trim();
  if (gu) return gu;
  const short = props.adm_nm.replace(/^부산광역시\s*/, "");
  return short.split(/\s+/)[0] ?? short;
}

export function storeLabelForRegion(region: BusanGeoRegion): string | null {
  if (region === "deokcheon") return "덕천점";
  if (region === "hakjang") return "학장점";
  return null;
}
