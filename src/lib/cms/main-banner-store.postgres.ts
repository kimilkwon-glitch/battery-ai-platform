import "server-only";
import { ensureCmsSchema } from "@/lib/db/ensure-cms-schema";
import { getSql } from "@/lib/db/postgres";
import { generateCmsId } from "@/lib/cms/seed-default-cms";
import type {
  MainBannerCreateInput,
  MainBannerRecord,
  MainBannerStatus,
  MainBannerUpsertInput,
} from "@/types/main-banner";
import type { PaginatedResult } from "@/types/customer-review";

type BannerRow = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  mobile_image_url: string | null;
  link_url: string;
  button_text: string | null;
  promo_label: string | null;
  image_alt: string | null;
  status: string;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  show_on_main: boolean;
  created_at: string;
  updated_at: string;
};

function rowToRecord(row: BannerRow): MainBannerRecord {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    imageUrl: row.image_url,
    mobileImageUrl: row.mobile_image_url,
    linkUrl: row.link_url,
    buttonText: row.button_text,
    promoLabel: row.promo_label,
    imageAlt: row.image_alt,
    status: row.status as MainBannerStatus,
    sortOrder: row.sort_order,
    startsAt: row.starts_at ? new Date(row.starts_at).toISOString() : null,
    endsAt: row.ends_at ? new Date(row.ends_at).toISOString() : null,
    showOnMain: row.show_on_main,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function isActive(row: BannerRow, now = new Date()): boolean {
  if (row.status !== "active" || !row.show_on_main) return false;
  const starts = row.starts_at ? new Date(row.starts_at) : null;
  const ends = row.ends_at ? new Date(row.ends_at) : null;
  if (starts && starts > now) return false;
  if (ends && ends < now) return false;
  return true;
}

async function ensureDb(): Promise<void> {
  await ensureCmsSchema();
}

export async function listMainBanners(limit = 200): Promise<MainBannerRecord[]> {
  await ensureDb();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM main_banners ORDER BY sort_order DESC, created_at DESC LIMIT ${limit}
  `) as BannerRow[];
  return rows.map(rowToRecord);
}

export async function listMainBannersPaginated(
  page = 1,
  limit = 20,
): Promise<PaginatedResult<MainBannerRecord>> {
  await ensureDb();
  const sql = getSql();
  const offset = (page - 1) * limit;
  const totalRows = (await sql`SELECT COUNT(*)::int AS cnt FROM main_banners`) as { cnt: number }[];
  const total = totalRows[0]?.cnt ?? 0;
  const rows = (await sql`
    SELECT * FROM main_banners
    ORDER BY sort_order DESC, created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `) as BannerRow[];
  return {
    items: rows.map(rowToRecord),
    total,
    page,
    limit,
    hasMore: offset + rows.length < total,
  };
}

export async function listActiveMainBanners(now = new Date()): Promise<MainBannerRecord[]> {
  await ensureDb();
  const sql = getSql();
  const dbRows = (await sql`
    SELECT * FROM main_banners
    WHERE status = 'active' AND show_on_main = TRUE
    ORDER BY sort_order DESC, created_at DESC
  `) as BannerRow[];
  return dbRows.filter((r) => isActive(r, now)).map(rowToRecord);
}

export async function getMainBannerById(id: string): Promise<MainBannerRecord | null> {
  await ensureDb();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM main_banners WHERE id = ${id} LIMIT 1`) as BannerRow[];
  return rows[0] ? rowToRecord(rows[0]) : null;
}

export async function createMainBanner(input: MainBannerCreateInput): Promise<MainBannerRecord> {
  await ensureDb();
  const sql = getSql();
  const id = generateCmsId("banner");
  const now = new Date().toISOString();
  await sql`
    INSERT INTO main_banners (
      id, title, subtitle, description, image_url, mobile_image_url, link_url,
      button_text, promo_label, image_alt, status, sort_order, starts_at, ends_at,
      show_on_main, created_at, updated_at
    ) VALUES (
      ${id}, ${input.title}, ${input.subtitle ?? null}, ${input.description ?? null},
      ${input.imageUrl ?? null}, ${input.mobileImageUrl ?? null}, ${input.linkUrl},
      ${input.buttonText ?? null}, ${input.promoLabel ?? null}, ${input.imageAlt ?? null},
      ${input.status ?? "inactive"}, ${input.sortOrder ?? 0},
      ${input.startsAt ?? null}::timestamptz, ${input.endsAt ?? null}::timestamptz,
      ${input.showOnMain ?? true}, ${now}::timestamptz, ${now}::timestamptz
    )
  `;
  const created = await getMainBannerById(id);
  if (!created) throw new Error("BANNER_CREATE_FAILED");
  return created;
}

