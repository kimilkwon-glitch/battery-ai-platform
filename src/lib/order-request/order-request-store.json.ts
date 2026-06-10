/**
 * 상담 주문 요청 — 개발 전용 JSON fallback (.data/order-requests.json)
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { filterAdminTestOrderRequests } from "@/lib/admin/admin-test-data-filter";
import type { PersistedOrderRequest } from "@/types/order-request";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "order-requests.json");

type StorePayload = {
  version: 1;
  records: PersistedOrderRequest[];
};

const globalCache = globalThis as typeof globalThis & {
  __bmOrderRequestStore?: PersistedOrderRequest[];
};

function emptyPayload(): StorePayload {
  return { version: 1, records: [] };
}

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readPayloadFromDisk(): Promise<StorePayload> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as StorePayload;
    if (parsed?.version === 1 && Array.isArray(parsed.records)) {
      return parsed;
    }
  } catch {
    /* first run */
  }
  return emptyPayload();
}

async function writePayloadToDisk(payload: StorePayload): Promise<void> {
  await ensureDataDir();
  await writeFile(STORE_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function loadRecords(): Promise<PersistedOrderRequest[]> {
  if (globalCache.__bmOrderRequestStore) {
    return [...globalCache.__bmOrderRequestStore];
  }
  const payload = await readPayloadFromDisk();
  globalCache.__bmOrderRequestStore = payload.records;
  return [...payload.records];
}

async function saveRecords(records: PersistedOrderRequest[]): Promise<void> {
  globalCache.__bmOrderRequestStore = records;
  await writePayloadToDisk({ version: 1, records });
}

export type OrderRequestListFilters = {
  status?: string | null;
  q?: string | null;
  limit?: number;
};

export async function storeCreate(
  record: PersistedOrderRequest,
): Promise<PersistedOrderRequest> {
  const records = await loadRecords();
  records.unshift(record);
  await saveRecords(records);
  return record;
}

export async function storeList(
  filters: OrderRequestListFilters = {},
): Promise<PersistedOrderRequest[]> {
  let records = await loadRecords();
  const status = filters.status?.trim();
  if (status && status !== "all") {
    records = records.filter((r) => r.status === status);
  }
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    records = records.filter((r) => {
      const hay = [
        r.requestNumber,
        r.customerName,
        r.customerPhone,
        r.vehicleName,
        r.batterySpecSummary,
        r.memo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }
  records = filterAdminTestOrderRequests(records);
  const limit = filters.limit ?? 200;
  return records.slice(0, limit);
}

export async function storeGetById(
  id: string,
): Promise<PersistedOrderRequest | null> {
  const records = await loadRecords();
  return records.find((r) => r.id === id) ?? null;
}

export async function storeGetByRequestNumber(
  requestNumber: string,
): Promise<PersistedOrderRequest | null> {
  const rn = requestNumber.trim();
  const records = await loadRecords();
  return records.find((r) => r.requestNumber === rn) ?? null;
}

export async function storeUpdate(
  id: string,
  patch: Partial<PersistedOrderRequest>,
): Promise<PersistedOrderRequest | null> {
  const records = await loadRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const prev = records[idx]!;
  const next: PersistedOrderRequest = {
    ...prev,
    ...patch,
    id: prev.id,
    requestNumber: prev.requestNumber,
    createdAt: prev.createdAt,
    updatedAt: new Date().toISOString(),
  };
  records[idx] = next;
  await saveRecords(records);
  return next;
}

/** 당일 접수 건수 기반 일련번호 (DB unique index 전 임시) */
export async function storeCountForDatePrefix(prefix: string): Promise<number> {
  const records = await loadRecords();
  return records.filter((r) => r.requestNumber.startsWith(prefix)).length;
}

export const ORDER_REQUEST_STORE_PATH = STORE_FILE;
