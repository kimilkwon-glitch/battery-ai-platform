import "server-only";

import { SUPPORT_FAQ_ITEMS, type SupportFaqItem } from "@/lib/support-faq-data";
import { listPublishedSupportFaqItems } from "@/lib/support-faq-store";

function answerHtmlToPlainText(html: string): string {
  return html
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?p>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function recordToPublicItem(
  record: Awaited<ReturnType<typeof listPublishedSupportFaqItems>>[number],
): SupportFaqItem {
  return {
    id: record.id,
    category: record.category,
    question: record.question,
    answer: answerHtmlToPlainText(record.answerText),
  };
}

export async function getPublishedSupportFaqItems(): Promise<SupportFaqItem[]> {
  try {
    const records = await listPublishedSupportFaqItems();
    if (records.length > 0) return records.map(recordToPublicItem);
  } catch {
    /* fallback */
  }
  return SUPPORT_FAQ_ITEMS;
}
