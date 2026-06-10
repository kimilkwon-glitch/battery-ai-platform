import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  defaultBatteryTalkReplyTemplates,
  normalizeBatteryTalkReplyTemplates,
  newBatteryTalkReplyTemplateId,
} from "@/lib/admin/battery-talk-reply-templates";
import type { BatteryTalkReplyTemplate } from "@/types/battery-talk-reply-template";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "battery-talk-reply-templates.json");

const globalCache = globalThis as typeof globalThis & {
  __bmBatteryTalkReplyTemplates?: BatteryTalkReplyTemplate[];
};

async function readFromDisk(): Promise<BatteryTalkReplyTemplate[]> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as BatteryTalkReplyTemplate[];
    return normalizeBatteryTalkReplyTemplates(parsed);
  } catch {
    return defaultBatteryTalkReplyTemplates();
  }
}

async function writeToDisk(templates: BatteryTalkReplyTemplate[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(templates, null, 2), "utf8");
}

export async function listBatteryTalkReplyTemplates(): Promise<BatteryTalkReplyTemplate[]> {
  if (globalCache.__bmBatteryTalkReplyTemplates) {
    return globalCache.__bmBatteryTalkReplyTemplates;
  }
  const templates = await readFromDisk();
  globalCache.__bmBatteryTalkReplyTemplates = templates;
  return templates;
}

export async function saveBatteryTalkReplyTemplates(
  templates: BatteryTalkReplyTemplate[],
): Promise<BatteryTalkReplyTemplate[]> {
  const next = normalizeBatteryTalkReplyTemplates(templates);
  globalCache.__bmBatteryTalkReplyTemplates = next;
  await writeToDisk(next);
  return next;
}

export async function upsertBatteryTalkReplyTemplate(
  input: Partial<BatteryTalkReplyTemplate> & Pick<BatteryTalkReplyTemplate, "name" | "body">,
): Promise<BatteryTalkReplyTemplate[]> {
  const current = await listBatteryTalkReplyTemplates();
  const now = new Date().toISOString();
  if (input.id) {
    const next = current.map((t) =>
      t.id === input.id
        ? {
            ...t,
            ...input,
            name: input.name.trim(),
            body: input.body.trim(),
            updatedAt: now,
          }
        : t,
    );
    return saveBatteryTalkReplyTemplates(next);
  }
  const created: BatteryTalkReplyTemplate = {
    id: newBatteryTalkReplyTemplateId(),
    name: input.name.trim(),
    body: input.body.trim(),
    category: input.category ?? "other",
    enabled: input.enabled ?? true,
    sortOrder: input.sortOrder ?? current.length,
    updatedAt: now,
  };
  return saveBatteryTalkReplyTemplates([...current, created]);
}

export async function deleteBatteryTalkReplyTemplate(id: string): Promise<BatteryTalkReplyTemplate[]> {
  const current = await listBatteryTalkReplyTemplates();
  return saveBatteryTalkReplyTemplates(current.filter((t) => t.id !== id));
}
