/**
 * 배터리톡 — 개발 전용 JSON fallback (.data/battery-talk-threads.json)
 * production에서는 사용 금지 — battery-talk-store-config.ts 참고
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { inferBatteryTalkPageType } from "@/lib/battery-talk/battery-talk-context";
import {
  emitBatteryTalkMessage,
  emitBatteryTalkSessionUpdate,
} from "@/lib/battery-talk/battery-talk-realtime-hub";
import {
  isValidBatteryTalkMessage,
  sanitizeBatteryTalkMessage,
  sanitizeBatteryTalkPhone,
} from "@/lib/battery-talk/battery-talk-sanitize";
import {
  batteryTalkToSummary,
  buildSystemMessages,
  contextMatchesReuse,
  filterBatteryTalkSummariesForAdmin,
  filterBatteryTalkThreadsForAdmin,
  shouldExcludeBatteryTalkThreadFromVisitorHistory,
  newBatteryTalkId,
  normalizeOpenContext,
  shouldExcludeBatteryTalkThreadFromAdmin,
  countCustomerBatteryTalkMessages,
  type BatteryTalkListFilters,
  type BatteryTalkOpenThreadInput,
} from "@/lib/battery-talk/battery-talk-store-shared";
import { inquiryList } from "@/lib/inquiry/inquiry-store";
import type { CustomerInquiryRecord, InquiryStatus } from "@/types/customer-inquiry";
import type {
  BatteryTalkContext,
  BatteryTalkMessage,
  BatteryTalkThread,
  BatteryTalkThreadStatus,
  BatteryTalkThreadSummary,
} from "@/types/battery-talk";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "battery-talk-threads.json");

type StorePayload = {
  version: 1;
  threads: BatteryTalkThread[];
};

const globalCache = globalThis as typeof globalThis & {
  __bmBatteryTalkStore?: BatteryTalkThread[];
  __bmBatteryTalkMigrated?: boolean;
};

function emptyPayload(): StorePayload {
  return { version: 1, threads: [] };
}

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readPayloadFromDisk(): Promise<StorePayload> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as StorePayload;
    if (parsed?.version === 1 && Array.isArray(parsed.threads)) {
      return parsed;
    }
  } catch {
    /* first run */
  }
  const payload = emptyPayload();
  await writePayloadToDisk(payload);
  return payload;
}

async function writePayloadToDisk(payload: StorePayload): Promise<void> {
  await ensureDataDir();
  await writeFile(STORE_FILE, JSON.stringify(payload, null, 2), "utf8");
}

async function loadThreads(): Promise<BatteryTalkThread[]> {
  if (globalCache.__bmBatteryTalkStore) return globalCache.__bmBatteryTalkStore;
  const payload = await readPayloadFromDisk();
  const pruned = payload.threads.filter((t) => !shouldExcludeBatteryTalkThreadFromAdmin(t));
  if (pruned.length !== payload.threads.length) {
    globalCache.__bmBatteryTalkStore = pruned;
    await writePayloadToDisk({ version: 1, threads: pruned });
    return pruned;
  }
  globalCache.__bmBatteryTalkStore = payload.threads;
  return payload.threads;
}

async function saveThreads(threads: BatteryTalkThread[]): Promise<void> {
  globalCache.__bmBatteryTalkStore = threads;
  await writePayloadToDisk({ version: 1, threads });
}

function mapInquiryStatusToThread(status: InquiryStatus): BatteryTalkThreadStatus {
  if (status === "in_progress") return "active";
  if (status === "done") return "done";
  if (status === "on_hold") return "hold";
  return "waiting";
}

