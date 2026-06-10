/**
 * 고객센터 공지 — 개발 전용 JSON fallback (.data/support-notices.json)
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { SUPPORT_NOTICES_SEED } from "@/lib/support-notices-seed";

export type SupportNoticeCategory = "shipping" | "event" | "order" | "general";

export type SupportNoticeRecord = {
  id: string;
  title: string;
  /** 표시용 날짜 YYYY.MM.DD */
  date: string;
  important?: boolean;
  visible: boolean;
  showInHub: boolean;
  category: SupportNoticeCategory;
  sortOrder: number;
  imageSrc?: string;
  imageAlt?: string;
  bodyHtml: string;
  createdAt: string;
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "support-notices.json");

type StorePayload = {
  version: 1;
  records: SupportNoticeRecord[];
};

const globalCache = globalThis as typeof globalThis & {
  __bmSupportNoticesStore?: SupportNoticeRecord[];
};

function emptyPayload(): StorePayload {
  return { version: 1, records: [] };
}

function seedFromStatic(): SupportNoticeRecord[] {
  const now = new Date().toISOString();
  return SUPPORT_NOTICES_SEED.map((n, i) => ({
    id: n.id,
    title: n.title,
    date: n.date,
    important: n.important ?? false,
    visible: true,
    showInHub: true,
    category: "shipping" as SupportNoticeCategory,
    sortOrder: i,
    imageSrc: n.imageSrc,
    imageAlt: n.imageAlt,
    bodyHtml: n.bodyHtml,
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

async function loadRecords(): Promise<SupportNoticeRecord[]> {
  if (globalCache.__bmSupportNoticesStore) {
    return [...globalCache.__bmSupportNoticesStore];
  }
  const payload = await readPayloadFromDisk();
  globalCache.__bmSupportNoticesStore = payload.records;
  return [...payload.records];
}

async function saveRecords(records: SupportNoticeRecord[]): Promise<void> {
  globalCache.__bmSupportNoticesStore = records;
  await writePayloadToDisk({ version: 1, records });
}

function sortNotices(records: SupportNoticeRecord[]): SupportNoticeRecord[] {
  return [...records].sort((a, b) => a.sortOrder - b.sortOrder || b.date.localeCompare(a.date));
}

export async function listAllSupportNotices(): Promise<SupportNoticeRecord[]> {
  return sortNotices(await loadRecords());
}

export async function listHubSupportNotices(): Promise<SupportNoticeRecord[]> {
  const records = await loadRecords();
  return sortNotices(records.filter((r) => r.visible && r.showInHub));
}

export async function getSupportNoticeById(id: string): Promise<SupportNoticeRecord | undefined> {
  const records = await loadRecords();
  const found = records.find((r) => r.id === id);
  if (!found || !found.visible) return undefined;
  return found;
}

export type SupportNoticeInput = {
  title: string;
  date: string;
  important?: boolean;
  visible?: boolean;
  showInHub?: boolean;
  category?: SupportNoticeCategory;
  sortOrder?: number;
  imageSrc?: string;
  imageAlt?: string;
  bodyHtml: string;
};

function slugifyId(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\w가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "notice"}-${Date.now().toString(36)}`;
}

export async function createSupportNotice(input: SupportNoticeInput): Promise<SupportNoticeRecord> {
  const records = await loadRecords();
  const now = new Date().toISOString();
  const item: SupportNoticeRecord = {
    id: slugifyId(input.title),
    title: input.title.trim(),
    date: input.date.trim(),
    important: input.important ?? false,
    visible: input.visible ?? true,
    showInHub: input.showInHub ?? true,
    category: input.category ?? "general",
    sortOrder: input.sortOrder ?? records.length,
    imageSrc: input.imageSrc?.trim() || undefined,
    imageAlt: input.imageAlt?.trim() || undefined,
    bodyHtml: input.bodyHtml,
    createdAt: now,
    updatedAt: now,
  };
  records.push(item);
  await saveRecords(records);
  return item;
}

export async function updateSupportNotice(
  id: string,
  patch: Partial<SupportNoticeInput>,
): Promise<SupportNoticeRecord | null> {
  const records = await loadRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const prev = records[idx];
  const next: SupportNoticeRecord = {
    ...prev,
    ...patch,
    title: patch.title?.trim() ?? prev.title,
    date: patch.date?.trim() ?? prev.date,
    updatedAt: new Date().toISOString(),
  };
  records[idx] = next;
  await saveRecords(records);
  return next;
}
