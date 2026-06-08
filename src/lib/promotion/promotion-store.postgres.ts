import "server-only";
import { randomBytes } from "node:crypto";
import { ensurePromotionSchema } from "@/lib/db/ensure-promotion-schema";
import { getSql } from "@/lib/db/postgres";
import { generatePromotionId } from "@/lib/promotion/seed-default-promotions";
import type {
  PromotionRecord,
  PromotionStatus,
  PromotionCreateInput,
  PromotionUpsertInput,
  PromotionUsageRecord,
} from "@/types/promotion";

type PromotionRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit_total: number | null;
  usage_limit_per_member: number | null;
  first_order_only: boolean;
  new_member_only: boolean;
  member_only: boolean;
  allowed_fulfillment_types: string[] | null;
  allowed_battery_specs: string[] | null;
  allowed_brands: string[] | null;
  excluded_battery_specs: string[] | null;
  excluded_brands: string[] | null;
  stackable: boolean;
  priority: number;
  code: string | null;
  image_url: string | null;
  banner_image_url: string | null;
  badge_text: string | null;
  show_on_main: boolean;
  show_on_benefits_page: boolean;
  created_at: string;
  updated_at: string;
};

type UsageRow = {
  id: string;
  promotion_id: string;
  member_id: string | null;
  order_id: string;
  discount_amount: number;
  used_at: string;
  coupon_code: string | null;
};

function rowToRecord(row: PromotionRow): PromotionRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as PromotionRecord["status"],
    type: row.type as PromotionRecord["type"],
    discountType: row.discount_type as PromotionRecord["discountType"],
    discountValue: row.discount_value,
    maxDiscountAmount: row.max_discount_amount,
    minOrderAmount: row.min_order_amount,
    startsAt: row.starts_at ? new Date(row.starts_at).toISOString() : null,
    endsAt: row.ends_at ? new Date(row.ends_at).toISOString() : null,
    usageLimitTotal: row.usage_limit_total,
    usageLimitPerMember: row.usage_limit_per_member,
    firstOrderOnly: row.first_order_only,
    newMemberOnly: row.new_member_only,
    memberOnly: row.member_only,
    allowedFulfillmentTypes: row.allowed_fulfillment_types,
    allowedBatterySpecs: row.allowed_battery_specs,
    allowedBrands: row.allowed_brands,
    excludedBatterySpecs: row.excluded_battery_specs,
    excludedBrands: row.excluded_brands,
    stackable: row.stackable,
    priority: row.priority,
    code: row.code,
    imageUrl: row.image_url,
    bannerImageUrl: row.banner_image_url,
    badgeText: row.badge_text,
    showOnMain: row.show_on_main,
    showOnBenefitsPage: row.show_on_benefits_page,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function usageRowToRecord(row: UsageRow): PromotionUsageRecord {
  return {
    id: row.id,
    promotionId: row.promotion_id,
    memberId: row.member_id,
    orderId: row.order_id,
    discountAmount: row.discount_amount,
    usedAt: new Date(row.used_at).toISOString(),
    couponCode: row.coupon_code,
  };
}

function resolveEffectiveStatus(
  row: Pick<PromotionRow, "status" | "starts_at" | "ends_at">,
  now = new Date(),
): PromotionStatus {
  if (row.status === "inactive") return "inactive";
  const starts = row.starts_at ? new Date(row.starts_at) : null;
  const ends = row.ends_at ? new Date(row.ends_at) : null;
  if (ends && ends < now) return "expired";
  if (starts && starts > now) return "scheduled";
  if (row.status === "expired") return "expired";
  if (row.status === "scheduled") return starts && starts > now ? "scheduled" : "active";
  return row.status === "active" ? "active" : "inactive";
}

async function ensureDb(): Promise<void> {
  await ensurePromotionSchema();
}

export async function listPromotions(limit = 200): Promise<PromotionRecord[]> {
  await ensureDb();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM promotions ORDER BY priority DESC, created_at DESC LIMIT ${limit}
  `) as PromotionRow[];
  return rows.map(rowToRecord);
}

export async function listActivePromotions(now = new Date()): Promise<PromotionRecord[]> {
  await ensureDb();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM promotions
    WHERE status = 'active'
      AND (starts_at IS NULL OR starts_at <= ${now.toISOString()}::timestamptz)
      AND (ends_at IS NULL OR ends_at >= ${now.toISOString()}::timestamptz)
    ORDER BY priority DESC, created_at DESC
  `) as PromotionRow[];
  return rows.map(rowToRecord);
}

