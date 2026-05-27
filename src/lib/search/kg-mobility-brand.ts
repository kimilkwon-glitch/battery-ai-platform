/**
 * KG모빌리티·쌍용 브랜드군 — DB에는 "쌍용"으로 저장된 차량과 검색어 alias 연결
 * (KG모빌리티, KG, KGM, 쌍용, SsangYong — 동일 브랜드군, 신규 차량 생성 없음)
 */
export const KG_MOBILITY_CANONICAL_BRAND = "쌍용";

export const KG_MOBILITY_QUERY_BRANDS =
  /KG\s*모빌리티|KG모빌리티|\bKGM\b|\bKG\b|쌍용|SsangYong|쌍용자동차/i;

export const KG_MOBILITY_BRAND_PREFIX_RE =
  /^(?:KG\s*모빌리티|KG모빌리티|KGM|KG|쌍용|SsangYong|쌍용자동차)\s+/i;

const KG_MOBILITY_BRAND_KEYS = new Set([
  "쌍용",
  "쌍용자동차",
  "kg",
  "kgm",
  "kg모빌리티",
  "kgmobility",
  "ssangyong",
]);

export function normBrandKey(brand: string): string {
  return brand.trim().toLowerCase().replace(/\s+/g, "");
}

export function isKgMobilityBrand(brand: string | null | undefined): boolean {
  if (!brand) return false;
  const b = normBrandKey(brand);
  if (KG_MOBILITY_BRAND_KEYS.has(b)) return true;
  return /^쌍용/.test(brand.trim()) || /^kg/i.test(brand) || /ssangyong/i.test(brand);
}

/** alias·DB 매칭용 공식 브랜드 라벨 */
export function kgMobilityCanonicalBrand(brand?: string | null): string {
  if (!brand || isKgMobilityBrand(brand)) return KG_MOBILITY_CANONICAL_BRAND;
  return brand;
}

export function queryMentionsKgMobilityBrand(query: string): boolean {
  return KG_MOBILITY_QUERY_BRANDS.test(query.trim());
}

export function stripKgMobilityBrandPrefix(query: string): string {
  return query.replace(KG_MOBILITY_BRAND_PREFIX_RE, "").trim();
}

/** 검색어 확장: "KG 렉스턴 스포츠" → 원문, 모델만, "쌍용 …" */
export function expandKgMobilitySearchTerms(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const out = new Set<string>();
  if (queryMentionsKgMobilityBrand(trimmed)) {
    const stripped = stripKgMobilityBrandPrefix(trimmed);
    if (stripped) {
      out.add(stripped);
      out.add(`${KG_MOBILITY_CANONICAL_BRAND} ${stripped}`);
    }
  } else if (/(렉스턴|티볼리|코란도|토레스|체어맨|무쏘)/i.test(trimmed)) {
    out.add(`${KG_MOBILITY_CANONICAL_BRAND} ${trimmed}`);
  }
  return [...out];
}

/** alias 패턴: (?:KG|KGM|쌍용|…)? + 모델 부분 */
export function withKgMobilityOptionalPrefix(modelPart: string): RegExp {
  const prefix =
    "(?:KG\\s*모빌리티|KG모빌리티|KGM|KG|쌍용|SsangYong|쌍용자동차)\\s*";
  return new RegExp(`(?:${prefix})?${modelPart}`, "i");
}
