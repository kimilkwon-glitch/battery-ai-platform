import { normalizeSpecCode } from "./batterySpecIndex";

export type SpecRelationKind = "sameFamilyRelated" | "cautionOnly" | "alias" | "neverSuggestTogether";

const norm = (c: string) => normalizeSpecCode(c.trim().toUpperCase());

function pairKey(a: string, b: string): string {
  return [norm(a), norm(b)].sort().join("|");
}

/** 고객 추천·비교 카드에 절대 같이 노출하지 않음 */
const NEVER_SUGGEST_PAIRS: [string, string][] = [
  ["AGM95L", "100R"],
  ["CMF80L", "AGM80L"],
];

/** 설명·가이드용 — 추천 카드·비교 섹션에는 미노출 */
export const CAUTION_ONLY_PAIRS: [string, string][] = [
  ["AGM95L", "100R"],
  ["CMF80L", "AGM80L"],
  ["100R", "AGM95L"],
];

const neverSuggestSet = new Set(NEVER_SUGGEST_PAIRS.map(([a, b]) => pairKey(a, b)));
const cautionOnlySet = new Set(CAUTION_ONLY_PAIRS.map(([a, b]) => pairKey(a, b)));

export function areNeverSuggestTogether(a: string, b: string): boolean {
  return neverSuggestSet.has(pairKey(a, b));
}

export function areCautionOnlyTogether(a: string, b: string): boolean {
  return cautionOnlySet.has(pairKey(a, b));
}

/** 배터리 상세 — 같은 계열 비교 카드 후보 */
export const SAME_FAMILY_RELATED: Record<string, string[]> = {
  AGM95L: ["AGM80L", "AGM105L"],
  AGM80L: ["AGM70L", "AGM95L"],
  AGM70L: ["AGM60L", "AGM80L"],
  AGM60L: ["AGM70L"],
  AGM105L: ["AGM95L"],
  "100R": ["90R", "100L"],
  "90R": ["100R"],
  "100L": ["100R"],
  CMF80L: ["CMF90L", "80L"],
  DIN74L: ["DIN62L", "DIN80L", "57412"],
  DIN78L: ["DIN74L", "DIN80L"],
};

export function filterCodesForCustomerCards(code: string, candidates: string[]): string[] {
  const base = norm(code);
  const seen = new Set<string>();
  const out: string[] = [];

  for (const raw of candidates) {
    const c = norm(raw);
    if (!c || c === base || seen.has(c)) continue;
    if (areNeverSuggestTogether(base, c)) continue;
    seen.add(c);
    out.push(c);
  }

  const family = SAME_FAMILY_RELATED[base];
  if (family?.length) {
    for (const c of family) {
      const n = norm(c);
      if (n && n !== base && !seen.has(n) && !areNeverSuggestTogether(base, n)) {
        seen.add(n);
        out.push(n);
      }
    }
  }

  return out;
}

export function filterConfusionForDisplay(code: string, specs: string[]): string[] {
  const base = norm(code);
  return specs.filter((s) => {
    const n = norm(s);
    return (
      n !== base && !areNeverSuggestTogether(base, n) && !areCautionOnlyTogether(base, n)
    );
  });
}

export function getSameFamilyCompareTargets(code: string): string[] {
  const base = norm(code);
  return (SAME_FAMILY_RELATED[base] ?? []).map(norm).filter((c) => c !== base);
}
