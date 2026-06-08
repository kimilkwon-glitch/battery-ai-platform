import "server-only";
import { getSql, isPostgresConfigured } from "@/lib/db/postgres";
import { seedDefaultPromotions } from "@/lib/promotion/seed-default-promotions";

let schemaReady: Promise<void> | null = null;

export async function ensurePromotionSchema(): Promise<void> {
  if (!isPostgresConfigured()) return;
  if (!schemaReady) {
    schemaReady = runMigration();
  }
  await schemaReady;
}

async function runMigration(): Promise<void> {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS promotions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'inactive',
      type TEXT NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value INTEGER NOT NULL,
      max_discount_amount INTEGER,
      min_order_amount INTEGER,
      starts_at TIMESTAMPTZ,
      ends_at TIMESTAMPTZ,
      usage_limit_total INTEGER,
      usage_limit_per_member INTEGER,
      first_order_only BOOLEAN NOT NULL DEFAULT FALSE,
      new_member_only BOOLEAN NOT NULL DEFAULT FALSE,
      member_only BOOLEAN NOT NULL DEFAULT FALSE,
      allowed_fulfillment_types JSONB,
      allowed_battery_specs JSONB,
      allowed_brands JSONB,
      excluded_battery_specs JSONB,
      excluded_brands JSONB,
      stackable BOOLEAN NOT NULL DEFAULT FALSE,
      priority INTEGER NOT NULL DEFAULT 0,
      code TEXT,
      image_url TEXT,
      banner_image_url TEXT,
      badge_text TEXT,
      show_on_main BOOLEAN NOT NULL DEFAULT FALSE,
      show_on_benefits_page BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_promotions_code_unique
      ON promotions (LOWER(code))
      WHERE code IS NOT NULL AND code <> ''
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_promotions_status_dates
      ON promotions (status, starts_at, ends_at)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS promotion_usages (
      id TEXT PRIMARY KEY,
      promotion_id TEXT NOT NULL REFERENCES promotions(id) ON DELETE RESTRICT,
      member_id TEXT,
      order_id TEXT NOT NULL,
      discount_amount INTEGER NOT NULL,
      used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      coupon_code TEXT
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_promotion_usages_promotion
      ON promotion_usages (promotion_id, used_at DESC)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_promotion_usages_member
      ON promotion_usages (member_id, promotion_id)
      WHERE member_id IS NOT NULL
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_promotion_usages_order
      ON promotion_usages (order_id)
  `;

  await sql`
    ALTER TABLE commerce_orders
      ADD COLUMN IF NOT EXISTS promotion_discount_total INTEGER NOT NULL DEFAULT 0
  `;

  await sql`
    ALTER TABLE commerce_orders
      ADD COLUMN IF NOT EXISTS applied_promotions_json JSONB NOT NULL DEFAULT '[]'::jsonb
  `;

  await seedDefaultPromotions();
}
