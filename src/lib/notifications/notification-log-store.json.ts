import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type {
  AlimtalkEventType,
  NotificationEntityType,
  NotificationLogRecord,
} from "@/lib/notifications/alimtalk-types";

type Payload = { logs: NotificationLogRecord[] };

const DATA_PATH = path.join(process.cwd(), ".data", "notification-logs.json");

async function loadPayload(): Promise<Payload> {
  try {
    const raw = await readFile(DATA_PATH, "utf8");
    return JSON.parse(raw) as Payload;
  } catch {
    return { logs: [] };
  }
}

async function savePayload(payload: Payload): Promise<void> {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(payload, null, 2), "utf8");
}

function newLogId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `ntl-${crypto.randomUUID()}`;
  }
  return `ntl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function notificationLogFindSent(
  entityType: NotificationEntityType,
  entityId: string,
  eventType: AlimtalkEventType,
): Promise<NotificationLogRecord | null> {
  const payload = await loadPayload();
  return (
    payload.logs.find(
      (l) =>
        l.entityType === entityType &&
        l.entityId === entityId &&
        l.eventType === eventType &&
        l.status === "sent",
    ) ?? null
  );
}

export async function notificationLogInsert(
  input: Omit<NotificationLogRecord, "id" | "createdAt"> & {
    orderId?: string | null;
    userId?: string | null;
  },
): Promise<NotificationLogRecord> {
  const payload = await loadPayload();
  const now = new Date().toISOString();
  const record: NotificationLogRecord = {
    id: newLogId(),
    channel: input.channel,
    eventType: input.eventType,
    templateId: input.templateId,
    entityType: input.entityType,
    entityId: input.entityId,
    orderId: input.orderId ?? null,
    userId: input.userId ?? null,
    recipientPhone: input.recipientPhone,
    recipientName: input.recipientName,
    status: input.status,
    skipReason: input.skipReason,
    provider: input.provider,
    providerMessageId: input.providerMessageId,
    failedReason: input.failedReason,
    sentAt: input.sentAt,
    createdAt: now,
  };
  payload.logs.push(record);
  await savePayload(payload);
  return record;
}

export async function notificationLogListForOrder(orderId: string): Promise<NotificationLogRecord[]> {
  const payload = await loadPayload();
  return payload.logs.filter(
    (l) =>
      l.orderId === orderId ||
      (l.entityType === "order" && l.entityId === orderId) ||
      (l.entityType === "order" && l.entityId.startsWith(`${orderId}:`)),
  );
}
