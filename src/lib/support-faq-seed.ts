/** 고객센터 FAQ 초기 seed — store 최초 생성 시 사용 */

import {
  SUPPORT_FAQ_ITEMS,
  type SupportFaqItem,
} from "@/lib/support-faq-data";

export type SupportFaqSeedItem = {
  id: string;
  category: SupportFaqItem["category"];
  question: string;
  answerText: string;
  searchKeywords: string[];
  sortOrder: number;
};

function plainTextToAnswerHtml(text: string): string {
  return text
    .split("\n\n")
    .filter(Boolean)
    .map((para) => `<p>${para.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("");
}

function deriveSearchKeywords(item: SupportFaqItem): string[] {
  const words = item.question
    .replace(/[^\w가-힣\s·]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1);
  return [...new Set([item.category, ...words])];
}

export const SUPPORT_FAQ_SEED: SupportFaqSeedItem[] = SUPPORT_FAQ_ITEMS.map((item, i) => ({
  id: item.id,
  category: item.category,
  question: item.question,
  answerText: plainTextToAnswerHtml(item.answer),
  searchKeywords: deriveSearchKeywords(item),
  sortOrder: i,
}));
