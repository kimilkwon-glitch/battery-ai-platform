/**
 * 고객 문의 — JSON 파일 저장소 (DB 연동 전)
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  normalizeInquiryCategory,
  type CustomerInquiryRecord,
  type InquiryCategory,
  type InquirySource,
  type InquiryStatus,
} from "@/types/customer-inquiry";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "inquiries.json");

type StorePayload = {
  version: 1;
  records: CustomerInquiryRecord[];
};

const globalCache = globalThis as typeof globalThis & {
  __bmInquiryStore?: CustomerInquiryRecord[];
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
  const payload = emptyPayload();
  await writePayloadToDisk(payload);
  return payload;
}

async function writePayloadToDisk(payload: StorePayload): Promise<void> {
  await ensureDataDir();
  await writeFile(STORE_FILE, JSON.stringify(payload, null, 2), "utf8");
}

async function loadRecords(): Promise<CustomerInquiryRecord[]> {
  if (globalCache.__bmInquiryStore) return globalCache.__bmInquiryStore;
  const payload = await readPayloadFromDisk();
  globalCache.__bmInquiryStore = payload.records;
  return payload.records;
}

async function saveRecords(records: CustomerInquiryRecord[]): Promise<void> {
  globalCache.__bmInquiryStore = records;
  await writePayloadToDisk({ version: 1, records });
}

function newId(): string {
  return `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export type InquiryCreateInput = {
  name: string;
  contact: string;
  vehicle?: string;
  message: string;
  batteryCode?: string;
  returnOption?: string;
  pageUrl?: string;
  source?: InquirySource;
  category?: InquiryCategory;
  inquiryType?: string;
  couponCode?: string;
};

export type InquiryListFilters = {
  status?: InquiryStatus | "all" | null;
  category?: InquiryCategory | "all" | null;
  q?: string | null;
  limit?: number;
};

export async function inquiryCreate(input: InquiryCreateInput): Promise<CustomerInquiryRecord> {
  const now = new Date().toISOString();
  const category = input.category ?? normalizeInquiryCategory(input.inquiryType);
  const record: CustomerInquiryRecord = {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    status: "new",
    category,
    name: input.name.trim() || "고객",
    contact: input.contact.trim(),
    vehicle: input.vehicle?.trim() || undefined,
    message: input.message.trim(),
    batteryCode: input.batteryCode?.trim() || undefined,
    returnOption: input.returnOption?.trim() || undefined,
    pageUrl: input.pageUrl?.trim() || undefined,
    source: input.source,
    inquiryType: input.inquiryType?.trim() || undefined,
    couponCode: input.couponCode?.trim() || undefined,
    adminMemo: "",
  };
  const records = await loadRecords();
  records.unshift(record);
  await saveRecords(records);
  return record;
}

export async function inquiryList(
  filters: InquiryListFilters = {},
): Promise<CustomerInquiryRecord[]> {
  let records = await loadRecords();
  const status = filters.status?.trim();
  if (status && status !== "all") {
    records = records.filter((r) => r.status === status);
  }
  const category = filters.category?.trim();
  if (category && category !== "all") {
    records = records.filter((r) => r.category === category);
  }
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    records = records.filter((r) => {
      const hay = [
        r.name,
        r.contact,
        r.vehicle,
        r.message,
        r.batteryCode,
        r.inquiryType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }
  const limit = filters.limit ?? 500;
  return records.slice(0, limit);
}

export async function inquiryGetById(id: string): Promise<CustomerInquiryRecord | null> {
  const records = await loadRecords();
  return records.find((r) => r.id === id) ?? null;
}

export async function inquiryUpdateStatus(
  id: string,
  status: InquiryStatus,
): Promise<CustomerInquiryRecord | null> {
  const records = await loadRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const prev = records[idx]!;
  const next: CustomerInquiryRecord = {
    ...prev,
    status,
    updatedAt: new Date().toISOString(),
  };
  records[idx] = next;
  await saveRecords(records);
  return next;
}

export async function inquiryUpdateMemo(
  id: string,
  adminMemo: string,
): Promise<CustomerInquiryRecord | null> {
  const records = await loadRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const prev = records[idx]!;
  const next: CustomerInquiryRecord = {
    ...prev,
    adminMemo: adminMemo.trim(),
    updatedAt: new Date().toISOString(),
  };
  records[idx] = next;
  await saveRecords(records);
  return next;
}

export const INQUIRY_STORE_PATH = STORE_FILE;
