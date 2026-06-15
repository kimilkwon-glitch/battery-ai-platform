import "server-only";

import { ensureOperationalSchema } from "@/lib/db/ensure-operational-schema";
import { getSql } from "@/lib/db/postgres";
import {
  sanitizeNoticeHtml,
  sanitizeNoticeHtmlForStorage,
} from "@/lib/security/sanitize-notice-html.server";
import { SUPPORT_NOTICES_SEED } from "@/lib/support-notices-seed";

export class NoticeBodyEmptyError extends Error {
  constructor() {
    super("NOTICE_BODY_EMPTY");
    this.name = "NoticeBodyEmptyError";
  }
}

function requireSanitizedBodyHtml(raw: string): string {
  const safe = sanitizeNoticeHtmlForStorage(raw);
  if (!safe) throw new NoticeBodyEmptyError();
  return safe;
}

export type SupportNoticeCategory = "shipping" | "event" | "order" | "general";

export type SupportNoticeRecord = {
  id: string;
  title: string;
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

type NoticeRow = {
  id: string;
  title: string;
  display_date: string;
  important: boolean;
  visible: boolean;
  show_in_hub: boolean;
  category: string;
  sort_order: number;
  image_src: string | null;
  image_alt: string | null;
  body_html: string;
  created_at: string;
  updated_at: string;
};

function rowToRecord(row: NoticeRow): SupportNoticeRecord {
  return {
    id: row.id,
    title: row.title,
    date: row.display_date,
    important: row.important,
    visible: row.visible,
    showInHub: row.show_in_hub,
    category: row.category as SupportNoticeCategory,
    sortOrder: row.sort_order,
    imageSrc: row.image_src ?? undefined,
    imageAlt: row.image_alt ?? undefined,
    bodyHtml: row.body_html,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sortNotices(records: SupportNoticeRecord[]): SupportNoticeRecord[] {
  return [...records].sort((a, b) => a.sortOrder - b.sortOrder || b.date.localeCompare(a.date));
}

async function seedIfEmpty(): Promise<void> {
  const sql = getSql();
  const rows = (await sql`SELECT COUNT(*)::int AS count FROM support_notices`) as { count: number }[];
  if ((rows[0]?.count ?? 0) > 0) return;
  const now = new Date().toISOString();
  for (const [i, n] of SUPPORT_NOTICES_SEED.entries()) {
    await sql`
      INSERT INTO support_notices (
        id, title, display_date, important, visible, show_in_hub, category, sort_order,
        image_src, image_alt, body_html, created_at, updated_at
      ) VALUES (
        ${n.id}, ${n.title}, ${n.date}, ${n.important ?? false}, ${true}, ${true},
        ${"shipping"}, ${i}, ${n.imageSrc ?? null}, ${n.imageAlt ?? null}, ${n.bodyHtml},
        ${now}, ${now}
      ) ON CONFLICT (id) DO NOTHING
    `;
  }
}

export async function listAllSupportNotices(): Promise<SupportNoticeRecord[]> {
  await ensureOperationalSchema();
  await seedIfEmpty();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM support_notices`) as NoticeRow[];
  return sortNotices(rows.map(rowToRecord));
}

export async function listHubSupportNotices(): Promise<SupportNoticeRecord[]> {
  const records = await listAllSupportNotices();
  return sortNotices(records.filter((r) => r.visible && r.showInHub));
}

export async function getSupportNoticeById(id: string): Promise<SupportNoticeRecord | undefined> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM support_notices WHERE id = ${id} LIMIT 1`) as NoticeRow[];
  const found = rows[0] ? rowToRecord(rows[0]) : undefined;
  if (!found || !found.visible) return undefined;
  return { ...found, bodyHtml: sanitizeNoticeHtml(found.bodyHtml) };
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
  await ensureOperationalSchema();
  const sql = getSql();
  const now = new Date().toISOString();
  const all = await listAllSupportNotices();
  const item: SupportNoticeRecord = {
    id: slugifyId(input.title),
    title: input.title.trim(),
    date: input.date.trim(),
    important: input.important ?? false,
    visible: input.visible ?? true,
    showInHub: input.showInHub ?? true,
    category: input.category ?? "general",
    sortOrder: input.sortOrder ?? all.length,
    imageSrc: input.imageSrc?.trim() || undefined,
    imageAlt: input.imageAlt?.trim() || undefined,
    bodyHtml: requireSanitizedBodyHtml(input.bodyHtml),
    createdAt: now,
    updatedAt: now,
  };

  await sql`
    INSERT INTO support_notices (
      id, title, display_date, important, visible, show_in_hub, category, sort_order,
      image_src, image_alt, body_html, created_at, updated_at
    ) VALUES (
      ${item.id}, ${item.title}, ${item.date}, ${item.important ?? false},
      ${item.visible}, ${item.showInHub}, ${item.category}, ${item.sortOrder},
      ${item.imageSrc ?? null}, ${item.imageAlt ?? null}, ${item.bodyHtml},
      ${item.createdAt}, ${item.updatedAt}
    )
  `;
  return item;
}

export async function updateSupportNotice(
  id: string,
  patch: Partial<SupportNoticeInput>,
): Promise<SupportNoticeRecord | null> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM support_notices WHERE id = ${id} LIMIT 1`) as NoticeRow[];
  const prev = rows[0] ? rowToRecord(rows[0]) : null;
  if (!prev) return null;
  const next: SupportNoticeRecord = {
    ...prev,
    ...patch,
    title: patch.title?.trim() ?? prev.title,
    date: patch.date?.trim() ?? prev.date,
    bodyHtml:
      patch.bodyHtml !== undefined ? requireSanitizedBodyHtml(patch.bodyHtml) : prev.bodyHtml,
    updatedAt: new Date().toISOString(),
  };
  await sql`
    UPDATE support_notices SET
      title = ${next.title},
      display_date = ${next.date},
      important = ${next.important ?? false},
      visible = ${next.visible},
      show_in_hub = ${next.showInHub},
      category = ${next.category},
      sort_order = ${next.sortOrder},
      image_src = ${next.imageSrc ?? null},
      image_alt = ${next.imageAlt ?? null},
      body_html = ${next.bodyHtml},
      updated_at = ${next.updatedAt}
    WHERE id = ${id}
  `;
  return next;
}
