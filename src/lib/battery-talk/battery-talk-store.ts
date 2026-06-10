/**
 * 배터리톡 저장소 파사드
 * - DATABASE_URL 설정 시: Postgres (production 필수)
 * - 미설정 + dev: JSON fallback (.data/battery-talk-threads.json)
 * - 미설정 + production: 명시적 실패 (JSON 저장 금지)
 */

import path from "node:path";
import {
  assertBatteryTalkStoreAvailable,
  getBatteryTalkStoreMode,
  isBatteryTalkDbMode,
  isBatteryTalkStoreReady,
  BatteryTalkStoreError,
} from "@/lib/battery-talk/battery-talk-store-config";
import type {
  BatteryTalkListFilters,
  BatteryTalkOpenThreadInput,
} from "@/lib/battery-talk/battery-talk-store-shared";
import type {
  BatteryTalkMessage,
  BatteryTalkThread,
  BatteryTalkThreadStatus,
  BatteryTalkThreadSummary,
} from "@/types/battery-talk";

export {
  BatteryTalkStoreError,
  getBatteryTalkStoreMode,
  isBatteryTalkStoreReady,
  isBatteryTalkDbMode,
} from "@/lib/battery-talk/battery-talk-store-config";
export type { BatteryTalkOpenThreadInput, BatteryTalkListFilters } from "@/lib/battery-talk/battery-talk-store-shared";
export { batteryTalkToSummary } from "@/lib/battery-talk/battery-talk-store-shared";

async function getStoreImpl() {
  assertBatteryTalkStoreAvailable();
  if (isBatteryTalkDbMode()) {
    return import("@/lib/battery-talk/battery-talk-store.postgres");
  }
  return import("@/lib/battery-talk/battery-talk-store.json");
}

export async function batteryTalkOpenThread(
  input: BatteryTalkOpenThreadInput,
): Promise<BatteryTalkThread> {
  const store = await getStoreImpl();
  return store.batteryTalkOpenThread(input);
}

export async function batteryTalkAddCustomerMessage(
  threadId: string,
  body: string,
  opts?: { phone?: string; customerName?: string },
): Promise<BatteryTalkThread | null> {
  const store = await getStoreImpl();
  return store.batteryTalkAddCustomerMessage(threadId, body, opts);
}

export async function batteryTalkGetMessages(
  threadId: string,
): Promise<BatteryTalkMessage[] | null> {
  const store = await getStoreImpl();
  return store.batteryTalkGetMessages(threadId);
}

export async function batteryTalkList(
  filters: BatteryTalkListFilters = {},
): Promise<BatteryTalkThreadSummary[]> {
  const store = await getStoreImpl();
  return store.batteryTalkList(filters);
}

export async function batteryTalkGetByIdPeek(threadId: string): Promise<BatteryTalkThread | null> {
  const store = await getStoreImpl();
  return store.batteryTalkGetByIdPeek(threadId);
}

export async function batteryTalkGetById(threadId: string): Promise<BatteryTalkThread | null> {
  const store = await getStoreImpl();
  return store.batteryTalkGetById(threadId);
}

export async function batteryTalkAddAdminMessage(
  threadId: string,
  body: string,
): Promise<BatteryTalkThread | null> {
  const store = await getStoreImpl();
  return store.batteryTalkAddAdminMessage(threadId, body);
}

export async function batteryTalkUpdateStatus(
  threadId: string,
  status: BatteryTalkThreadStatus,
): Promise<BatteryTalkThread | null> {
  const store = await getStoreImpl();
  return store.batteryTalkUpdateStatus(threadId, status);
}

export async function batteryTalkUpdateMemo(
  threadId: string,
  adminMemo: string,
): Promise<BatteryTalkThread | null> {
  const store = await getStoreImpl();
  return store.batteryTalkUpdateMemo(threadId, adminMemo);
}

export async function batteryTalkCountByStatus(): Promise<Record<BatteryTalkThreadStatus, number>> {
  const store = await getStoreImpl();
  return store.batteryTalkCountByStatus();
}

export async function batteryTalkCountUnread(): Promise<number> {
  const store = await getStoreImpl();
  return store.batteryTalkCountUnread();
}

export async function batteryTalkCountByPhone(phone: string): Promise<number> {
  const store = await getStoreImpl();
  return store.batteryTalkCountByPhone(phone);
}

/** dev JSON 경로 — postgres 모드에서는 null */
export const BATTERY_TALK_STORE_PATH = isBatteryTalkDbMode()
  ? null
  : path.join(process.cwd(), ".data", "battery-talk-threads.json");
