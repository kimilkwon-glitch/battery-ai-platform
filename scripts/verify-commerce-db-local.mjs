/**
 * Commerce Postgres 로컬 검수 — DATABASE_URL 필요 (.env.local)
 * npx tsx scripts/verify-commerce-db-local.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnvLocal() {
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

const url = process.env.DATABASE_URL?.trim() || process.env.DATABASE_POSTGRES_URL?.trim() || "";
console.log("DATABASE_URL_recognized", url.length > 20);
if (url.length > 20) {
  try {
    console.log("db_host", new URL(url).hostname);
  } catch {
    console.log("db_host", "parse_failed");
  }
}

if (!url) {
  console.error("DATABASE_URL missing — add Neon connection string to .env.local");
  process.exit(1);
}

const sql = neon(url);

console.log("migration_start");
const { ensureCommerceSchema } = await import("../src/lib/db/ensure-commerce-schema.ts");
await ensureCommerceSchema();
console.log("migration_ok", true);

const tables = await sql`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'commerce_orders',
      'commerce_payments',
      'commerce_order_status_logs'
    )
  ORDER BY table_name
`;
const names = tables.map((r) => r.table_name);
console.log("tables", names.join(", "));
const required = ["commerce_orders", "commerce_payments", "commerce_order_status_logs"];
const missing = required.filter((t) => !names.includes(t));
if (missing.length) {
  console.error("missing_tables", missing.join(", "));
  process.exit(1);
}

console.log("table_check_ok", true);
