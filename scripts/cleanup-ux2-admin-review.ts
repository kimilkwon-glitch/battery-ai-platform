/**
 * UX2 운영검수 데이터 삭제 (운영 실데이터 보호, AND 조건)
 * npm run ux2:cleanup -- --dry-run
 * npm run ux2:cleanup
 */
import { existsSync, readFileSync, readdirSync, unlinkSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import {
  UX2_ADMIN_MEMO,
  UX2_NAME_PREFIX,
  UX2_ORDER_TYPE,
  isUx2AdminReviewOrderNumber,
  isUx2AdminReviewPhone,
  isUx2AdminReviewRecord,
} from "../src/lib/admin/ux2-admin-review-marker";

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

const dryRun = process.argv.includes("--dry-run");

function isUx2OrderRow(row: {
  customer_name: string | null;
  customer_phone: string | null;
  order_number: string | null;
  request_memo: string | null;
  customer_email: string | null;
}): boolean {
  return isUx2AdminReviewRecord({
    name: row.customer_name,
    phone: row.customer_phone,
    requestMemo: row.request_memo,
    orderNumber: row.order_number,
    email: row.customer_email,
  });
}

function isUx2InquiryRow(row: {
  name: string;
  contact: string;
  admin_memo: string | null;
  message: string;
}): boolean {
  return isUx2AdminReviewRecord({
    name: row.name,
    contact: row.contact,
    adminMemo: row.admin_memo,
    message: row.message,
  });
}

function isUx2BatteryTalkRow(row: {
  customer_name: string | null;
  customer_phone: string;
  admin_memo: string | null;
}): boolean {
  return isUx2AdminReviewRecord({
    name: row.customer_name,
    phone: row.customer_phone,
    adminMemo: row.admin_memo,
  });
}

function isUx2ClaimRow(row: {
  customer_phone: string;
  customer_name: string;
  admin_memo: string | null;
  order_number: string;
  reason_text: string | null;
}): boolean {
  return isUx2AdminReviewRecord({
    name: row.customer_name,
    phone: row.customer_phone,
    adminMemo: row.admin_memo,
    orderNumber: row.order_number,
    memo: row.reason_text,
  });
}

function collectUx2ReportFiles(): string[] {
  const targets: string[] = [];
  const reportMd = "reports/ux2-persona-admin-review.md";
  const reportJson = "reports/ux2-persona-admin-review.json";
  if (existsSync(reportMd)) targets.push(reportMd);
  if (existsSync(reportJson)) targets.push(reportJson);
  const shotDir = "reports/ux2-screenshots";
  if (existsSync(shotDir)) {
    for (const f of readdirSync(shotDir)) {
      targets.push(join(shotDir, f));
    }
  }
  return targets;
}

/** 레거시 UX1 (BM-UX-, 010-9000) 잔존 데이터 — UX2 cleanup 시 함께 제거 */
function isLegacyUx1OrderRow(row: {
  customer_phone: string | null;
  order_number: string | null;
  request_memo: string | null;
  customer_name: string | null;
}): boolean {
  const phone = (row.customer_phone ?? "").replace(/\D/g, "");
  if (!phone.startsWith("010900000") || phone.length !== 11) return false;
  const hay = [row.customer_name, row.request_memo, row.order_number].filter(Boolean).join(" ");
  return (
    hay.includes("[UX테스트-30명]") ||
    hay.includes("order_type:ux_test") ||
    (row.order_number ?? "").startsWith("BM-UX-")
  );
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }
  const sql = neon(url);

  const orders = (await sql`
    SELECT id, customer_name, customer_phone, order_number, request_memo, customer_email
    FROM commerce_orders
  `) as Array<{
    id: string;
    customer_name: string | null;
    customer_phone: string | null;
    order_number: string | null;
    request_memo: string | null;
    customer_email: string | null;
  }>;

  const ux2Orders = orders.filter(isUx2OrderRow);
  const legacyUx1Orders = orders.filter((o) => !isUx2OrderRow(o) && isLegacyUx1OrderRow(o));
  const allOrderDeletes = [...ux2Orders, ...legacyUx1Orders];

  const inquiries = (await sql`SELECT id, name, contact, admin_memo, message FROM customer_inquiries`) as Array<{
    id: string;
    name: string;
    contact: string;
    admin_memo: string | null;
    message: string;
  }>;
  const ux2Inquiries = inquiries.filter(isUx2InquiryRow);

  const sessions = (await sql`SELECT id, customer_name, customer_phone, admin_memo FROM battery_talk_sessions`) as Array<{
    id: string;
    customer_name: string | null;
    customer_phone: string;
    admin_memo: string | null;
  }>;
  const ux2Sessions = sessions.filter(isUx2BatteryTalkRow);

  const claims = (await sql`
    SELECT id, customer_phone, customer_name, admin_memo, order_number, reason_text FROM commerce_claims
  `) as Array<{
    id: string;
    customer_phone: string;
    customer_name: string;
    admin_memo: string | null;
    order_number: string;
    reason_text: string | null;
  }>;
  const ux2Claims = claims.filter(isUx2ClaimRow);

  const orderIds = allOrderDeletes.map((o) => o.id);
  let ux2Messages = 0;
  if (ux2Sessions.length) {
    const msgRows = (await sql`
      SELECT COUNT(*)::int AS c FROM battery_talk_messages
      WHERE session_id = ANY(${ux2Sessions.map((s) => s.id)})
    `) as { c: number }[];
    ux2Messages = msgRows[0]?.c ?? 0;
  }

  const reportFiles = collectUx2ReportFiles();
  let screenshotCount = 0;
  for (const f of reportFiles) {
    if (f.includes("ux2-screenshots") && existsSync(f) && statSync(f).isFile()) screenshotCount += 1;
  }

  const report = {
    dryRun,
    orders: allOrderDeletes.length,
    ux2Orders: ux2Orders.length,
    legacyUx1Orders: legacyUx1Orders.length,
    orderNumbers: allOrderDeletes.map((o) => o.order_number),
    inquiries: ux2Inquiries.length,
    batteryTalkSessions: ux2Sessions.length,
    batteryTalkMessages: ux2Messages,
    claims: ux2Claims.length,
    screenshots: screenshotCount,
    reports: reportFiles.filter((f) => !f.includes("ux2-screenshots")).length,
  };

  console.log(JSON.stringify(report, null, 2));

  const suspiciousOrders = orders.filter(
    (o) =>
      !isUx2OrderRow(o) &&
      !isLegacyUx1OrderRow(o) &&
      (isUx2AdminReviewPhone(o.customer_phone) || isUx2AdminReviewOrderNumber(o.order_number)),
  );
  const suspiciousInquiries = inquiries.filter(
    (i) => !isUx2InquiryRow(i) && isUx2AdminReviewPhone(i.contact),
  );

  if (suspiciousOrders.length > 0 || suspiciousInquiries.length > 0) {
    console.error(
      "ABORT: 010-9100-xxxx 또는 BM-UX2- 대역이지만 UX2 마커가 불완전한 레코드가 있습니다. 수동 확인 필요.",
    );
    process.exit(2);
  }

  if (dryRun) {
    console.log("(dry-run — 삭제하지 않음)");
    process.exit(0);
  }

  if (ux2Claims.length) {
    const claimIds = ux2Claims.map((c) => c.id);
    await sql`DELETE FROM commerce_claim_histories WHERE claim_id = ANY(${claimIds})`;
    await sql`DELETE FROM commerce_claims WHERE id = ANY(${claimIds})`;
  }

  if (orderIds.length) {
    await sql`DELETE FROM commerce_order_admin_meta WHERE order_id = ANY(${orderIds})`;
    await sql`DELETE FROM commerce_orders WHERE id = ANY(${orderIds})`;
  }

  if (ux2Inquiries.length) {
    await sql`DELETE FROM customer_inquiries WHERE id = ANY(${ux2Inquiries.map((i) => i.id)})`;
  }

  if (ux2Sessions.length) {
    const sessionIds = ux2Sessions.map((s) => s.id);
    await sql`DELETE FROM battery_talk_messages WHERE session_id = ANY(${sessionIds})`;
    await sql`DELETE FROM battery_talk_sessions WHERE id = ANY(${sessionIds})`;
  }

  for (const f of reportFiles) {
    if (!existsSync(f)) continue;
    if (statSync(f).isDirectory()) rmSync(f, { recursive: true, force: true });
    else unlinkSync(f);
  }
  const shotDir = "reports/ux2-screenshots";
  if (existsSync(shotDir)) rmSync(shotDir, { recursive: true, force: true });

  console.log("UX2 admin review cleanup complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
