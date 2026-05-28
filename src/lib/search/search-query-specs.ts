/**
 * /search 상단 요약용 규격 토큰 — 검색어에 포함되면 DB 여부와 무관하게 표시
 */
export const SEARCH_SPEC_TOKENS = [
  "AGM60L",
  "AGM70L",
  "AGM80L",
  "AGM80R",
  "AGM95L",
  "AGM95R",
  "AGM105L",
  "DIN50L",
  "DIN60L",
  "DIN62L",
  "DIN74L",
  "DIN90L",
  "90R",
  "100R",
  "115D31L",
  "115D31R",
  "CMF80L",
  "CMF60L",
  "CMF90R",
  "DIN80L",
] as const;

const TOKEN_SET = new Set(SEARCH_SPEC_TOKENS.map((t) => t.toUpperCase()));

/** 검색어 원문에서 규격 토큰 추출 (표시·요약용, exact match 상단 고정) */
function extractSpecsFromSegment(segment: string): string[] {
  const found: string[] = [];
  const compact = segment.replace(/\s+/g, "").toUpperCase();

  for (const token of SEARCH_SPEC_TOKENS) {
    if (compact.includes(token.toUpperCase())) {
      found.push(token);
    }
  }

  const regexHits =
    segment.match(/\b(AGM|DIN|CMF|EFB)\d+[LR]?|\b\d{2,3}D\d+[LR]\b|\b\d{2,3}R\b/gi) ?? [];
  for (const raw of regexHits) {
    const normalized = raw.replace(/\s+/g, "").toUpperCase();
    const canonical =
      SEARCH_SPEC_TOKENS.find((t) => t.toUpperCase() === normalized) ??
      (TOKEN_SET.has(normalized) ? normalized : null);
    if (canonical && !found.includes(canonical)) {
      found.push(canonical);
    } else if (!canonical && /^(AGM|DIN|CMF|EFB)\d+[LR]?$/i.test(normalized)) {
      const label = normalized;
      if (!found.some((f) => f.toUpperCase() === label)) found.push(label);
    }
  }

  return [...new Set(found)];
}

/** 검색어 원문에서 규격 토큰 추출 (표시·요약용, exact match 상단 고정) */
export function extractQuerySpecTokens(query: string): string[] {
  return extractSpecsFromSegment(query);
}

/** "A vs B" 비교 검색 — 좌측 규격을 먼저 유지 */
export function extractOrderedQuerySpecs(query: string): string[] {
  const vsSplit = query.split(/\bvs\b/i);
  if (vsSplit.length < 2) return extractQuerySpecTokens(query);

  const ordered: string[] = [];
  for (const part of vsSplit) {
    for (const spec of extractSpecsFromSegment(part)) {
      if (!ordered.some((s) => s.toUpperCase() === spec.toUpperCase())) {
        ordered.push(spec);
      }
    }
  }
  return ordered;
}

export function hasCompareIntent(query: string): boolean {
  return /\bvs\b|차이|대체|호환/i.test(query);
}

export function hasOrderIntent(query: string): boolean {
  return /택배|주문|배송|구매|반납/i.test(query);
}
