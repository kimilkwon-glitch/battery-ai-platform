/**
 * 관리자 답변 템플릿 저장소 — DATABASE_URL 시 Postgres, dev만 JSON fallback
 */

import path from "node:path";
import {
  assertOperationalStoreAvailable,
  isOperationalDbMode,
} from "@/lib/db/operational-store-config";

async function getStore() {
  assertOperationalStoreAvailable("reply_templates");
  if (isOperationalDbMode()) return import("@/lib/admin/battery-talk-reply-templates-store.postgres");
  return import("@/lib/admin/battery-talk-reply-templates-store.json");
}

export async function listBatteryTalkReplyTemplates() {
  return (await getStore()).listBatteryTalkReplyTemplates();
}

export async function saveBatteryTalkReplyTemplates(
  templates: import("@/types/battery-talk-reply-template").BatteryTalkReplyTemplate[],
) {
  return (await getStore()).saveBatteryTalkReplyTemplates(templates);
}

export async function upsertBatteryTalkReplyTemplate(
  input: Partial<import("@/types/battery-talk-reply-template").BatteryTalkReplyTemplate> &
    Pick<import("@/types/battery-talk-reply-template").BatteryTalkReplyTemplate, "name" | "body">,
) {
  return (await getStore()).upsertBatteryTalkReplyTemplate(input);
}

export async function deleteBatteryTalkReplyTemplate(id: string) {
  return (await getStore()).deleteBatteryTalkReplyTemplate(id);
}

export const REPLY_TEMPLATES_STORE_PATH = isOperationalDbMode()
  ? null
  : path.join(process.cwd(), ".data", "battery-talk-reply-templates.json");
