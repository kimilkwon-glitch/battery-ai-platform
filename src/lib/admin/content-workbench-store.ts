/**
 * 관리자 콘텐츠 워크벤치 — JSON persistence
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AdminContentItem } from "@/data/admin/adminContent.schema";
import { getAdminContentItems } from "@/lib/admin/getAdminContentItems";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "content-workbench.json");

type StorePayload = {
  version: 1;
  items: AdminContentItem[];
  updatedAt: string;
};

const globalCache = globalThis as typeof globalThis & {
  __bmContentWorkbenchStore?: AdminContentItem[];
};

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readPayloadFromDisk(): Promise<StorePayload | null> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as StorePayload;
    if (parsed?.version === 1 && Array.isArray(parsed.items)) {
      return parsed;
    }
  } catch {
    /* missing */
  }
  return null;
}

async function writePayload(payload: StorePayload): Promise<void> {
  await ensureDataDir();
  await writeFile(STORE_FILE, JSON.stringify(payload, null, 2), "utf8");
  globalCache.__bmContentWorkbenchStore = payload.items;
}

function seedItems(): AdminContentItem[] {
  const { items } = getAdminContentItems();
  return items;
}

export async function loadContentWorkbenchItems(): Promise<AdminContentItem[]> {
  if (globalCache.__bmContentWorkbenchStore) {
    return globalCache.__bmContentWorkbenchStore;
  }
  const existing = await readPayloadFromDisk();
  if (existing && existing.items.length > 0) {
    globalCache.__bmContentWorkbenchStore = existing.items;
    return existing.items;
  }
  const seeded = seedItems();
  const payload: StorePayload = {
    version: 1,
    items: seeded,
    updatedAt: new Date().toISOString(),
  };
  await writePayload(payload);
  return seeded;
}

export async function saveContentWorkbenchItems(
  items: AdminContentItem[],
): Promise<AdminContentItem[]> {
  const payload: StorePayload = {
    version: 1,
    items,
    updatedAt: new Date().toISOString(),
  };
  await writePayload(payload);
  return items;
}

export async function upsertContentWorkbenchItem(
  item: AdminContentItem,
): Promise<AdminContentItem[]> {
  const items = await loadContentWorkbenchItems();
  const idx = items.findIndex((i) => i.id === item.id);
  const next = [...items];
  if (idx >= 0) next[idx] = item;
  else next.unshift(item);
  return saveContentWorkbenchItems(next);
}

export const CONTENT_WORKBENCH_STORE_PATH = STORE_FILE;
