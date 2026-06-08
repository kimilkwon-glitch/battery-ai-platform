/**
 * commerce DB 스키마 적용
 * npm run db:migrate:commerce
 * 로컬: .env.local 의 DATABASE_URL 자동 로드
 */
import { existsSync, readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnvLocal(): void {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvLocal();

async function runMigration(sql: ReturnType<typeof neon>): Promise<void> {
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
      items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      price_lines_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
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

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  console.log("DATABASE_URL recognized:", url.length > 20);

  const sql = neon(url);
  await runMigration(sql);
  console.log("Commerce DB migration complete.");
}

main().catch((e: unknown) => {
  const err = e as { message?: string; code?: string };
  console.error("Migration failed:", err.code ?? "error", err.message ?? String(e));
  process.exit(1);
});
