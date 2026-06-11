import { BATTERY_TALK_REPLY_TEMPLATES } from "@/types/battery-talk";
import { inquiryReplyTemplateSeedsToRecords } from "@/lib/admin/inquiry-reply-template-seeds";
import type {
  BatteryTalkReplyTemplate,
  BatteryTalkReplyTemplateCategory,
} from "@/types/battery-talk-reply-template";

const CATEGORY_MAP: Record<string, BatteryTalkReplyTemplateCategory> = {
  spec: "spec",
  photo: "photo",
  visit: "visit",
  order: "delivery",
  return: "return",
  phone: "phone",
};

export function defaultBatteryTalkReplyTemplates(): BatteryTalkReplyTemplate[] {
  const now = new Date().toISOString();
  const batteryTalk = BATTERY_TALK_REPLY_TEMPLATES.map((tpl, index) => ({
    id: `bt_tpl_${tpl.id}`,
    name: tpl.label,
    body: tpl.body,
    category: CATEGORY_MAP[tpl.id] ?? "other",
    enabled: true,
    sortOrder: index,
    updatedAt: now,
  }));
  return [...batteryTalk, ...inquiryReplyTemplateSeedsToRecords(batteryTalk.length, now)];
}

export function normalizeBatteryTalkReplyTemplates(
  raw: BatteryTalkReplyTemplate[] | undefined | null,
): BatteryTalkReplyTemplate[] {
  if (!raw?.length) return defaultBatteryTalkReplyTemplates();
  return [...raw]
    .filter((t) => t.id && t.name?.trim() && t.body?.trim())
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function newBatteryTalkReplyTemplateId(): string {
  return `bt_tpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}
