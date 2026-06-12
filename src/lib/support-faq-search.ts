import type { SupportFaqItem } from "@/lib/support-faq-data";
import { faqCategoryToHub, SUPPORT_HUB_CATEGORIES } from "@/lib/support-center-config";

const FAQ_SEARCH_SYNONYMS: Record<string, string[]> = {
  주문: ["주문", "결제", "구매"],
  배송: ["배송", "택배", "발송", "수령"],
  반품: ["반품", "교환", "환불", "교환·반품"],
  환불: ["환불", "반품", "교환"],
  출장: ["출장", "방문", "현장"],
  교체: ["교체", "장착", "교환", "출장"],
  agm: ["agm", "스마트충전", "isg"],
  규격: ["규격", "배터리 규격", "din", "gb", "cmf"],
  폐배터리: ["폐배터리", "폐전지", "반납", "미반납"],
  매장수령: ["매장수령", "매장 수령", "셀프", "직접 수령"],
  택배: ["택배", "배송", "발송"],
};

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function hubCategoryLabel(item: SupportFaqItem): string | undefined {
  const hubId = faqCategoryToHub(item.category);
  return SUPPORT_HUB_CATEGORIES.find((entry) => entry.id === hubId)?.label;
}

function expandQueryTokens(query: string): string[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];

  const tokens = new Set<string>([normalized]);
  for (const [key, synonyms] of Object.entries(FAQ_SEARCH_SYNONYMS)) {
    if (synonyms.some((term) => normalized.includes(term) || term.includes(normalized))) {
      tokens.add(key);
      synonyms.forEach((term) => tokens.add(term));
    }
  }
  return [...tokens];
}

export function faqMatchesSearch(item: SupportFaqItem, rawQuery: string): boolean {
  const query = normalizeSearchText(rawQuery);
  if (!query) return true;

  const haystack = [
    item.question,
    item.answer,
    item.category,
    hubCategoryLabel(item),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const tokens = expandQueryTokens(query);
  return tokens.some((token) => haystack.includes(token));
}
