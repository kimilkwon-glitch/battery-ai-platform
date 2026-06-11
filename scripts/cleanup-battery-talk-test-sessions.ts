/**
 * 배터리톡 운영 테스트 세션 안전 정리 (기본 dry-run)
 *
 * npx tsx scripts/cleanup-battery-talk-test-sessions.ts --dry-run
 * npx tsx scripts/cleanup-battery-talk-test-sessions.ts --apply
 * npx tsx scripts/cleanup-battery-talk-test-sessions.ts --dry-run --include-operator-test
 * npx tsx scripts/cleanup-battery-talk-test-sessions.ts --dry-run --session=btt_a --session=btt_b
 *
 * 옵션:
 *   --from=YYYY-MM-DD     KST 날짜 시작 (기본: E2E=2026-06-11, operator-test=2026-06-01)
 *   --to=YYYY-MM-DD       KST 날짜 끝 (기본: 오늘 KST)
 *   --session=ID          명시 sessionId (여러 번 지정 가능, 쉼표 구분도 가능)
 *   --include-operator-test  김일권/UX2검수/무의미문구/시스템-only shell 포함
 */
import { existsSync, readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { isUx2AdminReviewRecord } from "../src/lib/admin/ux2-admin-review-marker";
import {
  countCustomerBatteryTalkMessages,
  isSystemOnlyBatteryTalkThread,
} from "../src/lib/battery-talk/battery-talk-store-shared";
import type { BatteryTalkContext, BatteryTalkMessage, BatteryTalkThread } from "../src/types/battery-talk";

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
const dryRun = !apply;
const includeOperatorTest = args.includes("--include-operator-test");

function parseExplicitSessionIds(argv: string[]): string[] {
  const ids: string[] = [];
  for (const a of argv) {
    if (!a.startsWith("--session=")) continue;
    const raw = a.slice("--session=".length).trim();
    for (const part of raw.split(",")) {
      const id = part.trim();
      if (id) ids.push(id);
    }
  }
  return [...new Set(ids)];
}

const explicitIds = parseExplicitSessionIds(args);

function argDate(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = args.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function todayKstDate(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

const fromKst = argDate("from") ?? (includeOperatorTest ? "2026-06-01" : "2026-06-11");
const toKst = argDate("to") ?? todayKstDate();

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
const OPERATOR_NAME = "김일권";

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

function isOperatorTestMessage(body: string): boolean {
  const text = body.trim();
  if (!text) return false;
  if (isExplicitTestCustomerMessage(text)) return true;
  if (/^(DJSKS|안녕하세요|ㅇㅇ)$/i.test(text)) return true;
  if (/UX2\s*검수/i.test(text)) return true;
  if (/^님아님아$/.test(text)) return true;
  if (/^[ㄱ-ㅎㅏ-ㅣ]+$/.test(text) && text.length <= 8) return true;
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

type SessionEval = {
  sessionId: string;
  action: "delete" | "skip";
  customerName: string;
  visitorId: string | null;
  userId: string | null;
  phone: string;
  status: string;
  createdAt: string;
  messageCount: number;
  customerMessageCount: number;
  lastMessagePreview: string;
  customerMessages: string[];
  hasOrderLink: boolean;
  hasRealPhone: boolean;
  isUx2BatteryTalk: boolean;
  reasons: string[];
  skipReason?: string;
};

function rowToThread(row: SessionRow, messages: MessageRow[]): BatteryTalkThread {
  const mapped: BatteryTalkMessage[] = messages.map((m, i) => ({
    id: m.id || `m${i}`,
    sender: m.sender_type as BatteryTalkMessage["sender"],
    body: m.message,
    createdAt: m.created_at,
  }));
  const ctx = (row.context_json ?? {}) as BatteryTalkContext;
  return {
    threadId: row.id,
    source: "batterytalk",
    status: row.status as BatteryTalkThread["status"],
    customerName: row.customer_name?.trim() || "고객",
    phone: row.customer_phone ?? "",
    userId: row.user_id ?? undefined,
    isMember: Boolean(row.user_id),
    messages: mapped,
    context: ctx,
    createdAt: row.created_at,
    updatedAt: row.created_at,
    lastMessageAt: row.created_at,
    unreadByAdmin: false,
  };
}

function evaluateSession(
  row: SessionRow,
  messages: MessageRow[],
  opts: {
    explicitId: boolean;
    includeOperatorTest: boolean;
    inDateWindow: boolean;
  },
): SessionEval {
  const ctx = (row.context_json ?? {}) as BatteryTalkContext;
  const visitorId = ctx.visitorId?.trim() || null;
  const customerMessages = messages
    .filter((m) => m.sender_type === "customer" && m.message.trim())
    .map((m) => m.message.trim());
  const nonSystemBodies = messages
    .filter((m) => m.sender_type !== "system" && m.message.trim())
    .map((m) => m.message.trim());

  const orderLink = hasRealOrderLink(ctx);
  const realPhone = hasRealPhone(row.customer_phone);
  const customerName = row.customer_name?.trim() || "고객";
  const isKimIlkwon = customerName === OPERATOR_NAME;

  const ux2BatteryTalk = isUx2AdminReviewRecord({
    name: row.customer_name,
    phone: row.customer_phone,
    adminMemo: row.admin_memo,
    message: [...customerMessages, row.last_message ?? ""].join(" "),
  });

  const thread = rowToThread(row, messages);
  const customerMessageCount = countCustomerBatteryTalkMessages(thread.messages);
  const systemOnlyShell = isSystemOnlyBatteryTalkThread(thread, customerMessageCount);

  const testCustomerMessages = customerMessages.filter(isExplicitTestCustomerMessage);
  const operatorMessages = nonSystemBodies.filter(isOperatorTestMessage);
  const operatorMessageInPreview =
    row.last_message?.trim() && isOperatorTestMessage(row.last_message)
      ? [row.last_message.trim()]
      : [];

  const base: SessionEval = {
    sessionId: row.id,
    action: "skip",
    customerName,
    visitorId,
    userId: row.user_id,
    phone: row.customer_phone ?? "",
    status: row.status,
    createdAt: row.created_at,
    messageCount: messages.length,
    customerMessageCount,
    lastMessagePreview: (row.last_message ?? customerMessages.at(-1) ?? "").slice(0, 120),
    customerMessages,
    hasOrderLink: orderLink,
    hasRealPhone: realPhone,
    isUx2BatteryTalk: ux2BatteryTalk,
    reasons: [],
  };

  if (orderLink) {
    return { ...base, skipReason: "real_order_link_protected" };
  }
  if (realPhone) {
    return { ...base, skipReason: "real_phone_protected" };
  }

  if (opts.explicitId) {
    base.reasons.push("explicit_session_id");
    base.action = "delete";
    return base;
  }

  const deleteReasons: string[] = [];

  if (opts.includeOperatorTest && isKimIlkwon) {
    deleteReasons.push("operator_name_kim_ilkwon");
  }
  if (opts.includeOperatorTest && ux2BatteryTalk) {
    deleteReasons.push("ux2_battery_talk_review");
  }
  if (opts.includeOperatorTest && systemOnlyShell) {
    deleteReasons.push("system_only_shell");
  }
  if (testCustomerMessages.length > 0) {
    deleteReasons.push(`audit_test_messages:${testCustomerMessages.length}`);
  }
  if (opts.includeOperatorTest && operatorMessages.length > 0) {
    deleteReasons.push(`operator_test_messages:${operatorMessages.length}`);
  }
  if (
    opts.includeOperatorTest &&
    operatorMessageInPreview.length > 0 &&
    operatorMessages.length === 0 &&
    customerMessages.length === 0
  ) {
    deleteReasons.push("operator_test_last_message_preview");
  }

  if (deleteReasons.length === 0) {
    if (!opts.inDateWindow && !opts.includeOperatorTest) {
      return { ...base, skipReason: "outside_date_window" };
    }
    return { ...base, skipReason: "no_test_pattern_match" };
  }

  if (!opts.inDateWindow && !opts.includeOperatorTest) {
    return { ...base, skipReason: "outside_date_window" };
  }

  base.reasons = deleteReasons;
  base.action = "delete";
  return base;
}

async function loadSessionById(sql: ReturnType<typeof neon>, id: string): Promise<SessionRow | null> {
  const found = (await sql`
    SELECT id, customer_name, customer_phone, admin_memo, context_json, user_id,
           created_at, last_message, status
    FROM battery_talk_sessions WHERE id = ${id} LIMIT 1
  `) as SessionRow[];
  return found[0] ?? null;
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

  const sessionMap = new Map<string, SessionRow>();

  const ranged = (await sql`
    SELECT id, customer_name, customer_phone, admin_memo, context_json, user_id,
           created_at, last_message, status
    FROM battery_talk_sessions
    WHERE created_at >= ${windowStart.toISOString()}::timestamptz
      AND created_at <= ${windowEnd.toISOString()}::timestamptz
    ORDER BY created_at ASC
  `) as SessionRow[];

  for (const row of ranged) sessionMap.set(row.id, row);

  if (includeOperatorTest) {
    const operatorNamed = (await sql`
      SELECT id, customer_name, customer_phone, admin_memo, context_json, user_id,
             created_at, last_message, status
      FROM battery_talk_sessions
      WHERE customer_name = ${OPERATOR_NAME}
      ORDER BY created_at ASC
    `) as SessionRow[];
    for (const row of operatorNamed) sessionMap.set(row.id, row);
  }

  for (const id of explicitIds) {
    if (sessionMap.has(id)) continue;
    const row = await loadSessionById(sql, id);
    if (row) sessionMap.set(row.id, row);
  }

  const allRows = [...sessionMap.values()].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const evaluations: SessionEval[] = [];

  for (const row of allRows) {
    const messages = (await sql`
      SELECT id, sender_type, message, created_at
      FROM battery_talk_messages
      WHERE session_id = ${row.id}
      ORDER BY created_at ASC
    `) as MessageRow[];

    const createdAt = new Date(row.created_at);
    const inDateWindow = createdAt >= windowStart && createdAt <= windowEnd;
    const explicitId = explicitIds.includes(row.id);

    if (!explicitId && !inDateWindow && !includeOperatorTest) continue;
    if (!explicitId && !includeOperatorTest && !inDateWindow) continue;

    evaluations.push(
      evaluateSession(row, messages, {
        explicitId,
        includeOperatorTest,
        inDateWindow,
      }),
    );
  }

  const toDelete = evaluations.filter((e) => e.action === "delete");
  const skipped = evaluations.filter((e) => e.action === "skip");
  const sessionIds = toDelete.map((e) => e.sessionId);

  let messageCount = 0;
  if (sessionIds.length) {
    const counted = (await sql`
      SELECT COUNT(*)::int AS c FROM battery_talk_messages WHERE session_id = ANY(${sessionIds})
    `) as { c: number }[];
    messageCount = counted[0]?.c ?? 0;
  }

  const kimDeleted = toDelete.filter((e) => e.customerName === OPERATOR_NAME);
  const kimSkipped = skipped.filter((e) => e.customerName === OPERATOR_NAME);

  const report = {
    mode: dryRun ? "dry-run" : "apply",
    flags: {
      includeOperatorTest,
      explicitSessionIds: explicitIds,
    },
    windowKst: { from: fromKst, to: toKst },
    scannedSessions: evaluations.length,
    deleteCandidateCount: toDelete.length,
    skippedCount: skipped.length,
    messagesToDelete: messageCount,
    kimIlkwon: {
      deleteCandidates: kimDeleted.length,
      skipped: kimSkipped.length,
    },
    candidatesToDelete: toDelete.map((e) => ({
      sessionId: e.sessionId,
      customerName: e.customerName,
      visitorId: e.visitorId,
      userId: e.userId,
      phone: e.phone || "(empty)",
      status: e.status,
      createdAt: e.createdAt,
      messageCount: e.messageCount,
      customerMessageCount: e.customerMessageCount,
      lastMessagePreview: e.lastMessagePreview,
      customerMessages: e.customerMessages,
      hasOrderLink: e.hasOrderLink,
      hasRealPhone: e.hasRealPhone,
      isUx2BatteryTalk: e.isUx2BatteryTalk,
      reasons: e.reasons,
      action: e.action,
    })),
    skipped: skipped.map((e) => ({
      sessionId: e.sessionId,
      customerName: e.customerName,
      visitorId: e.visitorId,
      userId: e.userId,
      phone: e.phone || "(empty)",
      lastMessagePreview: e.lastMessagePreview,
      hasOrderLink: e.hasOrderLink,
      hasRealPhone: e.hasRealPhone,
      skipReason: e.skipReason,
      action: e.action,
    })),
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
  console.log("Deleted messages:", messageCount);
  console.log(
    "Kim Ilkwon sessions deleted:",
    kimDeleted.map((e) => e.sessionId).join(", ") || "(none)",
  );
  console.log("Battery talk test session cleanup complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
