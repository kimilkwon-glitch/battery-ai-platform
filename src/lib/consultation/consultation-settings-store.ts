/**
 * 상담 채널 설정 파사드 — DATABASE_URL 시 Postgres, dev만 JSON fallback
 */

import path from "node:path";
import type { ConsultationChannelSettings } from "@/lib/consultation/consultation-settings";
import {
  assertOperationalStoreAvailable,
  isOperationalDbMode,
} from "@/lib/db/operational-store-config";

async function getStore() {
  assertOperationalStoreAvailable("consultation_settings");
  if (isOperationalDbMode()) return import("@/lib/consultation/consultation-settings-store.postgres");
  return import("@/lib/consultation/consultation-settings-store.json");
}

export async function getConsultationSettings(): Promise<ConsultationChannelSettings> {
  return (await getStore()).getConsultationSettings();
}

export async function updateConsultationSettings(
  patch: Partial<ConsultationChannelSettings>,
): Promise<ConsultationChannelSettings> {
  return (await getStore()).updateConsultationSettings(patch);
}

export const CONSULTATION_SETTINGS_STORE_PATH = isOperationalDbMode()
  ? null
  : path.join(process.cwd(), ".data", "consultation-settings.json");
