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

/** 지도·패널용 구 단위 대표 권역 (강서구는 학장점 기준, 대저1동은 패널 보조 안내) */
export function assignBusanGuRegion(gu: string): BusanGeoRegion {
  const g = gu.trim();
  if (g === "북구" || g === "금정구" || g === "연제구") return "deokcheon";
  if (g === "사상구" || g === "사하구" || g === "부산진구" || g === "강서구") return "hakjang";
  return "neutral";
}

/** 강서구 등 동 단위 예외가 있는 구 */
export function guHasDongLevelExceptions(gu: string): boolean {
  return gu.trim() === "강서구";
}

/** 지도에 구 이름 라벨 표시 (전 구 — 작은 구는 작은 글씨) */
export const BUSAN_GU_MAP_LABELS = new Set([
  "강서구",
  "금정구",
  "기장군",
  "남구",
  "동구",
  "동래구",
  "부산진구",
  "북구",
  "사상구",
  "사하구",
  "서구",
  "수영구",
  "연제구",
  "영도구",
  "중구",
  "해운대구",
]);

export function guTooltipHint(gu: string, region: BusanGeoRegion): string {
  const store = storeLabelForRegion(region);
  if (guHasDongLevelExceptions(gu)) {
    return "대저1동·명지 등 동별 담당이 다를 수 있습니다 · 가까운 권역 기준 안내";
  }
  if (store) return "가까운 권역 기준 우선 안내";
  return "전화 상담 후 가까운 직영점 안내";
}

export function guPanelCoverage(gu: string, region: BusanGeoRegion): string {
  if (region === "deokcheon") {
    if (gu === "북구") return "북구 · 대저1동 · 금곡 · 연제 인근 우선 안내";
    if (gu === "금정구") return "금정·구서·장전권 덕천점 기준 출장·내방";
    if (gu === "연제구") return "연산·온천·연제권 덕천점 기준 안내";
    return "북구 · 대저1동 · 금정 · 연제 권역";
  }
  if (region === "hakjang") {
    if (gu === "사상구") return "사상 · 엄궁 · 괘법권 학장점 중심";
    if (gu === "사하구") return "하단 · 당리 · 괴정권 학장점 중심";
    if (gu === "강서구") return "명지·강서동권 학장점 · 대저1동은 덕천점 참고";
    if (gu === "부산진구") return "서면 · 부전 · 전포권 학장점 기준";
    return "사상 · 사하 · 강서 · 명지 · 서부산권";
  }
  return "직영점 권역 밖일 수 있습니다 · 전화로 위치를 알려주시면 배정";
}

/** 동·구 검색어 → 강조할 구 이름 (없으면 null) */
export function resolveGuFromSearch(
  raw: string,
  knownGu: string[],
): { gu: string; matchedDong?: string } | null {
  const q = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (!q) return null;

  for (const gu of knownGu) {
    const g = gu.toLowerCase().replace(/구$/, "");
    if (q.includes(gu.toLowerCase()) || q.includes(g)) {
      return { gu };
    }
  }

  const dongToGu: Record<string, string> = {
    화명: "북구",
    화명동: "북구",
    덕천: "북구",
    구포: "북구",
    만덕: "북구",
    금곡: "북구",
    연산: "연제구",
    연산동: "연제구",
    온천: "동래구",
    사직: "동래구",
    명지: "강서구",
    명지동: "강서구",
    대저1: "강서구",
    대저1동: "강서구",
    대저2: "강서구",
    엄궁: "사상구",
    학장: "사상구",
    하단: "사하구",
    서면: "부산진구",
    해운대: "해운대구",
    센텀: "해운대구",
  };

  for (const [key, gu] of Object.entries(dongToGu)) {
    if (q.includes(key.toLowerCase())) return { gu, matchedDong: key };
  }

  return null;
}