export async function updateMainBanner(
  id: string,
  input: MainBannerUpsertInput,
): Promise<MainBannerRecord | null> {
  const existing = await getMainBannerById(id);
  if (!existing) return null;
  const sql = getSql();
  const now = new Date().toISOString();
  await sql`
    UPDATE main_banners SET
      title = ${input.title ?? existing.title},
      subtitle = ${input.subtitle !== undefined ? input.subtitle : existing.subtitle},
      description = ${input.description !== undefined ? input.description : existing.description},
      image_url = ${input.imageUrl !== undefined ? input.imageUrl : existing.imageUrl},
      mobile_image_url = ${input.mobileImageUrl !== undefined ? input.mobileImageUrl : existing.mobileImageUrl},
      link_url = ${input.linkUrl ?? existing.linkUrl},
      button_text = ${input.buttonText !== undefined ? input.buttonText : existing.buttonText},
      promo_label = ${input.promoLabel !== undefined ? input.promoLabel : existing.promoLabel},
      image_alt = ${input.imageAlt !== undefined ? input.imageAlt : existing.imageAlt},
      status = ${input.status ?? existing.status},
      sort_order = ${input.sortOrder ?? existing.sortOrder},
      starts_at = ${input.startsAt !== undefined ? input.startsAt : existing.startsAt}::timestamptz,
      ends_at = ${input.endsAt !== undefined ? input.endsAt : existing.endsAt}::timestamptz,
      show_on_main = ${input.showOnMain ?? existing.showOnMain},
      updated_at = ${now}::timestamptz
    WHERE id = ${id}
  `;
  return getMainBannerById(id);
}

export async function toggleMainBannerStatus(id: string): Promise<MainBannerRecord | null> {
  const existing = await getMainBannerById(id);
  if (!existing) return null;
  const next = existing.status === "active" ? "inactive" : "active";
  return updateMainBanner(id, { status: next });
}

export async function setMainBannerStatus(
  id: string,
  status: MainBannerStatus,
): Promise<MainBannerRecord | null> {
  const existing = await getMainBannerById(id);
  if (!existing) return null;
  if (existing.status === status) return existing;
  return updateMainBanner(id, { status });
}

export async function deleteMainBanner(id: string): Promise<boolean> {
  await ensureDb();
  const sql = getSql();
  const rows = (await sql`
    DELETE FROM main_banners WHERE id = ${id} RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}

export async function reorderMainBanner(
  id: string,
  direction: "up" | "down",
): Promise<MainBannerRecord[] | null> {
  const all = await listMainBanners(500);
  const idx = all.findIndex((b) => b.id === id);
  if (idx < 0) return null;
  const targetIdx = direction === "up" ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= all.length) return all;

  const reordered = [...all];
  const [item] = reordered.splice(idx, 1);
  reordered.splice(targetIdx, 0, item);

  const sql = getSql();
  const now = new Date().toISOString();
  for (let i = 0; i < reordered.length; i++) {
    const sortOrder = reordered.length - i;
    await sql`
      UPDATE main_banners
      SET sort_order = ${sortOrder}, updated_at = ${now}::timestamptz
      WHERE id = ${reordered[i]!.id}
    `;
  }
  return listMainBanners(500);
}

export async function countActiveMainBanners(): Promise<number> {
  await ensureDb();
  const sql = getSql();
  const rows = (await sql`
    SELECT COUNT(*)::int AS cnt FROM main_banners WHERE status = 'active' AND show_on_main = TRUE
  `) as { cnt: number }[];
  return rows[0]?.cnt ?? 0;
}
