#!/usr/bin/env node
/**
 * Production migration 적용 — neondb write role, DATA UPDATE/DELETE 금지
 * Usage: node scripts/apply-production-migrations.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import {
  extractIndexName,
  extractIndexTargetTable,
  extractTableNameFromCreateTable,
  normalizeIndexDef,
  parseMigrationFile,
} from "./migration-sql-parse.mjs";

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

const dryRun = process.argv.includes("--dry-run");
const url = process.env.DATABASE_URL?.trim();
const report = {
  appliedAt: new Date().toISOString(),
  dryRun,
  applied: [],
  skipped: [],
  deferred: [],
  errors: [],
  failedStatement: null,
  rowCountsAfter: {},
};

function safeMeta(connectionUrl) {
  try {
    const u = new URL(connectionUrl);
    return {
      database: u.pathname.replace(/^\//, ""),
      role: decodeURIComponent(u.username || ""),
      provider: u.hostname.includes("neon") ? "neon" : "other",
    };
  } catch {
    return null;
  }
}

async function indexExists(client, indexName) {
  const r = await client.query(
    `SELECT indexdef FROM pg_indexes WHERE schemaname = 'public' AND indexname = $1`,
    [indexName],
  );
  return r.rows[0]?.indexdef ?? null;
}

async function tableExists(client, tableName) {
  const r = await client.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    [tableName],
  );
  return r.rows.length > 0;
}

async function executeDdl(client, stepId, statement) {
  const upper = statement.toUpperCase().trim();
  if (upper.startsWith("CREATE INDEX") || upper.startsWith("CREATE UNIQUE INDEX")) {
    const targetTable = extractIndexTargetTable(statement);
    if (targetTable && !(await tableExists(client, targetTable))) {
      throw new Error(
        `Cannot create index before table "${targetTable}" exists (step=${stepId}). ` +
          "Likely SQL parse order bug — CREATE TABLE must run first.",
      );
    }
  }

  const createTableName = extractTableNameFromCreateTable(statement);
  if (createTableName && (await tableExists(client, createTableName))) {
    report.skipped.push({
      step: stepId,
      name: createTableName,
      reason: "table already exists",
    });
    return;
  }

  const indexName = extractIndexName(statement);
  if (indexName) {
    const existingDef = await indexExists(client, indexName);
    if (existingDef) {
      const expected = statement.replace(/\s+/g, " ").trim();
      const normalizedExisting = normalizeIndexDef(existingDef);
      const normalizedExpected = normalizeIndexDef(
        expected.replace(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?\S+\s+/i, "CREATE INDEX "),
      );
      if (
        !normalizedExisting.includes(
          normalizeIndexDef(expected.split(/\s+ON\s+/i)[1] ?? ""),
        )
      ) {
        throw new Error(`Index ${indexName} exists with different definition`);
      }
      report.skipped.push({ step: stepId, name: indexName, reason: "already exists (same)" });
      return;
    }
  }

  if (dryRun) {
    report.skipped.push({ step: stepId, reason: "dry-run", preview: statement.slice(0, 80) });
    return;
  }

  await client.query(statement);
  report.applied.push({ step: stepId, stmt: statement.slice(0, 120) });
}

async function runMigrationFile(client, file, stepId) {
  const sqlText = readFileSync(join(process.cwd(), "scripts/migrations", file), "utf8");
  const statements = parseMigrationFile(sqlText);
  if (statements.length === 0) {
    throw new Error(`No executable statements parsed from ${file}`);
  }
  for (const statement of statements) {
    try {
      await executeDdl(client, stepId, statement);
    } catch (err) {
      report.failedStatement = {
        step: stepId,
        file,
        preview: statement.slice(0, 160),
        error: err instanceof Error ? err.message : String(err),
      };
      throw err;
    }
  }
}

async function main() {
  if (!url || url.length < 30) {
    report.errors.push("DATABASE_URL not configured or empty — Production migration aborted");
    writeReport();
    console.error("ABORT: DATABASE_URL unavailable");
    process.exit(2);
  }

  const meta = safeMeta(url);
  if (!meta || meta.provider !== "neon" || !/neondb/i.test(meta.database)) {
    report.errors.push("Not Production neondb — migration aborted");
    writeReport();
    process.exit(2);
  }
  if (!/owner/i.test(meta.role)) {
    report.errors.push("Write role required, got role pattern mismatch");
    writeReport();
    process.exit(2);
  }

  console.log(`apply-production-migrations ${dryRun ? "(dry-run)" : ""}`);
  console.log(`target: provider=${meta.provider} database=${meta.database} role=${meta.role}`);

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();

  try {
    const ro = await client.query("SHOW transaction_read_only");
    if (ro.rows[0]?.transaction_read_only === "on") {
      throw new Error("transaction_read_only=on");
    }

    await client.query("SET lock_timeout = '5s'");
    await client.query("SET statement_timeout = '120s'");

    const precheckPath = join(process.cwd(), "audit/migration-precheck-result.json");
    let precheck = null;
    if (existsSync(precheckPath)) {
      precheck = JSON.parse(readFileSync(precheckPath, "utf8"));
    }

    const fileSteps = [
      { file: "rate-limit-buckets.sql", id: "rate_limit_buckets" },
      { file: "commerce-checkout-attempt-id.sql", id: "checkout_attempt" },
      { file: "commerce-payment-key-unique.sql", id: "payment_key_lookup" },
    ];

    for (const step of fileSteps) {
      await runMigrationFile(client, step.file, step.id);
    }

    const concurrentIndexes = [
      {
        name: "idx_commerce_payments_payment_key_unique",
        sql: `CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_commerce_payments_payment_key_unique
          ON commerce_payments (payment_key) WHERE payment_key IS NOT NULL`,
      },
      {
        name: "idx_commerce_orders_checkout_attempt_active",
        sql: `CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_commerce_orders_checkout_attempt_active
          ON commerce_orders (checkout_attempt_id)
          WHERE checkout_attempt_id IS NOT NULL
            AND payment_status IN ('not_started','preparing','pending','processing','failed','canceled','reconcile_needed')`,
      },
      {
        name: "idx_commerce_payments_one_completed_per_order",
        sql: `CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_commerce_payments_one_completed_per_order
          ON commerce_payments (order_id) WHERE status = 'completed'`,
      },
    ];

    if (precheck && precheck.safeToApplyCommerce === false) {
      for (const idx of concurrentIndexes) {
        report.deferred.push({ name: idx.name, reason: "precheck not safe" });
      }
    } else {
      for (const idx of concurrentIndexes) {
        const existingDef = await indexExists(client, idx.name);
        if (existingDef) {
          report.skipped.push({ name: idx.name, reason: "already exists" });
          continue;
        }
        if (dryRun) {
          report.skipped.push({ name: idx.name, reason: "dry-run" });
          continue;
        }
        try {
          await client.query(idx.sql);
          report.applied.push({ step: idx.name, stmt: "CONCURRENTLY UNIQUE" });
        } catch (err) {
          report.failedStatement = {
            step: idx.name,
            file: "(concurrent-index)",
            preview: idx.sql.slice(0, 160),
            error: err instanceof Error ? err.message : String(err),
          };
          throw err;
        }
      }
    }

    if (precheck?.safeToApplyPhoneUnique !== false) {
      await runMigrationFile(client, "members-phone-digits-unique.sql", "members_phone_digits");
    } else {
      report.deferred.push({
        name: "idx_members_phone_digits",
        reason: precheck?.phoneUniqueReason ?? "precheck phone unique blocked",
      });
    }

    const countTables = [
      "members",
      "commerce_orders",
      "commerce_payments",
      "support_faq_items",
      "guide_posts",
      "promotions",
      "customer_inquiries",
      "battery_talk_sessions",
      "battery_talk_messages",
      "customer_reviews",
      "rate_limit_buckets",
    ];
    for (const table of countTables) {
      try {
        const r = await client.query(`SELECT COUNT(*)::int AS cnt FROM ${table}`);
        report.rowCountsAfter[table] = r.rows[0]?.cnt ?? null;
      } catch {
        report.rowCountsAfter[table] = null;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }

  writeReport();
  console.log(
    `applied: ${report.applied.length}, skipped: ${report.skipped.length}, deferred: ${report.deferred.length}, errors: ${report.errors.length}`,
  );
  process.exit(report.errors.length ? 1 : 0);
}

function writeReport() {
  const out = join(process.cwd(), "audit/migration-apply-result.json");
  writeFileSync(out, JSON.stringify(report, null, 2));
}

main().catch((e) => {
  report.errors.push(e instanceof Error ? e.message : String(e));
  writeReport();
  console.error("apply failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
