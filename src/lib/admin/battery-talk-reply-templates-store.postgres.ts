import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  defaultBatteryTalkReplyTemplates,
  normalizeBatteryTalkReplyTemplates,
  newBatteryTalkReplyTemplateId,
} from "@/lib/admin/battery-talk-reply-templates";
import { ensureOperationalSchema } from "@/lib/db/ensure-operational-schema";
import { getSql } from "@/lib/db/postgres";
import type { BatteryTalkReplyTemplate } from "@/types/battery-talk-reply-template";

const JSON_STORE_FILE = path.join(process.cwd(), ".data", "battery-talk-reply-templates.json");

type TemplateRow = {
  id: string;
  name: string;
  body: string;
  category: string;
  enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function rowToRecord(row: TemplateRow): BatteryTalkReplyTemplate {
  return {
    id: row.id,
    name: row.name,
    body: row.body,
    category: row.category as BatteryTalkReplyTemplate["category"],
    enabled: row.enabled,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  };
}

async function readLegacyJsonTemplates(): Promise<BatteryTalkReplyTemplate[] | null> {
  try {
    const raw = await readFile(JSON_STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as BatteryTalkReplyTemplate[];
    const normalized = normalizeBatteryTalkReplyTemplates(parsed);
    return normalized.length ? normalized : null;
  } catch {
    return null;
  }
}

async function seedIfEmpty(): Promise<void> {
  const sql = getSql();
  const rows = (await sql`
    SELECT COUNT(*)::int AS count FROM admin_reply_templates
  `) as { count: number }[];
  if ((rows[0]?.count ?? 0) > 0) return;

  const legacy = await readLegacyJsonTemplates();
  const seeds = legacy ?? defaultBatteryTalkReplyTemplates();
  const now = new Date().toISOString();

  for (const tpl of seeds) {
    await sql`
      INSERT INTO admin_reply_templates (
        id, name, body, category, enabled, sort_order, created_at, updated_at
      ) VALUES (
        ${tpl.id}, ${tpl.name}, ${tpl.body}, ${tpl.category}, ${tpl.enabled},
        ${tpl.sortOrder}, ${now}, ${tpl.updatedAt ?? now}
      ) ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function listRows(): Promise<BatteryTalkReplyTemplate[]> {
  await ensureOperationalSchema();
  await seedIfEmpty();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, name, body, category, enabled, sort_order, created_at, updated_at
    FROM admin_reply_templates
    ORDER BY sort_order ASC, updated_at DESC
  `) as TemplateRow[];
  return rows.map(rowToRecord);
}

export async function listBatteryTalkReplyTemplates(): Promise<BatteryTalkReplyTemplate[]> {
  return listRows();
}

export async function saveBatteryTalkReplyTemplates(
  templates: BatteryTalkReplyTemplate[],
): Promise<BatteryTalkReplyTemplate[]> {
  await ensureOperationalSchema();
  const next = normalizeBatteryTalkReplyTemplates(templates);
  const sql = getSql();
  const now = new Date().toISOString();

  await sql`DELETE FROM admin_reply_templates`;
  for (const tpl of next) {
    await sql`
      INSERT INTO admin_reply_templates (
        id, name, body, category, enabled, sort_order, created_at, updated_at
      ) VALUES (
        ${tpl.id}, ${tpl.name}, ${tpl.body}, ${tpl.category}, ${tpl.enabled},
        ${tpl.sortOrder}, ${now}, ${tpl.updatedAt ?? now}
      )
    `;
  }
  return listRows();
}

export async function upsertBatteryTalkReplyTemplate(
  input: Partial<BatteryTalkReplyTemplate> & Pick<BatteryTalkReplyTemplate, "name" | "body">,
): Promise<BatteryTalkReplyTemplate[]> {
  await ensureOperationalSchema();
  await seedIfEmpty();
  const sql = getSql();
  const now = new Date().toISOString();
  const id = input.id?.trim() || newBatteryTalkReplyTemplateId();

  let sortOrder = input.sortOrder;
  if (sortOrder == null && !input.id) {
    const rows = (await sql`
      SELECT COALESCE(MAX(sort_order), -1)::int AS max_order FROM admin_reply_templates
    `) as { max_order: number }[];
    sortOrder = (rows[0]?.max_order ?? -1) + 1;
  }

  await sql`
    INSERT INTO admin_reply_templates (
      id, name, body, category, enabled, sort_order, created_at, updated_at
    ) VALUES (
      ${id}, ${input.name.trim()}, ${input.body.trim()}, ${input.category ?? "other"},
      ${input.enabled ?? true}, ${sortOrder ?? 0}, ${now}, ${now}
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      body = EXCLUDED.body,
      category = EXCLUDED.category,
      enabled = EXCLUDED.enabled,
      sort_order = EXCLUDED.sort_order,
      updated_at = EXCLUDED.updated_at
  `;

  return listRows();
}

export async function deleteBatteryTalkReplyTemplate(
  id: string,
): Promise<BatteryTalkReplyTemplate[]> {
  await ensureOperationalSchema();
  const sql = getSql();
  await sql`DELETE FROM admin_reply_templates WHERE id = ${id}`;
  return listRows();
}
