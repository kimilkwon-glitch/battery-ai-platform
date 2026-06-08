import "server-only";
import { getSql, isPostgresConfigured } from "@/lib/db/postgres";

let schemaReady: Promise<void> | null = null;

export async function ensureCommerceSchema(): Promise<void> {
  if (!isPostgresConfigured()) return;
  if (!schemaReady) {
    schemaReady = runMigration();
  }
  await schemaReady;
}

async function runMigration(): Promise<void> {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS commerce_orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      customer_type TEXT NOT NULL DEFAULT 'member',
      vehicle_name TEXT,
      vehicle_year TEXT,
      vehicle_fuel TEXT,
      vehicle_plate_suffix TEXT,
      product_name TEXT NOT NULL,
      brand TEXT,
      battery_code TEXT NOT NULL,
      internet_price INTEGER,
      onsite_price INTEGER,
      fulfillment_type TEXT NOT NULL,
      return_battery_option TEXT NOT NULL,
      delivery_fee INTEGER NOT NULL DEFAULT 0,
      store_install_discount INTEGER NOT NULL DEFAULT 0,
      final_amount INTEGER,
      address TEXT,
      selected_store TEXT,
      request_memo TEXT,
      order_status TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      payment_request_id TEXT,
      user_id TEXT,
      items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      price_lines_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE commerce_orders ADD COLUMN IF NOT EXISTS user_id TEXT`;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_commerce_orders_user_id_created
      ON commerce_orders (user_id, created_at DESC)
      WHERE user_id IS NOT NULL
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS commerce_payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES commerce_orders(id) ON DELETE CASCADE,
      provider TEXT NOT NULL DEFAULT 'toss',
      payment_key TEXT,
      toss_order_id TEXT,
      payment_request_id TEXT,
      amount INTEGER,
      method TEXT,
      status TEXT NOT NULL,
      approved_at TIMESTAMPTZ,
      receipt_url TEXT,
      fail_code TEXT,
      fail_message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS commerce_order_status_logs (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES commerce_orders(id) ON DELETE CASCADE,
      previous_order_status TEXT,
      previous_payment_status TEXT,
      next_order_status TEXT NOT NULL,
      next_payment_status TEXT,
      memo TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_commerce_orders_created_at
      ON commerce_orders (created_at DESC)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_commerce_orders_order_number_prefix
      ON commerce_orders (order_number text_pattern_ops)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_commerce_payments_order_id
      ON commerce_payments (order_id, created_at DESC)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_commerce_status_logs_order_id
      ON commerce_order_status_logs (order_id, created_at DESC)
  `;
}
