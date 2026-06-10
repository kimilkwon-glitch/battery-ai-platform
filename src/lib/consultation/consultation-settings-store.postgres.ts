import "server-only";

import {
  DEFAULT_CONSULTATION_SETTINGS,
  normalizeConsultationSettings,
  type ConsultationChannelSettings,
} from "@/lib/consultation/consultation-settings";
import { ensureOperationalSchema } from "@/lib/db/ensure-operational-schema";
import { getSql } from "@/lib/db/postgres";

const SETTINGS_ID = "default";

export async function getConsultationSettings(): Promise<ConsultationChannelSettings> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT settings_json FROM consultation_settings WHERE id = ${SETTINGS_ID} LIMIT 1
  `) as { settings_json: Partial<ConsultationChannelSettings> }[];

  if (!rows[0]) {
    const defaults = { ...DEFAULT_CONSULTATION_SETTINGS };
    await sql`
      INSERT INTO consultation_settings (id, settings_json, updated_at)
      VALUES (${SETTINGS_ID}, ${JSON.stringify(defaults)}, ${new Date().toISOString()})
      ON CONFLICT (id) DO NOTHING
    `;
    return defaults;
  }
  return normalizeConsultationSettings(rows[0].settings_json);
}

export async function updateConsultationSettings(
  patch: Partial<ConsultationChannelSettings>,
): Promise<ConsultationChannelSettings> {
  const current = await getConsultationSettings();
  const next = normalizeConsultationSettings({ ...current, ...patch });
  const sql = getSql();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO consultation_settings (id, settings_json, updated_at)
    VALUES (${SETTINGS_ID}, ${JSON.stringify(next)}, ${now})
    ON CONFLICT (id) DO UPDATE SET
      settings_json = EXCLUDED.settings_json,
      updated_at = EXCLUDED.updated_at
  `;
  return next;
}
