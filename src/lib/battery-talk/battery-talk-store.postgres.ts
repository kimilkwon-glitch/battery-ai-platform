import "server-only";

import { ensureOperationalSchema } from "@/lib/db/ensure-operational-schema";
import { getSql } from "@/lib/db/postgres";
import {
  messageRealtimeEvent,
  publishBatteryTalkRealtime,
  sessionRealtimeEvent,
} from "@/lib/battery-talk/battery-talk-realtime-pg";
import {
  isValidBatteryTalkMessage,
  sanitizeBatteryTalkMessage,
  sanitizeBatteryTalkPhone,
} from "@/lib/battery-talk/battery-talk-sanitize";
import {
  batteryTalkToSummary,
  buildSystemMessages,
  contextMatchesReuse,
  filterBatteryTalkThreadsForAdmin,
  lastNonSystemPreview,
  newBatteryTalkId,
  normalizeOpenContext,
  type BatteryTalkListFilters,
  type BatteryTalkOpenThreadInput,
} from "@/lib/battery-talk/battery-talk-store-shared";
import type {
  BatteryTalkContext,
  BatteryTalkMessage,
  BatteryTalkMessageSender,
  BatteryTalkThread,
  BatteryTalkThreadStatus,
  BatteryTalkThreadSummary,
} from "@/types/battery-talk";

type SessionRow = {
  id: string;
  customer_name: string | null;
  customer_phone: string;
  source_page: string | null;
  product_id: string | null;
  product_name: string | null;
  battery_code: string | null;
  car_name: string | null;
  status: string;
  assigned_admin_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
  admin_memo: string | null;
  unread_by_admin: boolean;
  context_json: BatteryTalkContext | Record<string, unknown>;
  user_id: string | null;
  is_member: boolean;
  legacy_inquiry_id: string | null;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  session_id: string;
  sender_type: string;
  sender_name: string | null;
  message: string;
  created_at: string;
};

function rowToMessage(row: MessageRow): BatteryTalkMessage {
  return {
    id: row.id,
    sender: row.sender_type as BatteryTalkMessageSender,
    body: row.message,
    createdAt: row.created_at,
  };
}

function mergeContext(row: SessionRow): BatteryTalkContext {
  const stored = (row.context_json ?? {}) as BatteryTalkContext;
  return {
    ...stored,
    pageUrl: stored.pageUrl ?? row.source_page ?? undefined,
    productCode: stored.productCode ?? row.product_id ?? undefined,
    productName: stored.productName ?? row.product_name ?? undefined,
    batteryCode: stored.batteryCode ?? row.battery_code ?? undefined,
    vehicleName: stored.vehicleName ?? row.car_name ?? undefined,
  };
}

function rowToThread(row: SessionRow, messages: BatteryTalkMessage[]): BatteryTalkThread {
  return {
    threadId: row.id,
    source: "batterytalk",
    status: row.status as BatteryTalkThreadStatus,
    customerName: row.customer_name?.trim() || "고객",
    phone: row.customer_phone ?? "",
    userId: row.user_id ?? undefined,
    isMember: row.is_member === true,
    messages,
    context: mergeContext(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastMessageAt: row.last_message_at ?? row.updated_at,
    adminMemo: row.admin_memo ?? "",
    assignedTo: row.assigned_admin_id ?? undefined,
    unreadByAdmin: row.unread_by_admin === true,
    legacyInquiryId: row.legacy_inquiry_id ?? undefined,
  };
}

async function loadMessagesForSession(sessionId: string): Promise<BatteryTalkMessage[]> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, session_id, sender_type, sender_name, message, created_at
    FROM battery_talk_messages
    WHERE session_id = ${sessionId}
    ORDER BY created_at ASC
  `) as MessageRow[];
  return rows.map(rowToMessage);
}

async function loadThreadById(sessionId: string): Promise<BatteryTalkThread | null> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT *
    FROM battery_talk_sessions
    WHERE id = ${sessionId}
    LIMIT 1
  `) as SessionRow[];
  const row = rows[0];
  if (!row) return null;
  const messages = await loadMessagesForSession(sessionId);
  return rowToThread(row, messages);
}