export async function getPromotionById(id: string): Promise<PromotionRecord | null> {
  await ensureDb();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM promotions WHERE id = ${id} LIMIT 1
  `) as PromotionRow[];
  return rows[0] ? rowToRecord(rows[0]) : null;
}

export async function getPromotionByCode(code: string): Promise<PromotionRecord | null> {
  await ensureDb();
  const sql = getSql();
  const normalized = code.trim().toUpperCase();
  const rows = (await sql`
    SELECT * FROM promotions WHERE UPPER(code) = ${normalized} LIMIT 1
  `) as PromotionRow[];
  return rows[0] ? rowToRecord(rows[0]) : null;
}

export async function createPromotion(
  input: PromotionCreateInput,
): Promise<PromotionRecord> {
  await ensureDb();
  const sql = getSql();
  const id = generatePromotionId();
  const now = new Date().toISOString();

  await sql`
    INSERT INTO promotions (
      id, title, description, status, type, discount_type, discount_value,
      max_discount_amount, min_order_amount, starts_at, ends_at,
      usage_limit_total, usage_limit_per_member, first_order_only, new_member_only,
      member_only, allowed_fulfillment_types, allowed_battery_specs, allowed_brands,
      excluded_battery_specs, excluded_brands, stackable, priority, code,
      image_url, banner_image_url, badge_text, show_on_main, show_on_benefits_page,
      created_at, updated_at
    ) VALUES (
      ${id},
      ${input.title},
      ${input.description ?? ""},
      ${input.status ?? "inactive"},
      ${input.type},
      ${input.discountType},
      ${input.discountValue},
      ${input.maxDiscountAmount ?? null},
      ${input.minOrderAmount ?? null},
      ${input.startsAt ?? null}::timestamptz,
      ${input.endsAt ?? null}::timestamptz,
      ${input.usageLimitTotal ?? null},
      ${input.usageLimitPerMember ?? null},
      ${input.firstOrderOnly ?? false},
      ${input.newMemberOnly ?? false},
      ${input.memberOnly ?? false},
      ${input.allowedFulfillmentTypes ? JSON.stringify(input.allowedFulfillmentTypes) : null}::jsonb,
      ${input.allowedBatterySpecs ? JSON.stringify(input.allowedBatterySpecs) : null}::jsonb,
      ${input.allowedBrands ? JSON.stringify(input.allowedBrands) : null}::jsonb,
      ${input.excludedBatterySpecs ? JSON.stringify(input.excludedBatterySpecs) : null}::jsonb,
      ${input.excludedBrands ? JSON.stringify(input.excludedBrands) : null}::jsonb,
      ${input.stackable ?? false},
      ${input.priority ?? 0},
      ${input.code?.trim().toUpperCase() ?? null},
      ${input.imageUrl ?? null},
      ${input.bannerImageUrl ?? null},
      ${input.badgeText ?? null},
      ${input.showOnMain ?? false},
      ${input.showOnBenefitsPage ?? false},
      ${now}::timestamptz,
      ${now}::timestamptz
    )
  `;

  const created = await getPromotionById(id);
  if (!created) throw new Error("PROMOTION_CREATE_FAILED");
  return created;
}

export async function updatePromotion(
  id: string,
  input: PromotionUpsertInput,
): Promise<PromotionRecord | null> {
  await ensureDb();
  const existing = await getPromotionById(id);
  if (!existing) return null;

  const sql = getSql();
  const now = new Date().toISOString();

  await sql`
    UPDATE promotions SET
      title = ${input.title ?? existing.title},
      description = ${input.description ?? existing.description},
      status = ${input.status ?? existing.status},
      type = ${input.type ?? existing.type},
      discount_type = ${input.discountType ?? existing.discountType},
      discount_value = ${input.discountValue ?? existing.discountValue},
      max_discount_amount = ${input.maxDiscountAmount !== undefined ? input.maxDiscountAmount : existing.maxDiscountAmount},
      min_order_amount = ${input.minOrderAmount !== undefined ? input.minOrderAmount : existing.minOrderAmount},
      starts_at = ${input.startsAt !== undefined ? input.startsAt : existing.startsAt}::timestamptz,
      ends_at = ${input.endsAt !== undefined ? input.endsAt : existing.endsAt}::timestamptz,
      usage_limit_total = ${input.usageLimitTotal !== undefined ? input.usageLimitTotal : existing.usageLimitTotal},
      usage_limit_per_member = ${input.usageLimitPerMember !== undefined ? input.usageLimitPerMember : existing.usageLimitPerMember},
      first_order_only = ${input.firstOrderOnly ?? existing.firstOrderOnly},
      new_member_only = ${input.newMemberOnly ?? existing.newMemberOnly},
      member_only = ${input.memberOnly ?? existing.memberOnly},
      allowed_fulfillment_types = ${input.allowedFulfillmentTypes !== undefined ? (input.allowedFulfillmentTypes ? JSON.stringify(input.allowedFulfillmentTypes) : null) : JSON.stringify(existing.allowedFulfillmentTypes)}::jsonb,
      allowed_battery_specs = ${input.allowedBatterySpecs !== undefined ? (input.allowedBatterySpecs ? JSON.stringify(input.allowedBatterySpecs) : null) : JSON.stringify(existing.allowedBatterySpecs)}::jsonb,
      allowed_brands = ${input.allowedBrands !== undefined ? (input.allowedBrands ? JSON.stringify(input.allowedBrands) : null) : JSON.stringify(existing.allowedBrands)}::jsonb,
      excluded_battery_specs = ${input.excludedBatterySpecs !== undefined ? (input.excludedBatterySpecs ? JSON.stringify(input.excludedBatterySpecs) : null) : JSON.stringify(existing.excludedBatterySpecs)}::jsonb,
      excluded_brands = ${input.excludedBrands !== undefined ? (input.excludedBrands ? JSON.stringify(input.excludedBrands) : null) : JSON.stringify(existing.excludedBrands)}::jsonb,
      stackable = ${input.stackable ?? existing.stackable},
      priority = ${input.priority ?? existing.priority},
      code = ${input.code !== undefined ? (input.code?.trim().toUpperCase() ?? null) : existing.code},
      image_url = ${input.imageUrl !== undefined ? input.imageUrl : existing.imageUrl},
      banner_image_url = ${input.bannerImageUrl !== undefined ? input.bannerImageUrl : existing.bannerImageUrl},
      badge_text = ${input.badgeText !== undefined ? input.badgeText : existing.badgeText},
      show_on_main = ${input.showOnMain ?? existing.showOnMain},
      show_on_benefits_page = ${input.showOnBenefitsPage ?? existing.showOnBenefitsPage},
      updated_at = ${now}::timestamptz
    WHERE id = ${id}
  `;

  return getPromotionById(id);
}

export async function togglePromotionStatus(id: string): Promise<PromotionRecord | null> {
  const existing = await getPromotionById(id);
  if (!existing) return null;
  const next = existing.status === "active" ? "inactive" : "active";
  return updatePromotion(id, { status: next });
}

export async function countPromotionUsages(promotionId: string): Promise<number> {
  await ensureDb();
  const sql = getSql();
  const rows = (await sql`
    SELECT COUNT(*)::int AS cnt FROM promotion_usages WHERE promotion_id = ${promotionId}
  `) as { cnt: number }[];
  return rows[0]?.cnt ?? 0;
}

export async function countMemberPromotionUsages(
  promotionId: string,
  memberId: string,
): Promise<number> {
  await ensureDb();
  const sql = getSql();
  const rows = (await sql`
    SELECT COUNT(*)::int AS cnt FROM promotion_usages
    WHERE promotion_id = ${promotionId} AND member_id = ${memberId}
  `) as { cnt: number }[];
  return rows[0]?.cnt ?? 0;
}

export async function listPromotionUsages(
  promotionId: string,
  limit = 100,
): Promise<PromotionUsageRecord[]> {
  await ensureDb();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM promotion_usages
    WHERE promotion_id = ${promotionId}
    ORDER BY used_at DESC
    LIMIT ${limit}
  `) as UsageRow[];
  return rows.map(usageRowToRecord);
}

