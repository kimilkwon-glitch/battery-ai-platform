/** 메인 Hero 검색 유형 — /search?type= 쿼리와 동기화 */

export type HomeSearchType = "all" | "vehicle" | "battery" | "symptom" | "qa";

export type HomeSearchTypeMenuItem = {
  id: HomeSearchType;
  label: string;
  hint: string;
};

export const HOME_SEARCH_TYPE_OPTIONS: { id: HomeSearchType; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "vehicle", label: "차종" },
  { id: "battery", label: "규격" },
  { id: "symptom", label: "증상" },
  { id: "qa", label: "Q&A" },
];

export const HOME_SEARCH_TYPE_MENU: HomeSearchTypeMenuItem[] = [
  { id: "all", label: "전체", hint: "차종·연식·규격 통합 검색" },
  { id: "vehicle", label: "차종", hint: "K3, 쏘렌토, 스타리아" },
  { id: "battery", label: "규격", hint: "AGM70L, 100R, DIN74L" },
  { id: "symptom", label: "증상", hint: "시동지연, 방전, 블랙박스" },
  { id: "qa", label: "Q&A", hint: "궁금한 내용으로 찾기" },
];

export const HOME_SEARCH_PLACEHOLDERS: Record<HomeSearchType, string> = {
  all: "차종·연식·규격을 입력하세요",
  vehicle: "예: 쏘렌토 MQ4, K3, 스타리아",
  battery: "예: AGM70L, 100R, DIN74L",
  symptom: "예: 시동지연, 방전, 블랙박스 방전",
  qa: "궁금한 내용을 입력하세요",
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
