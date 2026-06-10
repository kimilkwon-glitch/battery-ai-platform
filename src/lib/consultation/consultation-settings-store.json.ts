import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_CONSULTATION_SETTINGS,
  normalizeConsultationSettings,
  type ConsultationChannelSettings,
} from "@/lib/consultation/consultation-settings";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "consultation-settings.json");

const globalCache = globalThis as typeof globalThis & {
  __bmConsultationSettings?: ConsultationChannelSettings;
};

async function readFromDisk(): Promise<ConsultationChannelSettings> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<ConsultationChannelSettings>;
    return normalizeConsultationSettings(parsed);
  } catch {
    return { ...DEFAULT_CONSULTATION_SETTINGS };
  }
}

async function writeToDisk(settings: ConsultationChannelSettings): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(settings, null, 2), "utf8");
}

export async function getConsultationSettings(): Promise<ConsultationChannelSettings> {
  if (globalCache.__bmConsultationSettings) return globalCache.__bmConsultationSettings;
  const settings = await readFromDisk();
  globalCache.__bmConsultationSettings = settings;
  return settings;
}

export async function updateConsultationSettings(
  patch: Partial<ConsultationChannelSettings>,
): Promise<ConsultationChannelSettings> {
  const current = await getConsultationSettings();
  const next = normalizeConsultationSettings({ ...current, ...patch });
  globalCache.__bmConsultationSettings = next;
  await writeToDisk(next);
  return next;
}