async function insertMessages(
  sessionId: string,
  messages: BatteryTalkMessage[],
): Promise<void> {
  if (messages.length === 0) return;
  const sql = getSql();
  for (const msg of messages) {
    await sql`
      INSERT INTO battery_talk_messages (id, session_id, sender_type, message, created_at)
      VALUES (${msg.id}, ${sessionId}, ${msg.sender}, ${msg.body}, ${msg.createdAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function updateSessionFields(
  sessionId: string,
  patch: {
    status?: BatteryTalkThreadStatus;
    adminMemo?: string;
    unreadByAdmin?: boolean;
    lastMessage?: string;
    lastMessageAt?: string;
    customerName?: string;
    phone?: string;
    updatedAt: string;
  },
): Promise<void> {
  const sql = getSql();
  const row = (await sql`
    SELECT * FROM battery_talk_sessions WHERE id = ${sessionId} LIMIT 1
  `) as SessionRow[];
  const prev = row[0];
  if (!prev) return;

  await sql`
    UPDATE battery_talk_sessions
    SET
      status = ${patch.status ?? prev.status},
      admin_memo = ${patch.adminMemo ?? prev.admin_memo ?? ""},
      unread_by_admin = ${patch.unreadByAdmin ?? prev.unread_by_admin},
      last_message = ${patch.lastMessage ?? prev.last_message},
      last_message_at = ${patch.lastMessageAt ?? prev.last_message_at},
      customer_name = ${patch.customerName ?? prev.customer_name},
      customer_phone = ${patch.phone ?? prev.customer_phone},
      updated_at = ${patch.updatedAt}
    WHERE id = ${sessionId}
  `;
}

async function findReusableOpenThread(
  phone: string,
  context?: BatteryTalkContext,
): Promise<BatteryTalkThread | null> {
  const normalized = sanitizeBatteryTalkPhone(phone);
  if (!normalized) return null;
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT *
    FROM battery_talk_sessions
    WHERE customer_phone = ${normalized}
      AND status IN ('waiting', 'active')
    ORDER BY updated_at DESC
    LIMIT 20
  `) as SessionRow[];

  for (const row of rows) {
    const ctx = mergeContext(row);
    if (!contextMatchesReuse(ctx, context)) continue;
    return loadThreadById(row.id);
  }
  return null;
}

export async function batteryTalkOpenThread(
  input: BatteryTalkOpenThreadInput,
): Promise<BatteryTalkThread> {
  await ensureOperationalSchema();
  const sql = getSql();
  const phone = sanitizeBatteryTalkPhone(input.phone ?? "");

  if (phone) {
    const reused = await findReusableOpenThread(phone, input.context);
    if (reused) {
      const summary = batteryTalkToSummary(reused);
      await publishBatteryTalkRealtime(sql, sessionRealtimeEvent(summary));
      return reused;
    }
  }

  const now = new Date().toISOString();
  const context = normalizeOpenContext(input);
  const threadId = newBatteryTalkId("btt");
  const systemMessages = buildSystemMessages(context, now);

  await sql`
    INSERT INTO battery_talk_sessions (
      id, customer_name, customer_phone, source_page, product_id, product_name,
      battery_code, car_name, status, last_message, last_message_at, admin_memo,
      unread_by_admin, context_json, user_id, is_member, created_at, updated_at
    ) VALUES (
      ${threadId},
      ${input.customerName?.trim() || "고객"},
      ${phone},
      ${context.pageUrl ?? null},
      ${context.productCode ?? null},
      ${context.productName ?? null},
      ${context.batteryCode ?? null},
      ${context.vehicleName ?? null},
      ${"waiting"},
      ${lastNonSystemPreview(systemMessages)},
      ${now},
      ${""},
      ${false},
      ${JSON.stringify(context)},
      ${input.userId ?? null},
      ${input.isMember === true},
      ${now},
      ${now}
    )
  `;

  await insertMessages(threadId, systemMessages);
  const thread = (await loadThreadById(threadId))!;
  await publishBatteryTalkRealtime(sql, sessionRealtimeEvent(batteryTalkToSummary(thread)));
  return thread;
}

export async function batteryTalkAddCustomerMessage(
  threadId: string,
  body: string,
  opts?: { phone?: string; customerName?: string },
): Promise<BatteryTalkThread | null> {
  if (!isValidBatteryTalkMessage(body)) return null;
  await ensureOperationalSchema();
  const sql = getSql();
  const prev = await loadThreadById(threadId);
  if (!prev) return null;

  const now = new Date().toISOString();
  const sanitizedBody = sanitizeBatteryTalkMessage(body);
  const message: BatteryTalkMessage = {
    id: newBatteryTalkId("btm"),
    sender: "customer",
    body: sanitizedBody,
    createdAt: now,
  };

  await insertMessages(threadId, [message]);
  const nextStatus: BatteryTalkThreadStatus = prev.status === "done" ? "waiting" : prev.status;
  await updateSessionFields(threadId, {
    status: nextStatus,
    unreadByAdmin: true,
    lastMessage: sanitizedBody.slice(0, 200),
    lastMessageAt: now,
    customerName: opts?.customerName?.trim() || prev.customerName,
    phone: sanitizeBatteryTalkPhone(opts?.phone ?? "") || prev.phone,
    updatedAt: now,
  });

  const thread = (await loadThreadById(threadId))!;
  await publishBatteryTalkRealtime(sql, messageRealtimeEvent(threadId, message));
  await publishBatteryTalkRealtime(sql, sessionRealtimeEvent(batteryTalkToSummary(thread)));
  return thread;
}

export async function batteryTalkGetMessages(
  threadId: string,
): Promise<BatteryTalkMessage[] | null> {
  const thread = await batteryTalkGetByIdPeek(threadId);
  return thread?.messages ?? null;
}

