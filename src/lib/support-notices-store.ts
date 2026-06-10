/**
 * 고객센터 공지 저장소 파사드 — DATABASE_URL 시 Postgres, dev만 JSON fallback
 */

import path from "node:path";
import {
  assertOperationalStoreAvailable,
  isOperationalDbMode,
} from "@/lib/db/operational-store-config";

export type {
  SupportNoticeCategory,
  SupportNoticeRecord,
  SupportNoticeInput,
} from "@/lib/support-notices-store.postgres";

async function getStore() {
  assertOperationalStoreAvailable("support_notices");
  if (isOperationalDbMode()) return import("@/lib/support-notices-store.postgres");
  return import("@/lib/support-notices-store.json");
}

export async function listAllSupportNotices() {
  return (await getStore()).listAllSupportNotices();
}

export async function listHubSupportNotices() {
  return (await getStore()).listHubSupportNotices();
}

export async function getSupportNoticeById(id: string) {
  return (await getStore()).getSupportNoticeById(id);
}

export async function createSupportNotice(
  input: import("@/lib/support-notices-store.postgres").SupportNoticeInput,
) {
  return (await getStore()).createSupportNotice(input);
}

export async function updateSupportNotice(
  id: string,
  patch: Partial<import("@/lib/support-notices-store.postgres").SupportNoticeInput>,
) {
  return (await getStore()).updateSupportNotice(id, patch);
}

export const SUPPORT_NOTICES_STORE_PATH = isOperationalDbMode()
  ? null
  : path.join(process.cwd(), ".data", "support-notices.json");
