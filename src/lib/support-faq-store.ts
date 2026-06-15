/**
 * 고객센터 FAQ 저장소 파사드 — DATABASE_URL 시 Postgres, dev만 JSON fallback
 */

import path from "node:path";
import {
  assertOperationalStoreAvailable,
  isOperationalDbMode,
} from "@/lib/db/operational-store-config";

export type {
  SupportFaqRecord,
  SupportFaqInput,
} from "@/lib/support-faq-store.postgres";

export { FaqAnswerEmptyError } from "@/lib/support-faq-store.postgres";

async function getStore() {
  assertOperationalStoreAvailable("support_faq");
  if (isOperationalDbMode()) return import("@/lib/support-faq-store.postgres");
  return import("@/lib/support-faq-store.json");
}

export async function listAllSupportFaqItems() {
  return (await getStore()).listAllSupportFaqItems();
}

export async function listPublishedSupportFaqItems() {
  return (await getStore()).listPublishedSupportFaqItems();
}

export async function getSupportFaqItemById(id: string) {
  return (await getStore()).getSupportFaqItemById(id);
}

export async function createSupportFaqItem(
  input: import("@/lib/support-faq-store.postgres").SupportFaqInput,
) {
  return (await getStore()).createSupportFaqItem(input);
}

export async function updateSupportFaqItem(
  id: string,
  patch: Partial<import("@/lib/support-faq-store.postgres").SupportFaqInput>,
) {
  return (await getStore()).updateSupportFaqItem(id, patch);
}

export async function softDeleteSupportFaqItem(id: string) {
  return (await getStore()).softDeleteSupportFaqItem(id);
}

export const SUPPORT_FAQ_STORE_PATH = isOperationalDbMode()
  ? null
  : path.join(process.cwd(), ".data", "support-faq.json");
