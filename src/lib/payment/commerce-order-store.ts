import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CommerceOrderRecord } from "@/types/commerce-payment";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "commerce-orders.json");

type StorePayload = {
  version: 1;
  records: CommerceOrderRecord[];
};

const globalCache = globalThis as typeof globalThis & {
  __bmCommerceOrderStore?: CommerceOrderRecord[];
};

function emptyPayload(): StorePayload {
  return { version: 1, records: [] };
}

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readPayloadFromDisk(): Promise<StorePayload | null> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as StorePayload;
    if (parsed?.version === 1 && Array.isArray(parsed.records)) return parsed;
  } catch {
    /* first run or read-only */
  }
  return null;
}

async function writePayloadToDisk(payload: StorePayload): Promise<boolean> {
  try {
    await ensureDataDir();
    await writeFile(STORE_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function loadRecords(): Promise<CommerceOrderRecord[]> {
  if (globalCache.__bmCommerceOrderStore) {
    return [...globalCache.__bmCommerceOrderStore];
  }
  const payload = await readPayloadFromDisk();
  const records = payload?.records ?? [];
  globalCache.__bmCommerceOrderStore = records;
  return [...records];
}

async function saveRecords(records: CommerceOrderRecord[]): Promise<void> {
  globalCache.__bmCommerceOrderStore = records;
  await writePayloadToDisk({ version: 1, records });
}

export async function storeCommerceOrderCreate(record: CommerceOrderRecord): Promise<CommerceOrderRecord> {
  const records = await loadRecords();
  records.push(record);
  await saveRecords(records);
  return record;
}

export async function storeCommerceOrderGet(orderId: string): Promise<CommerceOrderRecord | null> {
  const records = await loadRecords();
  return records.find((r) => r.orderId === orderId) ?? null;
}

export async function storeCommerceOrderUpdate(
  orderId: string,
  patch: Partial<CommerceOrderRecord>,
): Promise<CommerceOrderRecord | null> {
  const records = await loadRecords();
  const idx = records.findIndex((r) => r.orderId === orderId);
  if (idx < 0) return null;
  const next = { ...records[idx]!, ...patch, updatedAt: new Date().toISOString() };
  records[idx] = next;
  await saveRecords(records);
  return next;
}

export async function storeCommerceOrderCountByPrefix(prefix: string): Promise<number> {
  const records = await loadRecords();
  return records.filter((r) => r.orderNumber.startsWith(prefix)).length;
}

export async function storeCommerceOrderList(limit = 200): Promise<CommerceOrderRecord[]> {
  const records = await loadRecords();
  return [...records]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
