import "server-only";
import { getSql, isPostgresConfigured } from "@/lib/db/postgres";
import { seedDefaultCmsContent } from "@/lib/cms/seed-default-cms";

let schemaReady: Promise<void> | null = null;

export async function ensureCmsSchema(): Promise<void> {
  if (!isPostgresConfigured()) return;
  if (!schemaReady) {
    schemaReady = runMigration();
  }
  await schemaReady;
}

async function runMigration(): Promise<void> {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS main_banners (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT,
      image_url TEXT,
      mobile_image_url TEXT,
      link_url TEXT NOT NULL DEFAULT '/',
      button_text TEXT,
      promo_label TEXT,
      image_alt TEXT,
      status TEXT NOT NULL DEFAULT 'inactive',
      sort_order INTEGER NOT NULL DEFAULT 0,
      starts_at TIMESTAMPTZ,
      ends_at TIMESTAMPTZ,
      show_on_main BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_main_banners_active_sort
      ON main_banners (status, sort_order DESC, created_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS customer_reviews (
      id TEXT PRIMARY KEY,
      author_name TEXT NOT NULL,
      vehicle_name TEXT,
      branch_name TEXT,
      service_type TEXT,
      battery_code TEXT,
      rating INTEGER NOT NULL DEFAULT 5,
      content TEXT NOT NULL,
      summary TEXT,
      image_url TEXT,
      images_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      badges_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      home_badges_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      work_info_json JSONB,
      operator_reply TEXT,
      operator_summary TEXT,
      product_href TEXT,
      status TEXT NOT NULL DEFAULT 'inactive',
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      pinned BOOLEAN NOT NULL DEFAULT FALSE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      show_on_main BOOLEAN NOT NULL DEFAULT FALSE,
      starts_at TIMESTAMPTZ,
      ends_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_customer_reviews_active_sort
      ON customer_reviews (status, pinned DESC, sort_order DESC, created_at DESC)
  `;

  await sql`ALTER TABLE customer_reviews ADD COLUMN IF NOT EXISTS order_id TEXT`;
  await sql`ALTER TABLE customer_reviews ADD COLUMN IF NOT EXISTS user_id TEXT`;
  await sql`ALTER TABLE customer_reviews ADD COLUMN IF NOT EXISTS review_source TEXT NOT NULL DEFAULT 'admin_import'`;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_customer_reviews_order_id
      ON customer_reviews (order_id)
      WHERE order_id IS NOT NULL
  `;

  await seedDefaultCmsContent();
}
