import {
  areNeverSuggestTogether,
  filterCodesForCustomerCards,
} from "@/data/battery/batterySpecRelations";
import { normalizeBatteryCode } from "@/lib/batteryNormalize";
import type { Question } from "@/lib/platform-types";

const CROSS_PAIR_QUERY = /100\s*r.*agm\s*95|agm\s*95.*100\s*r|100\s*R\s*vs\s*AGM\s*95L|AGM\s*95L\s*vs\s*100\s*R/i;

/** Q&A 카드·칩 — AGM95L↔100R 등 neverSuggest 쌍 미노출 */
export function filterQnaBatteryChips(contextCode: string | undefined, codes: string[]): string[] {
  const unique = [...new Set(codes.map((c) => normalizeBatteryCode(c)).filter(Boolean))];

  if (contextCode) {
    return filterCodesForCustomerCards(contextCode, unique).slice(0, 4);
  }

  const out: string[] = [];
  for (const c of unique) {
    if (out.some((x) => areNeverSuggestTogether(x, c))) continue;
    out.push(c);
  }
  return out.slice(0, 4);
}

export function filterQnaSearchQueries(
  contextCode: string | undefined,
  queries: string[] | undefined,
): string[] {
  if (!queries?.length) return [];
  return queries.filter((sq) => {
    if (CROSS_PAIR_QUERY.test(sq)) return false;
    if (contextCode) {
      const page = normalizeBatteryCode(contextCode);
      if ((page === "AGM95L" || page === "100R") && /100R/i.test(sq) && /AGM95L/i.test(sq)) {
        return false;
      }
    }
    return true;
  });
}

export function shouldHideQnaForBatteryContext(pageCode: string, question: Question): boolean {
  const page = normalizeBatteryCode(pageCode);
  if (question.id === "q-100r-vs-agm95l" && (page === "AGM95L" || page === "100R")) {
    return true;
  }

  const codes = new Set<string>();
  if (question.batteryCode) codes.add(normalizeBatteryCode(question.batteryCode));
  for (const c of question.relatedBatteryCodes ?? []) {
    codes.add(normalizeBatteryCode(c));
  }
  if (codes.has("AGM95L") && codes.has("100R") && (page === "AGM95L" || page === "100R")) {
    return true;
  }
  return false;
}

export function filterQuestionsForBatteryDisplay(
  pageCode: string,
  items: Question[],
): Question[] {
  return items.filter((q) => !shouldHideQnaForBatteryContext(pageCode, q));
}

export function pickQnaCompareTarget(
  primaryCode: string,
  candidates: string[],
  contextCode?: string,
): string | null {
  const primary = normalizeBatteryCode(primaryCode);
  for (const raw of candidates) {
    const c = normalizeBatteryCode(raw);
    if (!c || c === primary) continue;
    if (areNeverSuggestTogether(primary, c)) continue;
    if (contextCode && areNeverSuggestTogether(normalizeBatteryCode(contextCode), c)) {
      continue;
    }
    return c;
  }
  return null;
}
