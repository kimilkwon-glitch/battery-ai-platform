/**
 * 알림톡 발송 로그 파사드 — DATABASE_URL 시 Postgres, dev만 JSON fallback
 */

import { assertOperationalStoreAvailable } from "@/lib/db/operational-store-config";

export type { NotificationLogRecord } from "@/lib/notifications/alimtalk-types";

async function getStore() {
  assertOperationalStoreAvailable("notification_logs");
  const { isOperationalDbMode } = await import("@/lib/db/operational-store-config");
  if (isOperationalDbMode()) return import("@/lib/notifications/notification-log-store.postgres");
  return import("@/lib/notifications/notification-log-store.json");
}

export async function notificationLogFindSent(
  ...args: Parameters<
    typeof import("@/lib/notifications/notification-log-store.postgres").notificationLogFindSent
  >
) {
  return (await getStore()).notificationLogFindSent(...args);
}

export async function notificationLogInsert(
  ...args: Parameters<
    typeof import("@/lib/notifications/notification-log-store.postgres").notificationLogInsert
  >
) {
  return (await getStore()).notificationLogInsert(...args);
}

export async function notificationLogListForOrder(orderId: string) {
  return (await getStore()).notificationLogListForOrder(orderId);
}
