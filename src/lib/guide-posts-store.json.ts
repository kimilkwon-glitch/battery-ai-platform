/**
 * 배터리 가이드 — 개발 전용 JSON fallback (.data/guide-posts.json)
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GuidePostCategory } from "@/data/battery-guide-posts";
import { GUIDE_POSTS_SEED } from "@/lib/guide-posts-seed";
import {
  sanitizeNoticeHtml,
  sanitizeNoticeHtmlForStorage,
} from "@/lib/security/sanitize-notice-html.server";

export class GuideBodyEmptyError extends Error {
  constructor() {
    super("GUIDE_BODY_EMPTY");
    this.name = "GuideBodyEmptyError";
  }
}

function requireSanitizedBodyHtml(raw: string): string {
  const safe = sanitizeNoticeHtmlForStorage(raw);
  if (!safe) throw new GuideBodyEmptyError();
  return safe;
}

export type GuidePostRecord = {
  id: string;
  slug: string;
  category: GuidePostCategory;
  title: string;
  summary: string;
  bodyHtml: string;
  tags: string[];
  thumbnail?: string;
  visible: boolean;
  featured: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "guide-posts.json");

type StorePayload = {
  version: 1;
  records: GuidePostRecord[];
};

const globalCache = globalThis as typeof globalThis & {
  __bmGuidePostsStore?: GuidePostRecord[];
};

function seedFromStatic(): GuidePostRecord[] {
  return GUIDE_POSTS_SEED.map((post) => ({
    id: post.id,
    slug: post.slug,
    category: post.category as GuidePostCategory,
    title: post.title,
    summary: post.summary,
    bodyHtml: post.bodyHtml,
    tags: post.tags,
    thumbnail: post.thumbnail,
    visible: post.visible,
    featured: post.featured,
    sortOrder: post.sortOrder,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
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

async function loadRecords(): Promise<GuidePostRecord[]> {
  if (globalCache.__bmGuidePostsStore) {
    return [...globalCache.__bmGuidePostsStore];
  }
  const payload = await readPayloadFromDisk();
  globalCache.__bmGuidePostsStore = payload.records;
  return [...payload.records];
}

async function saveRecords(records: GuidePostRecord[]): Promise<void> {
  globalCache.__bmGuidePostsStore = records;
  await writePayloadToDisk({ version: 1, records });
}

function sortPosts(records: GuidePostRecord[]): GuidePostRecord[] {
  return [...records].sort(
    (a, b) => a.sortOrder - b.sortOrder || b.updatedAt.localeCompare(a.updatedAt),
  );
}

function activeRecords(records: GuidePostRecord[]): GuidePostRecord[] {
  return records.filter((r) => !r.deletedAt);
}

export async function listAllGuidePosts(): Promise<GuidePostRecord[]> {
  return sortPosts(activeRecords(await loadRecords()));
}

export async function listPublishedGuidePosts(category?: GuidePostCategory): Promise<GuidePostRecord[]> {
  const records = await listAllGuidePosts();
  return sortPosts(
    records.filter((r) => r.visible && (!category || r.category === category)),
  );
}

export async function getGuidePostById(id: string): Promise<GuidePostRecord | undefined> {
  const records = await loadRecords();
  const found = activeRecords(records).find((r) => r.id === id);
  if (!found || !found.visible) return undefined;
  return { ...found, bodyHtml: sanitizeNoticeHtml(found.bodyHtml) };
}

export async function getGuidePostBySlug(slug: string): Promise<GuidePostRecord | undefined> {
  const records = await loadRecords();
  const found = activeRecords(records).find((r) => r.slug === slug);
  if (!found || !found.visible) return undefined;
  return { ...found, bodyHtml: sanitizeNoticeHtml(found.bodyHtml) };
}

export type GuidePostInput = {
  slug?: string;
  category: GuidePostCategory;
  title: string;
  summary?: string;
  bodyHtml: string;
  tags?: string[];
  thumbnail?: string;
  visible?: boolean;
  featured?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
};

function slugifyId(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\w가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "guide"}-${Date.now().toString(36)}`;
}

export async function createGuidePost(input: GuidePostInput): Promise<GuidePostRecord> {
  const records = await loadRecords();
  const now = new Date().toISOString();
  const active = activeRecords(records);
  const id = slugifyId(input.title);
  const slug = input.slug?.trim() || id;
  const item: GuidePostRecord = {
    id,
    slug,
    category: input.category,
    title: input.title.trim(),
    summary: input.summary?.trim() ?? "",
    bodyHtml: requireSanitizedBodyHtml(input.bodyHtml),
    tags: input.tags ?? [],
    thumbnail: input.thumbnail?.trim() || undefined,
    visible: input.visible ?? true,
    featured: input.featured ?? false,
    sortOrder: input.sortOrder ?? active.length,
    seoTitle: input.seoTitle?.trim() || undefined,
    seoDescription: input.seoDescription?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
  records.push(item);
  await saveRecords(records);
  return item;
}

export async function updateGuidePost(
  id: string,
  patch: Partial<GuidePostInput>,
): Promise<GuidePostRecord | null> {
  const records = await loadRecords();
  const idx = records.findIndex((r) => r.id === id && !r.deletedAt);
  if (idx < 0) return null;
  const prev = records[idx];
  const next: GuidePostRecord = {
    ...prev,
    ...patch,
    slug: patch.slug?.trim() ?? prev.slug,
    title: patch.title?.trim() ?? prev.title,
    summary: patch.summary?.trim() ?? prev.summary,
    bodyHtml:
      patch.bodyHtml !== undefined ? requireSanitizedBodyHtml(patch.bodyHtml) : prev.bodyHtml,
    tags: patch.tags ?? prev.tags,
    thumbnail: patch.thumbnail !== undefined ? patch.thumbnail?.trim() || undefined : prev.thumbnail,
    seoTitle: patch.seoTitle !== undefined ? patch.seoTitle?.trim() || undefined : prev.seoTitle,
    seoDescription:
      patch.seoDescription !== undefined
        ? patch.seoDescription?.trim() || undefined
        : prev.seoDescription,
    updatedAt: new Date().toISOString(),
  };
  records[idx] = next;
  await saveRecords(records);
  return next;
}

export async function softDeleteGuidePost(id: string): Promise<boolean> {
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
