import "server-only";
import { ensureCmsSchema } from "@/lib/db/ensure-cms-schema";
import { getSql } from "@/lib/db/postgres";
import { generateCmsId } from "@/lib/cms/seed-default-cms";
import type { ReviewBadgeId } from "@/lib/reviews-mock-data";
import type {
  CustomerReviewCreateInput,
  CustomerReviewRecord,
  CustomerReviewUpsertInput,
  CustomerReviewWorkInfo,
  PaginatedResult,
} from "@/types/customer-review";

type ReviewRow = {
  id: string;
  author_name: string;
  vehicle_name: string | null;
  branch_name: string | null;
  service_type: string | null;
  battery_code: string | null;
  rating: number;
  content: string;
  summary: string | null;
  image_url: string | null;
  images_json: string[];
  badges_json: ReviewBadgeId[];
  home_badges_json: string[];
  work_info_json: CustomerReviewWorkInfo | null;
  operator_reply: string | null;
  operator_summary: string | null;
  product_href: string | null;
  status: string;
  featured: boolean;
  pinned: boolean;
  sort_order: number;
  show_on_main: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

function rowToRecord(row: ReviewRow): CustomerReviewRecord {
  return {
    id: row.id,
    authorName: row.author_name,
    vehicleName: row.vehicle_name,
    branchName: row.branch_name,
    serviceType: row.service_type,
    batteryCode: row.battery_code,
    rating: row.rating,
    content: row.content,
    summary: row.summary,
    imageUrl: row.image_url,
    images: row.images_json ?? [],
    badges: row.badges_json ?? [],
    homeBadges: row.home_badges_json ?? [],
    workInfo: row.work_info_json,
    operatorReply: row.operator_reply,
    operatorSummary: row.operator_summary,
    productHref: row.product_href,
    status: row.status as CustomerReviewRecord["status"],
    featured: row.featured,
    pinned: row.pinned,
    sortOrder: row.sort_order,
    showOnMain: row.show_on_main,
    startsAt: row.starts_at ? new Date(row.starts_at).toISOString() : null,
    endsAt: row.ends_at ? new Date(row.ends_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function isActive(row: ReviewRow, now = new Date()): boolean {
  if (row.status !== "active") return false;
  const starts = row.starts_at ? new Date(row.starts_at) : null;
  const ends = row.ends_at ? new Date(row.ends_at) : null;
  if (starts && starts > now) return false;
  if (ends && ends < now) return false;
  return true;
}

async function ensureDb(): Promise<void> {
  await ensureCmsSchema();
}

export async function listCustomerReviewsPaginated(
  page = 1,
  limit = 12,
  options?: { mainOnly?: boolean; featuredOnly?: boolean; batteryCode?: string },
): Promise<PaginatedResult<CustomerReviewRecord>> {
  await ensureDb();
  const sql = getSql();
  const offset = (page - 1) * limit;
  const battery = options?.batteryCode?.trim().toUpperCase();

  const rows = (await sql`
    SELECT * FROM customer_reviews
    WHERE status = 'active'
      AND (${options?.mainOnly ?? false} = FALSE OR show_on_main = TRUE)
      AND (${options?.featuredOnly ?? false} = FALSE OR featured = TRUE OR pinned = TRUE)
      AND (${battery ?? null}::text IS NULL OR UPPER(battery_code) = ${battery ?? null})
    ORDER BY pinned DESC, sort_order DESC, created_at DESC
    LIMIT ${limit + 1} OFFSET ${offset}
  `) as ReviewRow[];

  const activeRows = rows.filter((r) => isActive(r));
  const hasMore = activeRows.length > limit;
  const items = activeRows.slice(0, limit).map(rowToRecord);

  const countRows = (await sql`
    SELECT COUNT(*)::int AS cnt FROM customer_reviews
    WHERE status = 'active'
      AND (${options?.mainOnly ?? false} = FALSE OR show_on_main = TRUE)
      AND (${battery ?? null}::text IS NULL OR UPPER(battery_code) = ${battery ?? null})
  `) as { cnt: number }[];

  return {
    items,
    total: countRows[0]?.cnt ?? items.length,
    page,
    limit,
    hasMore,
  };
}

export async function listCustomerReviewsAdmin(
  page = 1,
  limit = 20,
): Promise<PaginatedResult<CustomerReviewRecord>> {
  await ensureDb();
  const sql = getSql();
  const offset = (page - 1) * limit;
  const totalRows = (await sql`SELECT COUNT(*)::int AS cnt FROM customer_reviews`) as { cnt: number }[];
  const total = totalRows[0]?.cnt ?? 0;
  const rows = (await sql`
    SELECT * FROM customer_reviews
    ORDER BY pinned DESC, sort_order DESC, created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `) as ReviewRow[];
  return {
    items: rows.map(rowToRecord),
    total,
    page,
    limit,
    hasMore: offset + rows.length < total,
  };
}

export async function getCustomerReviewById(id: string): Promise<CustomerReviewRecord | null> {
  await ensureDb();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM customer_reviews WHERE id = ${id} LIMIT 1`) as ReviewRow[];
  return rows[0] ? rowToRecord(rows[0]) : null;
}

export async function createCustomerReview(
  input: CustomerReviewCreateInput,
): Promise<CustomerReviewRecord> {
  await ensureDb();
  const sql = getSql();
  const id = generateCmsId("review");
  const now = new Date().toISOString();
  await sql`
    INSERT INTO customer_reviews (
      id, author_name, vehicle_name, branch_name, service_type, battery_code,
      rating, content, summary, image_url, images_json, badges_json, home_badges_json,
      work_info_json, operator_reply, operator_summary, product_href, status,
      featured, pinned, sort_order, show_on_main, starts_at, ends_at, created_at, updated_at
    ) VALUES (
      ${id}, ${input.authorName}, ${input.vehicleName ?? null}, ${input.branchName ?? null},
      ${input.serviceType ?? null}, ${input.batteryCode ?? null}, ${input.rating ?? 5},
      ${input.content}, ${input.summary ?? null}, ${input.imageUrl ?? null},
      ${JSON.stringify(input.images ?? [])}::jsonb,
      ${JSON.stringify(input.badges ?? [])}::jsonb,
      ${JSON.stringify(input.homeBadges ?? [])}::jsonb,
      ${input.workInfo ? JSON.stringify(input.workInfo) : null}::jsonb,
      ${input.operatorReply ?? null}, ${input.operatorSummary ?? null},
      ${input.productHref ?? null}, ${input.status ?? "inactive"},
      ${input.featured ?? false}, ${input.pinned ?? false}, ${input.sortOrder ?? 0},
      ${input.showOnMain ?? false}, ${input.startsAt ?? null}::timestamptz,
      ${input.endsAt ?? null}::timestamptz, ${now}::timestamptz, ${now}::timestamptz
    )
  `;
  const created = await getCustomerReviewById(id);
  if (!created) throw new Error("REVIEW_CREATE_FAILED");
  return created;
}

export async function updateCustomerReview(
  id: string,
  input: CustomerReviewUpsertInput,
): Promise<CustomerReviewRecord | null> {
  const existing = await getCustomerReviewById(id);
  if (!existing) return null;
  const sql = getSql();
  const now = new Date().toISOString();
  await sql`
    UPDATE customer_reviews SET
      author_name = ${input.authorName ?? existing.authorName},
      vehicle_name = ${input.vehicleName !== undefined ? input.vehicleName : existing.vehicleName},
      branch_name = ${input.branchName !== undefined ? input.branchName : existing.branchName},
      service_type = ${input.serviceType !== undefined ? input.serviceType : existing.serviceType},
      battery_code = ${input.batteryCode !== undefined ? input.batteryCode : existing.batteryCode},
      rating = ${input.rating ?? existing.rating},
      content = ${input.content ?? existing.content},
      summary = ${input.summary !== undefined ? input.summary : existing.summary},
      image_url = ${input.imageUrl !== undefined ? input.imageUrl : existing.imageUrl},
      images_json = ${JSON.stringify(input.images ?? existing.images)}::jsonb,
      badges_json = ${JSON.stringify(input.badges ?? existing.badges)}::jsonb,
      home_badges_json = ${JSON.stringify(input.homeBadges ?? existing.homeBadges)}::jsonb,
      work_info_json = ${input.workInfo !== undefined ? (input.workInfo ? JSON.stringify(input.workInfo) : null) : JSON.stringify(existing.workInfo)}::jsonb,
      operator_reply = ${input.operatorReply !== undefined ? input.operatorReply : existing.operatorReply},
      operator_summary = ${input.operatorSummary !== undefined ? input.operatorSummary : existing.operatorSummary},
      product_href = ${input.productHref !== undefined ? input.productHref : existing.productHref},
      status = ${input.status ?? existing.status},
      featured = ${input.featured ?? existing.featured},
      pinned = ${input.pinned ?? existing.pinned},
      sort_order = ${input.sortOrder ?? existing.sortOrder},
      show_on_main = ${input.showOnMain ?? existing.showOnMain},
      starts_at = ${input.startsAt !== undefined ? input.startsAt : existing.startsAt}::timestamptz,
      ends_at = ${input.endsAt !== undefined ? input.endsAt : existing.endsAt}::timestamptz,
      updated_at = ${now}::timestamptz
    WHERE id = ${id}
  `;
  return getCustomerReviewById(id);
}

export async function toggleCustomerReviewStatus(id: string): Promise<CustomerReviewRecord | null> {
  const existing = await getCustomerReviewById(id);
  if (!existing) return null;
  const next = existing.status === "active" ? "inactive" : "active";
  return updateCustomerReview(id, { status: next });
}
