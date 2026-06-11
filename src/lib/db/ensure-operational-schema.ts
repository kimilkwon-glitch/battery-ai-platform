import "server-only";
import { ensureBatteryTalkPgListener } from "@/lib/battery-talk/battery-talk-realtime-pg";
import { getSql, isPostgresConfigured } from "@/lib/db/postgres";

let schemaReady: Promise<void> | null = null;

export async function ensureOperationalSchema(): Promise<void> {
  if (!isPostgresConfigured()) return;
  if (!schemaReady) {
    schemaReady = runMigration();
  }
  await schemaReady;
}

async function runMigration(): Promise<void> {
  ensureBatteryTalkPgListener();
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS commerce_claims (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      order_number TEXT NOT NULL,
      claim_type TEXT NOT NULL,
      claim_status TEXT NOT NULL,
      reason_code TEXT NOT NULL,
      reason_text TEXT,
      customer_message TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      attachment_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
      admin_memo TEXT DEFAULT '',
      customer_reply TEXT,
      needs_customer_notice BOOLEAN NOT NULL DEFAULT FALSE,
      assigned_to TEXT,
      order_status TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      product_name TEXT NOT NULL,
      battery_code TEXT NOT NULL,
      fulfillment_type TEXT NOT NULL,
      return_battery_option TEXT NOT NULL,
      final_amount INTEGER,
      delivery_fee INTEGER NOT NULL DEFAULT 0,
      promotion_discount_total INTEGER DEFAULT 0,
      estimated_refund_amount INTEGER,
      requested_at TIMESTAMPTZ NOT NULL,
      reviewed_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS commerce_claim_histories (
      id TEXT PRIMARY KEY,
      claim_id TEXT NOT NULL REFERENCES commerce_claims(id) ON DELETE CASCADE,
      previous_status TEXT,
      next_status TEXT NOT NULL,
      memo TEXT,
      actor_type TEXT NOT NULL,
      actor_name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_commerce_claims_status_updated
      ON commerce_claims (claim_status, updated_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_commerce_claim_histories_claim
      ON commerce_claim_histories (claim_id, created_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS order_requests (
      id TEXT PRIMARY KEY,
      request_number TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      vehicle_name TEXT,
      vehicle_year TEXT,
      vehicle_fuel_type TEXT,
      current_battery_spec TEXT,
      battery_spec_summary TEXT NOT NULL,
      terminal_direction TEXT,
      used_battery_return_option TEXT NOT NULL,
      fulfillment_method TEXT NOT NULL,
      store_id TEXT,
      requested_region TEXT,
      preferred_time TEXT,
      items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      memo TEXT,
      internal_memo TEXT DEFAULT '',
      review_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
      confirmations_json JSONB,
      source TEXT NOT NULL DEFAULT 'web_form',
      customer_type TEXT,
      guest_extras_json JSONB,
      contacted_at TIMESTAMPTZ,
      closed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_order_requests_status_created
      ON order_requests (status, created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_order_requests_number_prefix
      ON order_requests (request_number text_pattern_ops)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS customer_inquiries (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'new',
      category TEXT NOT NULL DEFAULT 'other',
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      vehicle TEXT,
      region TEXT,
      message TEXT NOT NULL,
      title TEXT,
      battery_code TEXT,
      product_code TEXT,
      product_name TEXT,
      return_option TEXT,
      page_url TEXT,
      source TEXT,
      inquiry_type TEXT,
      coupon_code TEXT,
      admin_memo TEXT DEFAULT '',
      is_secret BOOLEAN NOT NULL DEFAULT FALSE,
      hidden BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_customer_inquiries_status_created
      ON customer_inquiries (status, created_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS battery_talk_sessions (
      id TEXT PRIMARY KEY,
      customer_name TEXT,
      customer_phone TEXT NOT NULL DEFAULT '',
      source_page TEXT,
      product_id TEXT,
      product_name TEXT,
      battery_code TEXT,
      car_name TEXT,
      status TEXT NOT NULL DEFAULT 'waiting',
      assigned_admin_id TEXT,
      last_message TEXT,
      last_message_at TIMESTAMPTZ,
      admin_memo TEXT DEFAULT '',
      unread_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
      context_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      user_id TEXT,
      is_member BOOLEAN NOT NULL DEFAULT FALSE,
      legacy_inquiry_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS battery_talk_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES battery_talk_sessions(id) ON DELETE CASCADE,
      sender_type TEXT NOT NULL,
      sender_name TEXT,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      read_at TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_battery_talk_messages_session_created
      ON battery_talk_messages (session_id, created_at)
  `;
  await sql`
    ALTER TABLE battery_talk_messages
      ADD COLUMN IF NOT EXISTS recalled_at TIMESTAMPTZ
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_battery_talk_sessions_status_updated
      ON battery_talk_sessions (status, updated_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS commerce_order_admin_meta (
      order_id TEXT PRIMARY KEY,
      admin_memo TEXT DEFAULT '',
      shipping_carrier TEXT,
      shipping_tracking_number TEXT,
      courier_code TEXT,
      shipped_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    ALTER TABLE commerce_order_admin_meta
      ADD COLUMN IF NOT EXISTS courier_code TEXT
  `;
  await sql`
    ALTER TABLE commerce_order_admin_meta
      ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS support_notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      display_date TEXT NOT NULL,
      important BOOLEAN NOT NULL DEFAULT FALSE,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      show_in_hub BOOLEAN NOT NULL DEFAULT TRUE,
      category TEXT NOT NULL DEFAULT 'general',
      sort_order INTEGER NOT NULL DEFAULT 0,
      image_src TEXT,
      image_alt TEXT,
      body_html TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS consultation_settings (
      id TEXT PRIMARY KEY,
      settings_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