export async function batteryTalkList(
  filters: BatteryTalkListFilters = {},
): Promise<BatteryTalkThreadSummary[]> {
  await ensureOperationalSchema();
  const sql = getSql();
  const status = filters.status?.trim();
  const limit = filters.limit ?? 500;

  let rows: SessionRow[];
  if (status && status !== "all") {
    rows = (await sql`
      SELECT *
      FROM battery_talk_sessions
      WHERE status = ${status}
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `) as SessionRow[];
  } else {
    rows = (await sql`
      SELECT *
      FROM battery_talk_sessions
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `) as SessionRow[];
  }

  let threads = rows.map((row) => rowToThread(row, []));
  threads = filterBatteryTalkThreadsForAdmin(threads);

  const q = filters.q?.trim().toLowerCase();
  if (q) {
    threads = threads.filter((t) => {
      const ctx = t.context;
      const hay = [
        t.customerName,
        t.phone,
        ctx.vehicleName,
        ctx.productName,
        ctx.batteryCode,
        ctx.orderNumber,
        ctx.cartSummary,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  return threads.map(batteryTalkToSummary);
}

export async function batteryTalkGetByIdPeek(threadId: string): Promise<BatteryTalkThread | null> {
  return loadThreadById(threadId);
}

export async function batteryTalkGetById(threadId: string): Promise<BatteryTalkThread | null> {
  const thread = await loadThreadById(threadId);
  if (!thread) return null;

  if (thread.unreadByAdmin) {
    const now = new Date().toISOString();
    const sql = getSql();
    await updateSessionFields(threadId, { unreadByAdmin: false, updatedAt: now });
    const next = (await loadThreadById(threadId))!;
    await publishBatteryTalkRealtime(sql, sessionRealtimeEvent(batteryTalkToSummary(next)));
    return next;
  }
  return thread;
}

export async function batteryTalkAddAdminMessage(
  threadId: string,
  body: string,
): Promise<BatteryTalkThread | null> {
  if (!isValidBatteryTalkMessage(body)) return null;
  await ensureOperationalSchema();
  const sql = getSql();
  const prev = await loadThreadById(threadId);
  if (!prev) return null;

  const now = new Date().toISOString();
  const sanitizedBody = sanitizeBatteryTalkMessage(body);
  const message: BatteryTalkMessage = {
    id: newBatteryTalkId("btm"),
    sender: "admin",
    body: sanitizedBody,
    createdAt: now,
  };

  await insertMessages(threadId, [message]);
  const nextStatus: BatteryTalkThreadStatus = prev.status === "waiting" ? "active" : prev.status;
  await updateSessionFields(threadId, {
    status: nextStatus,
    unreadByAdmin: false,
    lastMessage: sanitizedBody.slice(0, 200),
    lastMessageAt: now,
    updatedAt: now,
  });

  const thread = (await loadThreadById(threadId))!;
  await publishBatteryTalkRealtime(sql, messageRealtimeEvent(threadId, message));
  await publishBatteryTalkRealtime(sql, sessionRealtimeEvent(batteryTalkToSummary(thread)));
  return thread;
}

export async function batteryTalkUpdateStatus(
  threadId: string,
  status: BatteryTalkThreadStatus,
): Promise<BatteryTalkThread | null> {
  await ensureOperationalSchema();
  const sql = getSql();
  const prev = await loadThreadById(threadId);
  if (!prev) return null;

  const now = new Date().toISOString();
  await updateSessionFields(threadId, { status, updatedAt: now });
  const thread = (await loadThreadById(threadId))!;
  await publishBatteryTalkRealtime(sql, sessionRealtimeEvent(batteryTalkToSummary(thread)));
  return thread;
}

export async function batteryTalkUpdateMemo(
  threadId: string,
  adminMemo: string,
): Promise<BatteryTalkThread | null> {
  await ensureOperationalSchema();
  const sql = getSql();
  const prev = await loadThreadById(threadId);
  if (!prev) return null;

  const now = new Date().toISOString();
  await updateSessionFields(threadId, { adminMemo: adminMemo.trim(), updatedAt: now });
  const thread = (await loadThreadById(threadId))!;
  await publishBatteryTalkRealtime(sql, sessionRealtimeEvent(batteryTalkToSummary(thread)));
  return thread;
}

export async function batteryTalkCountByStatus(): Promise<Record<BatteryTalkThreadStatus, number>> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT status, COUNT(*)::int AS count
    FROM battery_talk_sessions
    GROUP BY status
  `) as { status: string; count: number }[];

  const counts: Record<BatteryTalkThreadStatus, number> = {
    waiting: 0,
    active: 0,
    done: 0,
    hold: 0,
  };
  for (const row of rows) {
    if (row.status in counts) {
      counts[row.status as BatteryTalkThreadStatus] = row.count;
    }
  }
  return counts;
}

export async function batteryTalkCountUnread(): Promise<number> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT COUNT(*)::int AS count
    FROM battery_talk_sessions
    WHERE unread_by_admin = TRUE
  `) as { count: number }[];
  return rows[0]?.count ?? 0;
}

export async function batteryTalkCountByPhone(phone: string): Promise<number> {
  await ensureOperationalSchema();
  const sql = getSql();
  const normalized = phone.trim();
  const rows = (await sql`
    SELECT COUNT(*)::int AS count
    FROM battery_talk_sessions
    WHERE customer_phone = ${normalized}
  `) as { count: number }[];
  return rows[0]?.count ?? 0;
}
