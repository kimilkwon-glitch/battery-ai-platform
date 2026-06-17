#!/usr/bin/env node
/**
 * Production migration 사전검사 — SELECT only, secret 미출력
 * Usage: node scripts/migration-precheck.mjs [--json-out path]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

function loadEnvFile(path) {
  try {
    const raw = readFileSync(join(process.cwd(), path), "utf8");
    for (const line of raw.split("\n")) {
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
  } catch {
    /* optional */
  }
}

loadEnvFile(".env.local");
loadEnvFile(".vercel-env-pull.tmp");
loadEnvFile(".vercel-env-audit.tmp");
loadEnvFile(".vercel-env-owner.tmp");

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("ABORT: DATABASE_URL not configured");
  process.exit(2);
}

function safeDbMeta(connectionUrl) {
  try {
    const u = new URL(connectionUrl);
    const db = u.pathname.replace(/^\//, "") || "(default)";
    const role = decodeURIComponent(u.username || "(unknown)");
    const host = u.hostname || "";
    let provider = "unknown";
    if (host.includes("neon")) provider = "neon";
    else if (host.includes("supabase")) provider = "supabase";
    else if (host.includes("localhost") || host.includes("127.0.0.1")) provider = "local";
    const isProdRole = /neondb_owner|owner|admin/i.test(role);
    const isProdDb = /neondb|prod/i.test(db);
    return { db, role, provider, isProdRole, isProdDb, hostKind: host ? "configured" : "missing" };
  } catch {
    return { db: "parse_error", role: "parse_error", provider: "unknown", isProdRole: false, isProdDb: false, hostKind: "parse_error" };
  }
}

const meta = safeDbMeta(url);
const sql = neon(url);

const report = {
  meta,
  abortReasons: [],
  checks: {},
  rowCountsBefore: {},
  indexDefinitions: {},
};

function abort(reason) {
  report.abortReasons.push(reason);
}

async function q(label, query, ...params) {
  try {
    const rows = await sql(query, params);
    report.checks[label] = rows;
    return rows;
  } catch (e) {
    report.checks[label] = { error: e instanceof Error ? e.message : String(e) };
    return null;
  }
}

async function main() {
  const ro = await q("transaction_read_only", "SHOW transaction_read_only");
  const roVal = ro?.[0]?.transaction_read_only ?? ro?.[0]?.Transaction_read_only;
  if (roVal === "on") abort("transaction_read_only=on");

  if (meta.provider !== "neon") abort(`provider is ${meta.provider}, expected neon for Production`);
  if (!meta.isProdDb) abort(`database name '${meta.db}' does not look like Production neondb`);
  if (!meta.isProdRole) abort(`role '${meta.role}' is not a write owner role`);

  // Existing indexes on target names
  const targetIndexes = [
    "idx_commerce_payments_payment_key_unique",
    "idx_commerce_payments_payment_key_lookup",
    "idx_commerce_orders_checkout_attempt_active",
    "idx_commerce_orders_checkout_attempt_lookup",
    "idx_commerce_payments_one_completed_per_order",
    "idx_members_phone_digits",
    "rate_limit_buckets_pkey",
    "idx_rate_limit_buckets_expires_at",
  ];
  const idxRows = await q(
    "existing_indexes",
    `SELECT indexname, indexdef FROM pg_indexes
     WHERE schemaname = 'public'
       AND indexname = ANY($1::text[])`,
    targetIndexes,
  );
  report.indexDefinitions = Object.fromEntries(
    (idxRows ?? []).map((r) => [r.indexname, r.indexdef]),
  );

  // payment_key checks
  await q("payment_key_non_null", `SELECT COUNT(*)::int AS cnt FROM commerce_payments WHERE payment_key IS NOT NULL`);
  await q("payment_key_blank", `SELECT COUNT(*)::int AS cnt FROM commerce_payments WHERE payment_key IS NOT NULL AND trim(payment_key) = ''`);
  await q(
    "payment_key_duplicates",
    `SELECT COUNT(*)::int AS dup_groups FROM (
       SELECT payment_key FROM commerce_payments
       WHERE payment_key IS NOT NULL AND trim(payment_key) <> ''
       GROUP BY payment_key HAVING COUNT(*) > 1
     ) d`,
  );
  await q(
    "payment_key_cross_order_dup",
    `SELECT COUNT(*)::int AS cnt FROM (
       SELECT payment_key FROM commerce_payments
       WHERE payment_key IS NOT NULL AND trim(payment_key) <> ''
       GROUP BY payment_key HAVING COUNT(DISTINCT order_id) > 1
     ) d`,
  );

  // checkout_attempt_id
  await q("checkout_attempt_non_null", `SELECT COUNT(*)::int AS cnt FROM commerce_orders WHERE checkout_attempt_id IS NOT NULL`);
  await q(
    "checkout_attempt_active_dup",
    `SELECT COUNT(*)::int AS dup_groups FROM (
       SELECT checkout_attempt_id FROM commerce_orders
       WHERE checkout_attempt_id IS NOT NULL
         AND payment_status IN ('not_started','preparing','pending','processing','failed','canceled','reconcile_needed')
       GROUP BY checkout_attempt_id HAVING COUNT(*) > 1
     ) d`,
  );

  // completed payment per order
  await q(
    "completed_payment_dup",
    `SELECT COUNT(*)::int AS dup_groups FROM (
       SELECT order_id FROM commerce_payments WHERE status = 'completed'
       GROUP BY order_id HAVING COUNT(*) > 1
     ) d`,
  );
  await q(
    "orphan_completed_payment",
    `SELECT COUNT(*)::int AS cnt FROM commerce_payments cp
     WHERE cp.status = 'completed'
       AND NOT EXISTS (SELECT 1 FROM commerce_orders co WHERE co.id = cp.order_id)`,
  );

  // phone digits
  await q(
    "phone_blank_normalized",
    `SELECT COUNT(*)::int AS cnt FROM members
     WHERE phone IS NULL OR trim(phone) = '' OR regexp_replace(phone, '[^0-9]', '', 'g') = ''`,
  );
  await q(
    "phone_digits_dup_groups",
    `SELECT COUNT(*)::int AS dup_groups FROM (
       SELECT regexp_replace(phone, '[^0-9]', '', 'g') AS digits FROM members
       WHERE phone IS NOT NULL AND phone <> '' AND phone <> '미입력'
       GROUP BY digits HAVING COUNT(*) > 1
     ) d`,
  );

  // rate limit table conflict
  await q(
    "rate_limit_table_exists",
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'rate_limit_buckets'
     ) AS exists`,
  );

  // row counts for content integrity baseline
  const countTables = [
    ["members", "members"],
    ["commerce_orders", "commerce_orders"],
    ["commerce_payments", "commerce_payments"],
    ["support_faq_items", "faq"],
    ["guide_posts", "guide_posts"],
    ["promotions", "promotions"],
    ["customer_inquiries", "customer_inquiries"],
    ["battery_talk_sessions", "battery_talk_sessions"],
    ["battery_talk_messages", "battery_talk_messages"],
    ["customer_reviews", "customer_reviews"],
  ];
  for (const [table, key] of countTables) {
    const rows = await q(`count_${key}`, `SELECT COUNT(*)::int AS cnt FROM ${table}`);
    report.rowCountsBefore[key] = rows?.[0]?.cnt ?? null;
  }

  // Evaluate abort conditions from checks
  const dupPk = report.checks.payment_key_duplicates?.[0]?.dup_groups ?? 0;
  const crossPk = report.checks.payment_key_cross_order_dup?.[0]?.cnt ?? 0;
  const blankPk = report.checks.payment_key_blank?.[0]?.cnt ?? 0;
  if (dupPk > 0) abort(`payment_key duplicate groups: ${dupPk}`);
  if (crossPk > 0) abort(`payment_key cross-order duplicates: ${crossPk}`);
  if (blankPk > 0) abort(`payment_key blank strings need UPDATE (${blankPk}) — data UPDATE forbidden`);

  const caDup = report.checks.checkout_attempt_active_dup?.[0]?.dup_groups ?? 0;
  if (caDup > 0) abort(`checkout_attempt_id active duplicates: ${caDup}`);

  const cpDup = report.checks.completed_payment_dup?.[0]?.dup_groups ?? 0;
  if (cpDup > 0) abort(`completed payment per order duplicates: ${cpDup}`);

  const phoneDup = report.checks.phone_digits_dup_groups?.[0]?.dup_groups ?? 0;
  report.phoneUniqueBlocked = phoneDup > 0;
  if (phoneDup > 0) report.phoneUniqueReason = `phone digit duplicate groups: ${phoneDup}`;

  // Expected content counts
  const expected = {
    faq: 35,
    guide_posts: 8,
    promotions: 3,
    customer_inquiries: 1,
    battery_talk_sessions: 3,
    battery_talk_messages: 13,
    customer_reviews: 0,
  };
  for (const [k, exp] of Object.entries(expected)) {
    const actual = report.rowCountsBefore[k];
    if (actual != null && actual !== exp) {
      report.contentCountMismatch = report.contentCountMismatch ?? [];
      report.contentCountMismatch.push({ table: k, expected: exp, actual });
    }
  }

  report.safeToApplyCommerce = report.abortReasons.length === 0;
  report.safeToApplyPhoneUnique = report.safeToApplyCommerce && !report.phoneUniqueBlocked;
  report.safeToApplyRateLimit = report.abortReasons.length === 0;

  const outPath = process.argv.includes("--json-out")
    ? process.argv[process.argv.indexOf("--json-out") + 1]
    : join(process.cwd(), "audit/migration-precheck-result.json");

  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log("=== Migration Pre-check ===");
  console.log(`branch: (see git)`);
  console.log(`provider: ${meta.provider}, database: ${meta.db}, role: ${meta.role}`);
  console.log(`transaction_read_only: ${roVal ?? "unknown"}`);
  console.log(`abort_reasons: ${report.abortReasons.length ? report.abortReasons.join("; ") : "none"}`);
  console.log(`phone_unique_blocked: ${report.phoneUniqueBlocked ? "yes" : "no"}`);
  console.log(`row_counts: ${JSON.stringify(report.rowCountsBefore)}`);
  console.log(`content_mismatch: ${JSON.stringify(report.contentCountMismatch ?? [])}`);
  console.log(`safe_commerce: ${report.safeToApplyCommerce}`);
  console.log(`safe_phone: ${report.safeToApplyPhoneUnique}`);
  console.log(`result_file: ${outPath.replace(process.cwd(), ".")}`);

  process.exit(report.abortReasons.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("precheck failed:", e instanceof Error ? e.message : e);
  process.exit(2);
});