function threadFromLegacyInquiry(row: CustomerInquiryRecord): BatteryTalkThread {
  const pageType = inferBatteryTalkPageType(row.pageUrl);
  const customerMessage: BatteryTalkMessage = {
    id: newBatteryTalkId("btm"),
    sender: "customer",
    body: row.message,
    createdAt: row.createdAt,
  };
  return {
    threadId: newBatteryTalkId("btt"),
    source: "batterytalk",
    status: mapInquiryStatusToThread(row.status),
    customerName: row.name,
    phone: row.contact,
    isMember: false,
    messages: [customerMessage],
    context: {
      pageUrl: row.pageUrl,
      pageType,
      topic: row.inquiryType,
      productCode: row.productCode,
      batteryCode: row.batteryCode,
      productName: row.productName,
      vehicleName: row.vehicle,
      region: row.region,
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lastMessageAt: row.updatedAt,
    adminMemo: row.adminMemo,
    unreadByAdmin: row.status === "new",
    legacyInquiryId: row.id,
  };
}

async function ensureLegacyMigration(): Promise<void> {
  if (globalCache.__bmBatteryTalkMigrated) return;
  const threads = await loadThreads();
  const legacyIds = new Set(threads.map((t) => t.legacyInquiryId).filter(Boolean));
  const legacyRows = await inquiryList({ source: "batterytalk", limit: 1000 });
  const toAdd = legacyRows
    .filter((r) => !legacyIds.has(r.id))
    .map(threadFromLegacyInquiry);
  if (toAdd.length > 0) {
    const merged = [...toAdd, ...threads].sort((a, b) =>
      b.lastMessageAt.localeCompare(a.lastMessageAt),
    );
    await saveThreads(merged);
  }
  globalCache.__bmBatteryTalkMigrated = true;
}

async function findThreadById(threadId: string): Promise<BatteryTalkThread | null> {
  const threads = await loadThreads();
  return threads.find((t) => t.threadId === threadId) ?? null;
}

async function findReusableOpenThread(
  phone: string,
  context?: BatteryTalkContext,
): Promise<BatteryTalkThread | null> {
  const normalized = sanitizeBatteryTalkPhone(phone);
  if (!normalized) return null;
  const threads = await loadThreads();
  return (
    threads.find(
      (t) =>
        t.phone === normalized &&
        (t.status === "waiting" || t.status === "active") &&
        contextMatchesReuse(t.context, context),
    ) ?? null
  );
}

export async function batteryTalkOpenThread(
  input: BatteryTalkOpenThreadInput,
): Promise<BatteryTalkThread> {
  await ensureLegacyMigration();
  const phone = sanitizeBatteryTalkPhone(input.phone ?? "");
  if (phone) {
    const reused = await findReusableOpenThread(phone, input.context);
    if (reused) {
      emitBatteryTalkSessionUpdate(batteryTalkToSummary(reused));
      return reused;
    }
  }

  const now = new Date().toISOString();
  const context = normalizeOpenContext(input);
  const thread: BatteryTalkThread = {
    threadId: newBatteryTalkId("btt"),
    source: "batterytalk",
    status: "waiting",
    customerName: input.customerName?.trim() || "고객",
    phone,
    userId: input.userId,
    isMember: input.isMember === true,
    messages: buildSystemMessages(context, now),
    context,
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
    adminMemo: "",
    unreadByAdmin: false,
  };

  const threads = await loadThreads();
  threads.unshift(thread);
  await saveThreads(threads);

  emitBatteryTalkSessionUpdate(batteryTalkToSummary(thread));
  return thread;
}

export async function batteryTalkAddCustomerMessage(
  threadId: string,
  body: string,
  opts?: { phone?: string; customerName?: string; visitorId?: string },
): Promise<BatteryTalkThread | null> {
  if (!isValidBatteryTalkMessage(body)) return null;
  const sanitizedBody = sanitizeBatteryTalkMessage(body);
  const threads = await loadThreads();
  const idx = threads.findIndex((t) => t.threadId === threadId);
  const prev = idx >= 0 ? threads[idx]! : null;
  if (!prev) return null;
  const now = new Date().toISOString();
  const message: BatteryTalkMessage = {
    id: newBatteryTalkId("btm"),
    sender: "customer",
    body: sanitizedBody,
    createdAt: now,
  };
  const next: BatteryTalkThread = {
    ...prev,
    customerName: opts?.customerName?.trim() || prev.customerName,
    phone: sanitizeBatteryTalkPhone(opts?.phone ?? "") || prev.phone,
    context: {
      ...prev.context,
      visitorId: opts?.visitorId?.trim() || prev.context.visitorId,
    },
    messages: [...prev.messages, message],
    status: prev.status === "done" ? "waiting" : prev.status,
    updatedAt: now,
    lastMessageAt: now,
    unreadByAdmin: true,
  };
  threads[idx] = next;
  await saveThreads(threads);
  emitBatteryTalkMessage(threadId, message);
  emitBatteryTalkSessionUpdate(batteryTalkToSummary(next));
  return next;
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
  await ensureLegacyMigration();
  let threads = await loadThreads();
  const visitorId = filters.visitorId?.trim();
  if (visitorId) {
    threads = threads.filter((t) => t.context.visitorId === visitorId);
  }
  if (!filters.includeTestData) {
    const metaByThreadId = Object.fromEntries(
      threads.map((t) => [
        t.threadId,
        { customerMessageCount: countCustomerBatteryTalkMessages(t.messages) },
      ]),
    );
    threads = filterBatteryTalkThreadsForAdmin(threads, metaByThreadId);
  }

  const status = filters.status?.trim();
  if (status && status !== "all") {
    threads = threads.filter((t) => t.status === status);
  }
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    threads = threads.filter((t) => {
      const hay = [
        t.customerName,
        t.phone,
        t.context.vehicleName,
        t.context.productName,
        t.context.batteryCode,
        t.context.orderNumber,
        t.context.cartSummary,
        ...t.messages.map((m) => m.body),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  const limit = filters.limit ?? 500;
  let summaries = threads.slice(0, limit).map(batteryTalkToSummary);
  if (!filters.includeTestData) {
    summaries = filterBatteryTalkSummariesForAdmin(summaries);
  }
  return summaries;
}

export async function batteryTalkGetByIdPeek(threadId: string): Promise<BatteryTalkThread | null> {
  await ensureLegacyMigration();
  return findThreadById(threadId);
}

export async function batteryTalkGetById(threadId: string): Promise<BatteryTalkThread | null> {
  await ensureLegacyMigration();
  const thread = await findThreadById(threadId);
  if (thread?.unreadByAdmin) {
    const threads = await loadThreads();
    const idx = threads.findIndex((t) => t.threadId === threadId);
    if (idx >= 0) {
      const next = { ...thread, unreadByAdmin: false, updatedAt: new Date().toISOString() };
      threads[idx] = next;
      await saveThreads(threads);
      emitBatteryTalkSessionUpdate(batteryTalkToSummary(next));
      return next;
    }
  }
  return thread;
}

export async function batteryTalkAddAdminMessage(
  threadId: string,
  body: string,
): Promise<BatteryTalkThread | null> {
  if (!isValidBatteryTalkMessage(body)) return null;
  const sanitizedBody = sanitizeBatteryTalkMessage(body);
  const threads = await loadThreads();
  const idx = threads.findIndex((t) => t.threadId === threadId);
  if (idx < 0) return null;
  const now = new Date().toISOString();
  const prev = threads[idx]!;
  const message: BatteryTalkMessage = {
    id: newBatteryTalkId("btm"),
    sender: "admin",
    body: sanitizedBody,
    createdAt: now,
  };
  const next: BatteryTalkThread = {
    ...prev,
    messages: [...prev.messages, message],
    status: prev.status === "waiting" ? "active" : prev.status,
    updatedAt: now,
    lastMessageAt: now,
    unreadByAdmin: false,
  };
  threads[idx] = next;
  await saveThreads(threads);
  emitBatteryTalkMessage(threadId, message);
  emitBatteryTalkSessionUpdate(batteryTalkToSummary(next));
  return next;
}

export async function batteryTalkUpdateStatus(
  threadId: string,
  status: BatteryTalkThreadStatus,
): Promise<BatteryTalkThread | null> {
  const threads = await loadThreads();
  const idx = threads.findIndex((t) => t.threadId === threadId);
  if (idx < 0) return null;
  const prev = threads[idx]!;
  const next: BatteryTalkThread = {
    ...prev,
    status,
    updatedAt: new Date().toISOString(),
  };
  threads[idx] = next;
  await saveThreads(threads);
  emitBatteryTalkSessionUpdate(batteryTalkToSummary(next));
  return next;
}

export async function batteryTalkUpdateMemo(
  threadId: string,
  adminMemo: string,
): Promise<BatteryTalkThread | null> {
  const threads = await loadThreads();
  const idx = threads.findIndex((t) => t.threadId === threadId);
  if (idx < 0) return null;
  const prev = threads[idx]!;
  const next: BatteryTalkThread = {
    ...prev,
    adminMemo: adminMemo.trim(),
    updatedAt: new Date().toISOString(),
  };
  threads[idx] = next;
  await saveThreads(threads);
  emitBatteryTalkSessionUpdate(batteryTalkToSummary(next));
  return next;
}

export async function batteryTalkVisitorHistory(
  visitorId: string,
  threadIds: string[] = [],
  userId?: string,
): Promise<import("@/lib/battery-talk/battery-talk-store-shared").BatteryTalkVisitorHistoryItem[]> {
  await ensureLegacyMigration();
  const uid = userId?.trim();
  const vid = visitorId.trim();
  let threads = (await loadThreads()).filter((t) => {
    if (uid) return t.userId === uid;
    if (vid && t.context.visitorId === vid) return true;
    return false;
  });
  threads = threads.filter(
    (t) =>
      !shouldExcludeBatteryTalkThreadFromVisitorHistory(t, {
        customerMessageCount: countCustomerBatteryTalkMessages(t.messages),
      }),
  );

  return threads
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    .slice(0, 20)
    .map((thread) => {
      const lastCustomer = [...thread.messages]
        .reverse()
        .find((m) => m.sender === "customer" && m.body.trim());
      const lastAny = [...thread.messages].reverse().find((m) => m.sender !== "system");
      return {
        threadId: thread.threadId,
        status: thread.status,
        lastMessagePreview: (lastCustomer ?? lastAny)?.body.slice(0, 120) ?? "",
        lastMessageAt: thread.lastMessageAt,
        hasAdminReply: thread.messages.some((m) => m.sender === "admin" && !m.recalledAt),
      };
    });
}

export async function batteryTalkCountByStatus(): Promise<Record<BatteryTalkThreadStatus, number>> {
  const summaries = await batteryTalkList({ limit: 5000 });
  return {
    waiting: summaries.filter((s) => s.status === "waiting").length,
    active: summaries.filter((s) => s.status === "active").length,
    done: summaries.filter((s) => s.status === "done").length,
    hold: summaries.filter((s) => s.status === "hold").length,
  };
}

export async function batteryTalkCountUnread(): Promise<number> {
  const summaries = await batteryTalkList({ limit: 5000 });
  return summaries.filter((s) => s.unreadByAdmin).length;
}

export async function batteryTalkRecallAdminMessage(
  threadId: string,
  messageId: string,
): Promise<BatteryTalkThread | null> {
  const threads = await loadThreads();
  const idx = threads.findIndex((t) => t.threadId === threadId);
  if (idx < 0) return null;
  const prev = threads[idx]!;
  const msgIdx = prev.messages.findIndex((m) => m.id === messageId);
  if (msgIdx < 0) return null;
  const msg = prev.messages[msgIdx]!;
  if (msg.sender !== "admin" || msg.recalledAt) return null;

  const now = new Date().toISOString();
  const nextMessages = [...prev.messages];
  nextMessages[msgIdx] = { ...msg, recalledAt: now };
  const next: BatteryTalkThread = { ...prev, messages: nextMessages, updatedAt: now };
  threads[idx] = next;
  await saveThreads(threads);
  emitBatteryTalkSessionUpdate(batteryTalkToSummary(next));
  return next;
}

export async function batteryTalkCountByPhone(phone: string): Promise<number> {
  await ensureLegacyMigration();
  const normalized = phone.trim();
  const threads = await loadThreads();
  return threads.filter((t) => t.phone === normalized).length;
}

export const BATTERY_TALK_JSON_STORE_PATH = STORE_FILE;