export async function hasPromotionUsagesForOrder(orderId: string): Promise<boolean> {
  await ensureDb();
  const sql = getSql();
  const rows = (await sql`
    SELECT COUNT(*)::int AS cnt FROM promotion_usages WHERE order_id = ${orderId}
  `) as { cnt: number }[];
  return (rows[0]?.cnt ?? 0) > 0;
}

export async function recordPromotionUsages(
  usages: Array<{
    promotionId: string;
    memberId: string | null;
    orderId: string;
    discountAmount: number;
    couponCode?: string | null;
  }>,
): Promise<void> {
  if (usages.length === 0) return;
  await ensureDb();
  const sql = getSql();
  const now = new Date().toISOString();

  for (const u of usages) {
    const id = `pu_${Date.now()}_${randomBytes(4).toString("hex")}`;
    await sql`
      INSERT INTO promotion_usages (
        id, promotion_id, member_id, order_id, discount_amount, used_at, coupon_code
      ) VALUES (
        ${id},
        ${u.promotionId},
        ${u.memberId},
        ${u.orderId},
        ${u.discountAmount},
        ${now}::timestamptz,
        ${u.couponCode ?? null}
      )
    `;
  }
}

export async function countCompletedOrdersForMember(
  memberId: string,
  excludeOrderId?: string,
): Promise<number> {
  await ensureDb();
  const sql = getSql();
  if (excludeOrderId) {
    const rows = (await sql`
      SELECT COUNT(*)::int AS cnt FROM commerce_orders
      WHERE user_id = ${memberId}
        AND payment_status = 'completed'
        AND id <> ${excludeOrderId}
    `) as { cnt: number }[];
    return rows[0]?.cnt ?? 0;
  }
  const rows = (await sql`
    SELECT COUNT(*)::int AS cnt FROM commerce_orders
    WHERE user_id = ${memberId} AND payment_status = 'completed'
  `) as { cnt: number }[];
  return rows[0]?.cnt ?? 0;
}

export { resolveEffectiveStatus };
