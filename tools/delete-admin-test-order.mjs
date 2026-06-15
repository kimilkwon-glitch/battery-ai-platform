#!/usr/bin/env node
/**
 * 관리자 UX 검수용 테스트 주문 삭제 — dry-run 기본
 * Usage:
 *   npx tsx tools/delete-admin-test-order.mjs
 *   npx tsx tools/delete-admin-test-order.mjs --apply
 */
import { existsSync, readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import "../scripts/register-server-only.mjs";
import { isAdminUxReviewTestOrder } from "../src/lib/admin/admin-ux-review-test-order.ts";

const apply = process.argv.includes("--apply");

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

async function main() {
  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) {
    console.error("[delete-admin-test-order] DATABASE_URL missing");
    process.exit(1);
  }

  const pgOrder = await import("../src/lib/payment/commerce-order-store.postgres.ts");
  const items = await pgOrder.pgStoreCommerceOrderListItems(1000);
  const targets = items.filter((o) => isAdminUxReviewTestOrder(o));

  console.log(`delete-admin-test-order: ${apply ? "APPLY" : "DRY-RUN"}`);
  console.log(`후보 ${targets.length}건\n`);

  if (targets.length === 0) {
    console.log("삭제 대상 없음.");
    return;
  }

  const sql = neon(dbUrl);

  for (const order of targets) {
    if (!isAdminUxReviewTestOrder(order)) {
      console.error(`중단: marker 검증 실패 ${order.orderNumber}`);
      process.exit(1);
    }
    const claims =
      (await sql`SELECT id FROM commerce_claims WHERE order_id = ${order.orderId}`) ?? [];
    console.log(`- ${order.orderNumber} (${order.orderId}) claims=${claims.length}`);
  }

  if (!apply) {
    console.log("\n--apply 없음 · DB 변경 없음");
    return;
  }

  const orderIds = targets.map((o) => o.orderId);
  const claimRows =
    orderIds.length > 0
      ? await sql`SELECT id FROM commerce_claims WHERE order_id = ANY(${orderIds})`
      : [];
  const claimIds = claimRows.map((r) => r.id);

  if (claimIds.length > 0) {
    await sql`DELETE FROM commerce_claim_histories WHERE claim_id = ANY(${claimIds})`;
    await sql`DELETE FROM commerce_claims WHERE id = ANY(${claimIds})`;
  }
  await sql`DELETE FROM commerce_order_admin_meta WHERE order_id = ANY(${orderIds})`;
  await sql`DELETE FROM commerce_orders WHERE id = ANY(${orderIds})`;

  console.log(`\n삭제 완료 ${targets.length}건`);
}

main().catch((err) => {
  console.error("[delete-admin-test-order] failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
