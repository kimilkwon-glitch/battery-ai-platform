import "server-only";

import { ensureOperationalSchema } from "@/lib/db/ensure-operational-schema";
import { getSql } from "@/lib/db/postgres";
import type {
  AlimtalkEventType,
  NotificationEntityType,
  NotificationLogRecord,
  NotificationLogStatus,
} from "@/lib/notifications/alimtalk-types";

type LogRow = {
  id: string;
  channel: string;
  event_type: string;
  template_id: string | null;
  entity_type: string;
  entity_id: string;
  order_id: string | null;
  user_id: string | null;
  recipient_phone: string;
  recipient_name: string | null;
  status: string;
  skip_reason: string | null;
  provider: string;
  provider_message_id: string | null;
  failed_reason: string | null;
  sent_at: string | null;
  created_at: string;
};

function rowToRecord(row: LogRow): NotificationLogRecord {
  return {
    id: row.id,
    channel: "alimtalk",
    eventType: row.event_type as AlimtalkEventType,
    templateId: row.template_id,
    entityType: row.entity_type as NotificationEntityType,
    entityId: row.entity_id,
    orderId: row.order_id,
    userId: row.user_id,
    recipientPhone: row.recipient_phone,
    recipientName: row.recipient_name,
    status: row.status as NotificationLogStatus,
    skipReason: row.skip_reason as NotificationLogRecord["skipReason"],
    provider: "solapi",
    providerMessageId: row.provider_message_id,
    failedReason: row.failed_reason,
    sentAt: row.sent_at,
    createdAt: row.created_at,
  };
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
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM notification_logs
    WHERE entity_type = ${entityType}
      AND entity_id = ${entityId}
      AND event_type = ${eventType}
      AND status = 'sent'
    ORDER BY created_at DESC
    LIMIT 1
  `) as LogRow[];
  return rows[0] ? rowToRecord(rows[0]) : null;
}

export async function notificationLogInsert(
  input: Omit<NotificationLogRecord, "id" | "createdAt"> & {
    orderId?: string | null;
    userId?: string | null;
  },
): Promise<NotificationLogRecord> {
  await ensureOperationalSchema();
  const sql = getSql();
  const id = newLogId();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO notification_logs (
      id, channel, event_type, template_id, entity_type, entity_id,
      order_id, user_id, recipient_phone, recipient_name, status,
      skip_reason, provider, provider_message_id, failed_reason, sent_at, created_at
    ) VALUES (
      ${id},
      ${input.channel},
      ${input.eventType},
      ${input.templateId},
      ${input.entityType},
      ${input.entityId},
      ${input.orderId ?? null},
      ${input.userId ?? null},
      ${input.recipientPhone},
      ${input.recipientName ?? null},
      ${input.status},
      ${input.skipReason ?? null},
      ${input.provider},
      ${input.providerMessageId ?? null},
      ${input.failedReason ?? null},
      ${input.sentAt ?? null},
      ${now}
    )
  `;
  return {
    ...input,
    id,
    createdAt: now,
  };
}

export async function notificationLogListForOrder(orderId: string): Promise<NotificationLogRecord[]> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM notification_logs
    WHERE order_id = ${orderId}
       OR (entity_type = 'order' AND entity_id = ${orderId})
       OR (entity_type = 'order' AND entity_id LIKE ${`${orderId}:%`})
    ORDER BY created_at ASC
  `) as LogRow[];
  return rows.map(rowToRecord);
}
