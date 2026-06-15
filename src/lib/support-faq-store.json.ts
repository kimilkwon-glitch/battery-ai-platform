/**
 * 고객센터 FAQ — 개발 전용 JSON fallback (.data/support-faq.json)
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FaqCategory } from "@/lib/support-faq-data";
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

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "support-faq.json");

type StorePayload = {
  version: 1;
  records: SupportFaqRecord[];
};

const globalCache = globalThis as typeof globalThis & {
  __bmSupportFaqStore?: SupportFaqRecord[];
};

function seedFromStatic(): SupportFaqRecord[] {
  const now = new Date().toISOString();
  return SUPPORT_FAQ_SEED.map((item) => ({
    id: item.id,
    category: item.category,
    question: item.question,
    answerText: item.answerText,
    searchKeywords: item.searchKeywords,
    visible: true,
    sortOrder: item.sortOrder,
    createdAt: now,
    updatedAt: now,
  }));
}

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readPayloadFromDisk(): Promise<StorePayload> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as StorePayload;
    if (parsed?.version === 1 && Array.isArray(parsed.records)) {
      return parsed;
    }
  } catch {
    /* first run */
  }
  const seeded = seedFromStatic();
  const payload: StorePayload = { version: 1, records: seeded };
  await writePayloadToDisk(payload);
  return payload;
}

async function writePayloadToDisk(payload: StorePayload): Promise<void> {
  await ensureDataDir();
  await writeFile(STORE_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function loadRecords(): Promise<SupportFaqRecord[]> {
  if (globalCache.__bmSupportFaqStore) {
    return [...globalCache.__bmSupportFaqStore];
  }
  const payload = await readPayloadFromDisk();
  globalCache.__bmSupportFaqStore = payload.records;
  return [...payload.records];
}

async function saveRecords(records: SupportFaqRecord[]): Promise<void> {
  globalCache.__bmSupportFaqStore = records;
  await writePayloadToDisk({ version: 1, records });
}

function sortItems(records: SupportFaqRecord[]): SupportFaqRecord[] {
  return [...records].sort(
    (a, b) => a.sortOrder - b.sortOrder || b.updatedAt.localeCompare(a.updatedAt),
  );
}

function activeRecords(records: SupportFaqRecord[]): SupportFaqRecord[] {
  return records.filter((r) => !r.deletedAt);
}

export async function listAllSupportFaqItems(): Promise<SupportFaqRecord[]> {
  return sortItems(activeRecords(await loadRecords()));
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
  const records = await loadRecords();
  const found = activeRecords(records).find((r) => r.id === id);
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
  const records = await loadRecords();
  const now = new Date().toISOString();
  const active = activeRecords(records);
  const item: SupportFaqRecord = {
    id: slugifyId(input.question),
    category: input.category,
    question: input.question.trim(),
    answerText: requireSanitizedAnswerHtml(input.answerText),
    searchKeywords: input.searchKeywords ?? [],
    visible: input.visible ?? true,
    sortOrder: input.sortOrder ?? active.length,
    createdAt: now,
    updatedAt: now,
  };
  records.push(item);
  await saveRecords(records);
  return item;
}

export async function updateSupportFaqItem(
  id: string,
  patch: Partial<SupportFaqInput>,
): Promise<SupportFaqRecord | null> {
  const records = await loadRecords();
  const idx = records.findIndex((r) => r.id === id && !r.deletedAt);
  if (idx < 0) return null;
  const prev = records[idx];
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
  records[idx] = next;
  await saveRecords(records);
  return next;
}

export async function softDeleteSupportFaqItem(id: string): Promise<boolean> {
  const records = await loadRecords();
  const idx = records.findIndex((r) => r.id === id && !r.deletedAt);
  if (idx < 0) return false;
  records[idx] = {
    ...records[idx],
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveRecords(records);
  return true;
}
