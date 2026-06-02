/** 메인 Hero 검색 유형 — /search?type= 쿼리와 동기화 */

export type HomeSearchType = "all" | "vehicle" | "battery" | "symptom" | "qa";

export type HomeSearchTypeMenuItem = {
  id: HomeSearchType;
  label: string;
  hint: string;
};

/** 고객 검색창 — 차종·규격만 (증상·Q&A는 가이드·증상 페이지) */
export const HOME_SEARCH_TYPE_OPTIONS: { id: HomeSearchType; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "vehicle", label: "차종" },
  { id: "battery", label: "규격" },
];

export const HOME_SEARCH_TYPE_MENU: HomeSearchTypeMenuItem[] = [
  { id: "all", label: "전체", hint: "차종·배터리 규격 통합 검색" },
  { id: "vehicle", label: "차종", hint: "GV80, 쏘렌토 MQ4, 스타리아" },
  { id: "battery", label: "규격", hint: "AGM80L, AGM95R, DIN74L, 100R" },
];

export const HOME_SEARCH_PLACEHOLDERS: Record<HomeSearchType, string> = {
  all: "차종·배터리 규격을 입력하세요",
  vehicle: "예: GV80, 쏘렌토 MQ4, 스타리아",
  battery: "예: AGM80L, AGM95R, DIN74L, 100R",
  symptom: "증상은 배터리 가이드·증상 페이지에서 확인",
  qa: "궁금한 내용은 Q&A에서 확인",
};

export function getHomeSearchHref(query: string, type: HomeSearchType = "all"): string {
  const params = new URLSearchParams();
  const q = query.trim();
  if (q) params.set("q", q);
  if (type !== "all") params.set("type", type);
  const s = params.toString();
  return s ? `/search?${s}` : "/search";
}

export function parseHomeSearchType(raw: string | null | undefined): HomeSearchType {
  if (raw === "vehicle" || raw === "battery" || raw === "symptom" || raw === "qa") return raw;
  return "all";
}

/** 차종·규격 검색만 — 가이드/증상 Q&A 섹션 숨김 */
export function isCustomerCatalogSearchType(type: HomeSearchType): boolean {
  return type === "all" || type === "vehicle" || type === "battery";
}
