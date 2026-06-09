/**
 * 배터리톡 상담 스레드 — JSON 파일 저장소
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { filterAdminTestInquiries } from "@/lib/admin/admin-test-data-filter";
import { inferBatteryTalkPageType } from "@/lib/battery-talk/battery-talk-context";
import { inquiryList } from "@/lib/inquiry/inquiry-store";
import type { CustomerInquiryRecord, InquiryStatus } from "@/types/customer-inquiry";
import {
  BATTERY_TALK_SYSTEM_WELCOME,
  batteryTalkSystemProductLine,
} from "@/lib/battery-talk/battery-talk-chat-copy";
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
  globalCache.__bmBatteryTalkStore = payload.threads;
  return payload.threads;
}

async function saveThreads(threads: BatteryTalkThread[]): Promise<void> {
  globalCache.__bmBatteryTalkStore = threads;
  await writePayloadToDisk({ version: 1, threads });
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
    id: newId("btm"),
    sender: "customer",
    body: row.message,
    createdAt: row.createdAt,
  };
  return {
    threadId: newId("btt"),
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

export type BatteryTalkOpenThreadInput = {
  customerName?: string;
  phone?: string;
  userId?: string;
  isMember?: boolean;
  context?: BatteryTalkContext;
};

function buildSystemMessages(context: BatteryTalkContext, now: string): BatteryTalkMessage[] {
  const messages: BatteryTalkMessage[] = [
    {
      id: newId("btm"),
      sender: "system",
      body: BATTERY_TALK_SYSTEM_WELCOME,
      createdAt: now,
    },
  ];
  const productLabel =
    context.productName && context.batteryCode
      ? `${context.productName} · ${context.batteryCode}`
      : context.productName ?? context.batteryCode ?? context.productCode;
  if (productLabel) {
    messages.push({
      id: newId("btm"),
      sender: "system",
      body: batteryTalkSystemProductLine(
        context.productName && context.batteryCode
          ? `${context.productName} 상품 문의`
          : `${productLabel} 상품 문의`,
      ),
      createdAt: now,
    });
  }
  return messages;
}

export async function batteryTalkOpenThread(
  input: BatteryTalkOpenThreadInput,
): Promise<BatteryTalkThread> {
  await ensureLegacyMigration();
  const now = new Date().toISOString();
  const context: BatteryTalkContext = {
    ...input.context,
    pageType: input.context?.pageType ?? inferBatteryTalkPageType(input.context?.pageUrl),
  };
  const thread: BatteryTalkThread = {
    threadId: newId("btt"),
    source: "batterytalk",
    status: "waiting",
    customerName: input.customerName?.trim() || "고객",
    phone: input.phone?.trim() || "",
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
  return thread;
}

export async function batteryTalkAddCustomerMessage(
  threadId: string,
  body: string,
  opts?: { phone?: string; customerName?: string },
): Promise<BatteryTalkThread | null> {
  const threads = await loadThreads();
  const idx = threads.findIndex((t) => t.threadId === threadId);
  if (idx < 0) return null;
  const now = new Date().toISOString();
  const prev = threads[idx]!;
  const message: BatteryTalkMessage = {
    id: newId("btm"),
    sender: "customer",
    body: body.trim(),
    createdAt: now,
  };
  const next: BatteryTalkThread = {
    ...prev,
    customerName: opts?.customerName?.trim() || prev.customerName,
    phone: opts?.phone?.trim() || prev.phone,
    messages: [...prev.messages, message],
    status: prev.status === "done" ? "waiting" : prev.status,
    updatedAt: now,
    lastMessageAt: now,
    unreadByAdmin: true,
  };
  threads[idx] = next;
  await saveThreads(threads);
  return next;
}

export type BatteryTalkListFilters = {
  status?: BatteryTalkThreadStatus | "all" | null;
  q?: string | null;
  limit?: number;
};

function toSummary(thread: BatteryTalkThread): BatteryTalkThreadSummary {
  const last =
    [...thread.messages].reverse().find((m) => m.sender !== "system") ??
    thread.messages[thread.messages.length - 1];
  return {
    threadId: thread.threadId,
    status: thread.status,
    customerName: thread.customerName,
    phone: thread.phone,
    lastMessagePreview: last?.body.slice(0, 80) ?? "",
    lastMessageAt: thread.lastMessageAt,
    unreadByAdmin: thread.unreadByAdmin,
    hasProduct: Boolean(thread.context.productCode || thread.context.batteryCode || thread.context.productName),
    hasOrder: Boolean(thread.context.orderId || thread.context.orderNumber),
    vehicleName: thread.context.vehicleName,
    productName: thread.context.productName,
    pageType: thread.context.pageType,
  };
}

function threadToInquiryShape(t: BatteryTalkThread): CustomerInquiryRecord {
  return {
    id: t.threadId,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    status: "new",
    category: "other",
    name: t.customerName,
    contact: t.phone,
    message: t.messages[0]?.body ?? "",
    source: "batterytalk",
  };
}

export async function batteryTalkList(
  filters: BatteryTalkListFilters = {},
): Promise<BatteryTalkThreadSummary[]> {
  await ensureLegacyMigration();
  let threads = await loadThreads();
  const allowed = new Set(
    filterAdminTestInquiries(threads.map(threadToInquiryShape)).map((r) => r.id),
  );
  threads = threads.filter((t) => allowed.has(t.threadId));

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
  return threads.slice(0, limit).map(toSummary);
}

export async function batteryTalkGetById(threadId: string): Promise<BatteryTalkThread | null> {
  await ensureLegacyMigration();
  const threads = await loadThreads();
  const thread = threads.find((t) => t.threadId === threadId) ?? null;
  if (thread?.unreadByAdmin) {
    const idx = threads.findIndex((t) => t.threadId === threadId);
    if (idx >= 0) {
      threads[idx] = { ...thread, unreadByAdmin: false, updatedAt: new Date().toISOString() };
      await saveThreads(threads);
      return threads[idx]!;
    }
  }
  return thread;
}

export async function batteryTalkAddAdminMessage(
  threadId: string,
  body: string,
): Promise<BatteryTalkThread | null> {
  const threads = await loadThreads();
  const idx = threads.findIndex((t) => t.threadId === threadId);
  if (idx < 0) return null;
  const now = new Date().toISOString();
  const prev = threads[idx]!;
  const message: BatteryTalkMessage = {
    id: newId("btm"),
    sender: "admin",
    body: body.trim(),
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
  return next;
}

export async function batteryTalkCountByStatus(): Promise<Record<BatteryTalkThreadStatus, number>> {
  await ensureLegacyMigration();
  const threads = await loadThreads();
  return {
    waiting: threads.filter((t) => t.status === "waiting").length,
    active: threads.filter((t) => t.status === "active").length,
    done: threads.filter((t) => t.status === "done").length,
    hold: threads.filter((t) => t.status === "hold").length,
  };
}

export async function batteryTalkCountUnread(): Promise<number> {
  await ensureLegacyMigration();
  const threads = await loadThreads();
  return threads.filter((t) => t.unreadByAdmin).length;
}

export async function batteryTalkCountByPhone(phone: string): Promise<number> {
  await ensureLegacyMigration();
  const normalized = phone.trim();
  const threads = await loadThreads();
  return threads.filter((t) => t.phone === normalized).length;
}

export const BATTERY_TALK_STORE_PATH = STORE_FILE;
