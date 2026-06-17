#!/usr/bin/env node
/**
 * Production migration 부분 적용 상태 — SELECT-only
 * Usage: node scripts/migration-partial-state.mjs
 */
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(".env.local");

const url = process.env.DATABASE_URL?.trim();
const out = {
  checkedAt: new Date().toISOString(),
  connected: false,
  meta: {},
  objects: {},
  indexes: {},
  applyLog: null,
  errors: [],
};

function loadApplyLog() {
  const p = join(process.cwd(), "audit/migration-apply-result.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

async function main() {
  out.applyLog = loadApplyLog();

  if (!url || url.length < 30) {
    out.errors.push("DATABASE_URL not available in this shell — run locally with session URL");
    writeReport();
    console.log("partial-state: DATABASE_URL missing (audit file only)");
    if (out.applyLog) {
      console.log(`apply log errors: ${JSON.stringify(out.applyLog.errors ?? [])}`);
      console.log(`failedStatement: ${JSON.stringify(out.applyLog.failedStatement ?? null)}`);
    }
    process.exit(2);
  }

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();
  out.connected = true;

  try {
    const meta = await client.query(
      "SELECT current_user, current_database(), current_setting('transaction_read_only') AS ro",
    );
    out.meta = {
      current_user: meta.rows[0]?.current_user,
      database: meta.rows[0]?.current_database,
      transaction_read_only: meta.rows[0]?.ro,
    };

    const tables = [
      "rate_limit_buckets",
      "commerce_orders",
      "commerce_payments",
      "members",
    ];
    for (const table of tables) {
      const r = await client.query(
        `SELECT EXISTS (
           SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'public' AND table_name = $1
         ) AS exists`,
        [table],
      );
      out.objects[table] = { exists: r.rows[0]?.exists === true };
    }

    const indexNames = [
      "idx_rate_limit_buckets_expires_at",
      "rate_limit_buckets_pkey",
      "idx_commerce_orders_checkout_attempt_lookup",
      "idx_commerce_orders_checkout_attempt_active",
      "idx_commerce_payments_payment_key_lookup",
      "idx_commerce_payments_payment_key_unique",
      "idx_commerce_payments_one_completed_per_order",
      "idx_members_phone_digits",
    ];
    for (const name of indexNames) {
      const r = await client.query(
        `SELECT indexname, indexdef FROM pg_indexes
         WHERE schemaname = 'public' AND indexname = $1`,
        [name],
      );
      out.indexes[name] = r.rows[0]
        ? { exists: true, defPreview: String(r.rows[0].indexdef).slice(0, 120) }
        : { exists: false };
    }

    if (out.objects.rate_limit_buckets?.exists) {
      const pk = await client.query(
        `SELECT conname FROM pg_constraint
         WHERE conrelid = 'rate_limit_buckets'::regclass AND contype = 'p'`,
      );
      out.objects.rate_limit_buckets.primaryKey = pk.rows.map((r) => r.conname);
    }
  } finally {
    client.release();
    await pool.end();
  }

  writeReport();
  console.log("partial-state summary:");
  console.log(`  rate_limit_buckets table: ${out.objects.rate_limit_buckets?.exists ?? "unknown"}`);
  console.log(
    `  idx_rate_limit_buckets_expires_at: ${out.indexes.idx_rate_limit_buckets_expires_at?.exists ?? "unknown"}`,
  );
  console.log(`  apply errors: ${JSON.stringify(out.applyLog?.errors ?? [])}`);
  console.log(`  failedStatement: ${out.applyLog?.failedStatement ? "present" : "none"}`);
  process.exit(0);
}

function writeReport() {
  writeFileSync(join(process.cwd(), "audit/migration-partial-state.json"), JSON.stringify(out, null, 2));
}

main().catch((e) => {
  out.errors.push(e instanceof Error ? e.message : String(e));
  writeReport();
  console.error("partial-state failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
