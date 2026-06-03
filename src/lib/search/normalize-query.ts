export type NormalizedQuery = {
  rawQuery: string;
  normalizedQuery: string;
  displayQuery: string;
};

const FUEL_SYNONYMS: [RegExp, string][] = [
  [/하브/gi, "하이브리드"],
  [/\bhev\b/gi, "하이브리드"],
  [/\bhybrid\b/gi, "하이브리드"],
  [/\bev\b/gi, "전기"],
  [/\belectric\b/gi, "전기"],
  [/\b일렉트릭\b/gi, "전기"],
  [/\bdiesel\b/gi, "디젤"],
  [/\bgasoline\b/gi, "가솔린"],
  [/\bgas\b/gi, "가솔린"],
  [/\b휘발유\b/gi, "가솔린"],
  [/\blpg\b/gi, "LPG"],
];

const VEHICLE_SYNONYMS: [RegExp, string][] = [[/소렌토/g, "쏘렌토"]];

const SPACING_SYNONYMS: [RegExp, string][] = [
  [/디\s*올\s*뉴/gi, "디올뉴"],
  [/C\s*클래스/gi, "C클래스"],
  [/C\s*Class/gi, "C클래스"],
  [/포터\s*2/gi, "포터2"],
  [/봉고\s*3/gi, "봉고3"],
  [/Porter\s*2/gi, "포터2"],
  [/Bongo\s*3/gi, "봉고3"],
];

function stripTestSuffix(q: string): string {
  return q.replace(/\s*·\s*\d+\s*$/u, "").trim();
}

function applySynonyms(q: string): string {
  let out = q;
  for (const [re, rep] of VEHICLE_SYNONYMS) {
    out = out.replace(re, rep);
  }
  for (const [re, rep] of FUEL_SYNONYMS) {
    out = out.replace(re, rep);
  }
  for (const [re, rep] of SPACING_SYNONYMS) {
    out = out.replace(re, rep);
  }
  return out;
}

/** 검색어 표시·해석 분리 정규화 */
export function normalizeQuery(raw: string): NormalizedQuery {
  const rawQuery = raw.trim();
  let q = stripTestSuffix(rawQuery);
  q = q.replace(/\s+/g, " ").trim();
  q = applySynonyms(q);
  const normalizedQuery = q;
  let displayQuery = stripTestSuffix(rawQuery).replace(/\s+/g, " ").trim();
  displayQuery = applySynonyms(displayQuery);
  return { rawQuery, normalizedQuery, displayQuery };
}

/** @deprecated — normalizeQuery 사용 */
export function normalizeSearchQuery(raw: string): string {
  return normalizeQuery(raw).normalizedQuery;
}

export const normalizedDisplayQuery = (raw: string) => normalizeQuery(raw).displayQuery;
