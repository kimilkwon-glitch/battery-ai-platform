import "server-only";

import type { GuidePostCategory } from "@/data/battery-guide-posts";
import { ensureOperationalSchema } from "@/lib/db/ensure-operational-schema";
import { getSql } from "@/lib/db/postgres";
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

type GuideRow = {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  body_html: string;
  tags: string[] | null;
  thumbnail: string | null;
  visible: boolean;
  featured: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

function rowToRecord(row: GuideRow): GuidePostRecord {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category as GuidePostCategory,
    title: row.title,
    summary: row.summary,
    bodyHtml: row.body_html,
    tags: Array.isArray(row.tags) ? row.tags : [],
    thumbnail: row.thumbnail ?? undefined,
    visible: row.visible,
    featured: row.featured,
    sortOrder: row.sort_order,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined,
  };
}

function sortPosts(records: GuidePostRecord[]): GuidePostRecord[] {
  return [...records].sort(
    (a, b) => a.sortOrder - b.sortOrder || b.updatedAt.localeCompare(a.updatedAt),
  );
}

async function seedIfEmpty(): Promise<void> {
  const sql = getSql();
  const rows = (await sql`SELECT COUNT(*)::int AS count FROM guide_posts`) as { count: number }[];
  if ((rows[0]?.count ?? 0) > 0) return;
  for (const post of GUIDE_POSTS_SEED) {
    await sql`
      INSERT INTO guide_posts (
        id, slug, category, title, summary, body_html, tags, thumbnail,
        visible, featured, sort_order, created_at, updated_at
      ) VALUES (
        ${post.id}, ${post.slug}, ${post.category}, ${post.title}, ${post.summary},
        ${post.bodyHtml}, ${JSON.stringify(post.tags)}::jsonb,
        ${post.thumbnail ?? null}, ${post.visible}, ${post.featured}, ${post.sortOrder},
        ${post.createdAt}, ${post.updatedAt}
      ) ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function loadActiveRows(): Promise<GuideRow[]> {
  const sql = getSql();
  return (await sql`
    SELECT * FROM guide_posts WHERE deleted_at IS NULL
  `) as GuideRow[];
}

export async function listAllGuidePosts(): Promise<GuidePostRecord[]> {
  await ensureOperationalSchema();
  await seedIfEmpty();
  return sortPosts((await loadActiveRows()).map(rowToRecord));
}

export async function listPublishedGuidePosts(category?: GuidePostCategory): Promise<GuidePostRecord[]> {
  const records = await listAllGuidePosts();
  return sortPosts(
    records.filter((r) => r.visible && (!category || r.category === category)),
  );
}

export async function getGuidePostById(id: string): Promise<GuidePostRecord | undefined> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM guide_posts WHERE id = ${id} AND deleted_at IS NULL LIMIT 1
  `) as GuideRow[];
  const found = rows[0] ? rowToRecord(rows[0]) : undefined;
  if (!found || !found.visible) return undefined;
  return { ...found, bodyHtml: sanitizeNoticeHtml(found.bodyHtml) };
}

export async function getGuidePostBySlug(slug: string): Promise<GuidePostRecord | undefined> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM guide_posts WHERE slug = ${slug} AND deleted_at IS NULL LIMIT 1
  `) as GuideRow[];
  const found = rows[0] ? rowToRecord(rows[0]) : undefined;
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
  await ensureOperationalSchema();
  const sql = getSql();
  const now = new Date().toISOString();
  const all = await listAllGuidePosts();
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
    sortOrder: input.sortOrder ?? all.length,
    seoTitle: input.seoTitle?.trim() || undefined,
    seoDescription: input.seoDescription?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  await sql`
    INSERT INTO guide_posts (
      id, slug, category, title, summary, body_html, tags, thumbnail,
      visible, featured, sort_order, seo_title, seo_description,
      created_at, updated_at
    ) VALUES (
      ${item.id}, ${item.slug}, ${item.category}, ${item.title}, ${item.summary},
      ${item.bodyHtml}, ${JSON.stringify(item.tags)}::jsonb, ${item.thumbnail ?? null},
      ${item.visible}, ${item.featured}, ${item.sortOrder},
      ${item.seoTitle ?? null}, ${item.seoDescription ?? null},
      ${item.createdAt}, ${item.updatedAt}
    )
  `;
  return item;
}

export async function updateGuidePost(
  id: string,
  patch: Partial<GuidePostInput>,
): Promise<GuidePostRecord | null> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM guide_posts WHERE id = ${id} AND deleted_at IS NULL LIMIT 1
  `) as GuideRow[];
  const prev = rows[0] ? rowToRecord(rows[0]) : null;
  if (!prev) return null;
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
  await sql`
    UPDATE guide_posts SET
      slug = ${next.slug},
      category = ${next.category},
      title = ${next.title},
      summary = ${next.summary},
      body_html = ${next.bodyHtml},
      tags = ${JSON.stringify(next.tags)}::jsonb,
      thumbnail = ${next.thumbnail ?? null},
      visible = ${next.visible},
      featured = ${next.featured},
      sort_order = ${next.sortOrder},
      seo_title = ${next.seoTitle ?? null},
      seo_description = ${next.seoDescription ?? null},
      updated_at = ${next.updatedAt}
    WHERE id = ${id} AND deleted_at IS NULL
  `;
  return next;
}

export async function softDeleteGuidePost(id: string): Promise<boolean> {
  await ensureOperationalSchema();
  const sql = getSql();
  const now = new Date().toISOString();
  const rows = (await sql`
    UPDATE guide_posts SET deleted_at = ${now}, updated_at = ${now}
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}
