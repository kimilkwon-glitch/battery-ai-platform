/**
 * 배터리톡 운영 테스트 세션 안전 정리 (기본 dry-run)
 *
 * npx tsx scripts/cleanup-battery-talk-test-sessions.ts --dry-run
 * npx tsx scripts/cleanup-battery-talk-test-sessions.ts --apply
 *
 * 옵션:
 *   --from=2026-06-11   KST 날짜 시작 (포함)
 *   --to=2026-06-11     KST 날짜 끝 (포함)
 *   --session=id1,id2   명시 sessionId만 (추가 검증 후)
 */
import { existsSync, readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { isUx2AdminReviewRecord } from "../src/lib/admin/ux2-admin-review-marker";
import type { BatteryTalkContext } from "../src/types/battery-talk";

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

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const dryRun = !apply || args.includes("--dry-run");
const explicitIds = args
  .find((a) => a.startsWith("--session="))
  ?.slice("--session=".length)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function argDate(name: string, fallback: string): string {
  const prefix = `--${name}=`;
  return args.find((a) => a.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

const fromKst = argDate("from", "2026-06-11");
const toKst = argDate("to", "2026-06-11");

/** KST 자정 → UTC */
function kstDayStartUtc(isoDate: string): string {
  return `${isoDate}T00:00:00+09:00`;
}

function kstDayEndUtc(isoDate: string): string {
  return `${isoDate}T23:59:59.999+09:00`;
}

const TEST_PHONE_DIGITS = new Set([
  "",
  "01055551234",
  "01099990001",
  "01099999999",
  "01000000000",
  "01012345678",
]);

const REAL_ORDER_RE = /^BM-(?!UX2|LOCAL)/i;

/** 고객 메시지가 명백한 운영 테스트/감사 문구인지 */
function isExplicitTestCustomerMessage(body: string): boolean {
  const text = body.trim();
  if (!text) return false;
  if (/^undefined/i.test(text)) return true;
  if (/^DJSKS$/i.test(text)) return true;
  if (/^E2E(고객|관리자|고객2)_\d+/.test(text)) return true;
  if (/^MOBILE_\d+/.test(text)) return true;
  if (/\d{13}/.test(text)) return true;
  if (/^CMF80L 규격 문의(\s+\d{13})?$/.test(text)) return true;
  if (/^DIN80L 배송 문의(\s+\d{13})?$/.test(text)) return true;
  if (/^AGM70L 문의드립니다(\s+\d{13})?$/.test(text)) return true;
  if (/^확인 후 안내드리겠습니다\.?(\s+\d{13})?$/.test(text)) return true;
  if (/^장착 가능 문의(\s+\d{13})?$/.test(text)) return true;
  return false;
}

function normalizePhone(phone: string | null | undefined): string {
  return (phone ?? "").replace(/\D/g, "");
}

function hasRealOrderLink(ctx: BatteryTalkContext): boolean {
  const orderNumber = (ctx.orderNumber ?? "").trim();
  const orderId = (ctx.orderId ?? "").trim();
  if (orderId && !/^test/i.test(orderId)) return true;
  if (orderNumber && REAL_ORDER_RE.test(orderNumber)) return true;
  return false;
}

function hasRealPhone(phone: string | null | undefined): boolean {
  const digits = normalizePhone(phone);
  if (!digits) return false;
  if (TEST_PHONE_DIGITS.has(digits)) return false;
  return digits.length >= 10;
}

type SessionRow = {
  id: string;
  customer_name: string | null;
  customer_phone: string;
  admin_memo: string | null;
  context_json: BatteryTalkContext | Record<string, unknown>;
  user_id: string | null;
  created_at: string;
  last_message: string | null;
  status: string;
};

type MessageRow = {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
};

type Candidate = {
  sessionId: string;
  customerName: string;
  phone: string;
  status: string;
  createdAt: string;
  lastMessagePreview: string;
  customerMessages: string[];
  reasons: string[];
  hasOrderLink: boolean;
  hasRealPhone: boolean;
  isUx2: boolean;
};

function evaluateSession(
  row: SessionRow,
  messages: MessageRow[],
  windowStart: Date,
  windowEnd: Date,
): { candidate: Candidate | null; excludedReason?: string } {
  const ctx = (row.context_json ?? {}) as BatteryTalkContext;
  const createdAt = new Date(row.created_at);
  const customerMessages = messages
    .filter((m) => m.sender_type === "customer" && m.message.trim())
    .map((m) => m.message.trim());

  const ux2 = isUx2AdminReviewRecord({
    name: row.customer_name,
    phone: row.customer_phone,
    adminMemo: row.admin_memo,
    message: customerMessages.join(" "),
  });
  const orderLink = hasRealOrderLink(ctx);
  const realPhone = hasRealPhone(row.customer_phone);

  const base: Candidate = {
    sessionId: row.id,
    customerName: row.customer_name?.trim() || "고객",
    phone: row.customer_phone ?? "",
    status: row.status,
    createdAt: row.created_at,
    lastMessagePreview: (row.last_message ?? customerMessages.at(-1) ?? "").slice(0, 120),
    customerMessages,
    reasons: [],
    hasOrderLink: orderLink,
    hasRealPhone: realPhone,
    isUx2: ux2,
  };

  if (ux2) {
    return { candidate: null, excludedReason: "ux2_protected" };
  }
  if (orderLink) {
    return { candidate: null, excludedReason: "real_order_link" };
  }
  if (realPhone) {
    return { candidate: null, excludedReason: "real_phone" };
  }

  const inWindow = createdAt >= windowStart && createdAt <= windowEnd;
  const explicitId = explicitIds?.includes(row.id);

  if (!explicitId && !inWindow) {
    return { candidate: null, excludedReason: "outside_date_window" };
  }

  const testMessages = customerMessages.filter(isExplicitTestCustomerMessage);
  const kimIlkwonNoise =
    row.customer_name?.trim() === "김일권" &&
    customerMessages.some((m) => /^(DJSKS|안녕하세요)$/i.test(m.trim())) &&
    !realPhone;

  if (testMessages.length > 0) {
    base.reasons.push(`test_customer_messages:${testMessages.length}`);
  }
  if (kimIlkwonNoise) {
    base.reasons.push("kim_ilkwon_manual_test");
  }
  if (explicitId) {
    base.reasons.push("explicit_session_id");
  }

  if (testMessages.length === 0 && !kimIlkwonNoise && !explicitId) {
    return { candidate: null, excludedReason: "no_test_message_pattern" };
  }

  if (customerMessages.length > 0 && testMessages.length === 0 && !kimIlkwonNoise) {
    return { candidate: null, excludedReason: "customer_messages_not_test_marked" };
  }

  return { candidate: base };
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("DATABASE_URL is not configured");
    process.exit(1);
  }

  const windowStart = new Date(kstDayStartUtc(fromKst));
  const windowEnd = new Date(kstDayEndUtc(toKst));
  const sql = neon(url);

  const sessionRows = (await sql`
    SELECT id, customer_name, customer_phone, admin_memo, context_json, user_id,
           created_at, last_message, status
    FROM battery_talk_sessions
    WHERE created_at >= ${windowStart.toISOString()}::timestamptz
      AND created_at <= ${windowEnd.toISOString()}::timestamptz
    ORDER BY created_at ASC
  `) as SessionRow[];

  const extraRows: SessionRow[] = [];
  if (explicitIds?.length) {
    for (const id of explicitIds) {
      if (sessionRows.some((r) => r.id === id)) continue;
      const found = (await sql`
        SELECT id, customer_name, customer_phone, admin_memo, context_json, user_id,
               created_at, last_message, status
        FROM battery_talk_sessions WHERE id = ${id} LIMIT 1
      `) as SessionRow[];
      if (found[0]) extraRows.push(found[0]);
    }
  }

  const allRows = [...sessionRows, ...extraRows];
  const candidates: Candidate[] = [];
  const excluded: Array<{ sessionId: string; reason: string; preview: string }> = [];

  for (const row of allRows) {
    const messages = (await sql`
      SELECT id, sender_type, message, created_at
      FROM battery_talk_messages
      WHERE session_id = ${row.id}
      ORDER BY created_at ASC
    `) as MessageRow[];

    const { candidate, excludedReason } = evaluateSession(row, messages, windowStart, windowEnd);
    if (candidate) {
      candidates.push(candidate);
    } else if (excludedReason && excludedReason !== "outside_date_window") {
      excluded.push({
        sessionId: row.id,
        reason: excludedReason,
        preview: (row.last_message ?? "").slice(0, 80),
      });
    }
  }

  const sessionIds = candidates.map((c) => c.sessionId);
  let messageCount = 0;
  if (sessionIds.length) {
    const counted = (await sql`
      SELECT COUNT(*)::int AS c FROM battery_talk_messages WHERE session_id = ANY(${sessionIds})
    `) as { c: number }[];
    messageCount = counted[0]?.c ?? 0;
  }

  const report = {
    mode: dryRun ? "dry-run" : "apply",
    windowKst: { from: fromKst, to: toKst },
    scannedSessions: allRows.length,
    deleteCandidates: candidates.length,
    messagesToDelete: messageCount,
    candidates: candidates.map((c) => ({
      sessionId: c.sessionId,
      customerName: c.customerName,
      phone: c.phone || "(empty)",
      status: c.status,
      createdAt: c.createdAt,
      lastMessagePreview: c.lastMessagePreview,
      customerMessages: c.customerMessages,
      reasons: c.reasons,
    })),
    excludedFromDelete: excluded,
  };

  console.log(JSON.stringify(report, null, 2));

  if (dryRun) {
    console.log("\n(dry-run — 삭제하지 않음. --apply 로 실제 삭제)");
    return;
  }

  if (sessionIds.length === 0) {
    console.log("\n삭제할 후보 없음.");
    return;
  }

  await sql`DELETE FROM battery_talk_messages WHERE session_id = ANY(${sessionIds})`;
  await sql`DELETE FROM battery_talk_sessions WHERE id = ANY(${sessionIds})`;

  console.log("\nDeleted sessions:", sessionIds.join(", "));
  console.log("Battery talk test session cleanup complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
