#!/usr/bin/env node
/**
 * migration SQL 파서 정적 검증 — Production DB 불필요
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  extractIndexTargetTable,
  orderMigrationStatements,
  parseMigrationFile,
  splitMigrationStatements,
  stripSqlLineComments,
} from "../scripts/migration-sql-parse.mjs";

let passed = 0;
let failed = 0;

function ok(label) {
  passed += 1;
  console.log(`  ✓ ${label}`);
}

function fail(label, detail) {
  failed += 1;
  console.error(`  ✗ ${label}${detail ? `: ${detail}` : ""}`);
}

function assert(cond, label, detail) {
  if (cond) ok(label);
  else fail(label, detail);
}

console.log("verify:migration-sql-parse\n");

const rateLimitSql = readFileSync(
  join(process.cwd(), "scripts/migrations/rate-limit-buckets.sql"),
  "utf8",
);
const stmts = parseMigrationFile(rateLimitSql);

assert(stmts.length === 2, "rate-limit-buckets yields 2 statements", `got ${stmts.length}`);
assert(
  stmts[0].toUpperCase().startsWith("CREATE TABLE"),
  "first statement is CREATE TABLE",
  stmts[0]?.slice(0, 40),
);
assert(
  stmts[1].toUpperCase().includes("CREATE INDEX") &&
    stmts[1].includes("idx_rate_limit_buckets_expires_at"),
  "second statement is expires_at index",
);

const checkoutSql = readFileSync(
  join(process.cwd(), "scripts/migrations/commerce-checkout-attempt-id.sql"),
  "utf8",
);
const checkoutStmts = parseMigrationFile(checkoutSql);
assert(
  checkoutStmts.some((s) => s.toUpperCase().startsWith("ALTER TABLE")),
  "checkout migration includes ALTER TABLE",
);
assert(
  checkoutStmts.some((s) => s.includes("idx_commerce_orders_checkout_attempt_lookup")),
  "checkout migration includes lookup index",
);
assert(
  !checkoutStmts.some((s) => s.toUpperCase().includes("CONCURRENTLY")),
  "CONCURRENTLY in comments not executed from file",
);

const naiveSplit = rateLimitSql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s && !s.startsWith("--") && !s.includes("==="));
const naiveCreateTable = naiveSplit.some((s) => s.toUpperCase().startsWith("CREATE TABLE"));
assert(!naiveCreateTable, "old naive split drops CREATE TABLE (bug reproduced)");

const stripped = stripSqlLineComments(rateLimitSql);
assert(stripped.includes("CREATE TABLE IF NOT EXISTS rate_limit_buckets"), "comments stripped, DDL kept");

assert(
  stmts[0].toUpperCase().startsWith("CREATE TABLE") &&
    stmts[1].toUpperCase().includes("CREATE INDEX"),
  "orderMigrationStatements: TABLE before INDEX",
);

const shuffled = orderMigrationStatements([
  "CREATE INDEX IF NOT EXISTS idx_x ON t (a)",
  "CREATE TABLE IF NOT EXISTS t (a TEXT PRIMARY KEY)",
]);
assert(
  shuffled[0].toUpperCase().startsWith("CREATE TABLE"),
  "orderMigrationStatements sorts TABLE first",
);

assert(
  extractIndexTargetTable("CREATE INDEX idx ON rate_limit_buckets (expires_at)") ===
    "rate_limit_buckets",
  "extractIndexTargetTable",
);

const indexOnlyFile = `-- comment
CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_expires_at
  ON rate_limit_buckets (expires_at);
`;
const indexOnlyParsed = parseMigrationFile(indexOnlyFile);
assert(
  indexOnlyParsed.length === 1 && indexOnlyParsed[0].includes("CREATE INDEX"),
  "index-only file parses single INDEX (apply must guard table exists)",
);

assert(
  parseMigrationFile(rateLimitSql).length === 2,
  "idempotent re-parse same as first",
);

const partialSim = `-- header comment
CREATE TABLE IF NOT EXISTS rate_limit_buckets (id TEXT PRIMARY KEY);
`;
const partialParsed = parseMigrationFile(partialSim);
assert(
  partialParsed.length === 1 && partialParsed[0].includes("CREATE TABLE"),
  "partial file parse order",
);

const withDo = `
DO $$ BEGIN
  NULL;
END $$;
CREATE TABLE IF NOT EXISTS t (id INT);
`;
const doStmts = splitMigrationStatements(withDo);
assert(doStmts.length >= 2, "DO block preserved as statement chunk", String(doStmts.length));

console.log(`\nverify:migration-sql-parse ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
