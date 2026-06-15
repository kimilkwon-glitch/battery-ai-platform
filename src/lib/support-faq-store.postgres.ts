import "server-only";

import type { FaqCategory } from "@/lib/support-faq-data";
import { ensureOperationalSchema } from "@/lib/db/ensure-operational-schema";
import { getSql } from "@/lib/db/postgres";
import { SUPPORT_FAQ_SEED } from "@/lib/support-faq-seed";
import {
  sanitizeNoticeHtml,
  sanitizeNoticeHtmlForStorage,
} from "@/lib/security/sanitize-notice-html.server";

export class FaqAnswerEmptyError extends Error {
  constructor() {
    super("FAQ_ANSWER_EMPTY");
    this.name = "FaqAnswerEmptyError";
  }
}

function requireSanitizedAnswerHtml(raw: string): string {
  const safe = sanitizeNoticeHtmlForStorage(raw);
  if (!safe) throw new FaqAnswerEmptyError();
  return safe;
}

export type SupportFaqRecord = {
  id: string;
  category: Exclude<FaqCategory, "전체">;
  question: string;
  answerText: string;
  searchKeywords: string[];
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

type FaqRow = {
  id: string;
  category: string;
  question: string;
  answer_text: string;
  search_keywords: string[] | null;
  visible: boolean;
  sort_order: number;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at: string | Date | null;
};

function toIsoString(value: string | Date): string {
  if (typeof value === "string") return value;
  return value.toISOString();
}

function rowToRecord(row: FaqRow): SupportFaqRecord {
  return {
    id: row.id,
    category: row.category as Exclude<FaqCategory, "전체">,
    question: row.question,
    answerText: row.answer_text,
    searchKeywords: Array.isArray(row.search_keywords) ? row.search_keywords : [],
    visible: row.visible,
    sortOrder: row.sort_order,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    deletedAt: row.deleted_at ? toIsoString(row.deleted_at) : undefined,
  };
}

function sortItems(records: SupportFaqRecord[]): SupportFaqRecord[] {
  return [...records].sort(
    (a, b) => a.sortOrder - b.sortOrder || b.updatedAt.localeCompare(a.updatedAt),
  );
}

async function seedIfEmpty(): Promise<void> {
  const sql = getSql();
  const rows = (await sql`SELECT COUNT(*)::int AS count FROM support_faq_items`) as { count: number }[];
  if ((rows[0]?.count ?? 0) > 0) return;
  const now = new Date().toISOString();
  for (const item of SUPPORT_FAQ_SEED) {
    await sql`
      INSERT INTO support_faq_items (
        id, category, question, answer_text, search_keywords,
        visible, sort_order, created_at, updated_at
      ) VALUES (
        ${item.id}, ${item.category}, ${item.question}, ${item.answerText},
        ${JSON.stringify(item.searchKeywords)}::jsonb,
        ${true}, ${item.sortOrder}, ${now}, ${now}
      ) ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function loadActiveRows(): Promise<FaqRow[]> {
  const sql = getSql();
  return (await sql`
    SELECT * FROM support_faq_items WHERE deleted_at IS NULL
  `) as FaqRow[];
}

export async function listAllSupportFaqItems(): Promise<SupportFaqRecord[]> {
  await ensureOperationalSchema();
  await seedIfEmpty();
  return sortItems((await loadActiveRows()).map(rowToRecord));
}

export async function listPublishedSupportFaqItems(): Promise<SupportFaqRecord[]> {
  const records = await listAllSupportFaqItems();
  return sortItems(
    records
      .filter((r) => r.visible)
      .map((r) => ({ ...r, answerText: sanitizeNoticeHtml(r.answerText) })),
  );
}

export async function getSupportFaqItemById(id: string): Promise<SupportFaqRecord | undefined> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM support_faq_items WHERE id = ${id} AND deleted_at IS NULL LIMIT 1
  `) as FaqRow[];
  const found = rows[0] ? rowToRecord(rows[0]) : undefined;
  if (!found || !found.visible) return undefined;
  return { ...found, answerText: sanitizeNoticeHtml(found.answerText) };
}

export type SupportFaqInput = {
  category: Exclude<FaqCategory, "전체">;
  question: string;
  answerText: string;
  searchKeywords?: string[];
  visible?: boolean;
  sortOrder?: number;
};

function slugifyId(question: string): string {
  const base = question
    .trim()
    .toLowerCase()
    .replace(/[^\w가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "faq"}-${Date.now().toString(36)}`;
}

export async function createSupportFaqItem(input: SupportFaqInput): Promise<SupportFaqRecord> {
  await ensureOperationalSchema();
  const sql = getSql();
  const now = new Date().toISOString();
  const all = await listAllSupportFaqItems();
  const item: SupportFaqRecord = {
    id: slugifyId(input.question),
    category: input.category,
    question: input.question.trim(),
    answerText: requireSanitizedAnswerHtml(input.answerText),
    searchKeywords: input.searchKeywords ?? [],
    visible: input.visible ?? true,
    sortOrder: input.sortOrder ?? all.length,
    createdAt: now,
    updatedAt: now,
  };

  await sql`
    INSERT INTO support_faq_items (
      id, category, question, answer_text, search_keywords,
      visible, sort_order, created_at, updated_at
    ) VALUES (
      ${item.id}, ${item.category}, ${item.question}, ${item.answerText},
      ${JSON.stringify(item.searchKeywords)}::jsonb,
      ${item.visible}, ${item.sortOrder}, ${item.createdAt}, ${item.updatedAt}
    )
  `;
  return item;
}

export async function updateSupportFaqItem(
  id: string,
  patch: Partial<SupportFaqInput>,
): Promise<SupportFaqRecord | null> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM support_faq_items WHERE id = ${id} AND deleted_at IS NULL LIMIT 1
  `) as FaqRow[];
  const prev = rows[0] ? rowToRecord(rows[0]) : null;
  if (!prev) return null;
  const next: SupportFaqRecord = {
    ...prev,
    ...patch,
    question: patch.question?.trim() ?? prev.question,
    answerText:
      patch.answerText !== undefined
        ? requireSanitizedAnswerHtml(patch.answerText)
        : prev.answerText,
    searchKeywords: patch.searchKeywords ?? prev.searchKeywords,
    updatedAt: new Date().toISOString(),
  };
  await sql`
    UPDATE support_faq_items SET
      category = ${next.category},
      question = ${next.question},
      answer_text = ${next.answerText},
      search_keywords = ${JSON.stringify(next.searchKeywords)}::jsonb,
      visible = ${next.visible},
      sort_order = ${next.sortOrder},
      updated_at = ${next.updatedAt}
    WHERE id = ${id} AND deleted_at IS NULL
  `;
  return next;
}

export async function softDeleteSupportFaqItem(id: string): Promise<boolean> {
  await ensureOperationalSchema();
  const sql = getSql();
  const now = new Date().toISOString();
  const rows = (await sql`
    UPDATE support_faq_items SET deleted_at = ${now}, updated_at = ${now}
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}
