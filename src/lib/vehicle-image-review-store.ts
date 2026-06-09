/**
 * 차량 이미지 검수 상태 — JSON persistence (이미지 파일 덮어쓰기 없음)
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  VehicleImageReviewRecord,
  VehicleImageReviewStatus,
} from "@/lib/vehicle-image-review-shared";

export type { VehicleImageReviewRecord, VehicleImageReviewStatus } from "@/lib/vehicle-image-review-shared";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "vehicle-image-reviews.json");

type StorePayload = {
  version: 1;
  records: VehicleImageReviewRecord[];
};

const globalCache = globalThis as typeof globalThis & {
  __bmVehicleImageReviewStore?: VehicleImageReviewRecord[];
};

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function loadRecords(): Promise<VehicleImageReviewRecord[]> {
  if (globalCache.__bmVehicleImageReviewStore) return globalCache.__bmVehicleImageReviewStore;
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as StorePayload;
    if (parsed?.version === 1 && Array.isArray(parsed.records)) {
      globalCache.__bmVehicleImageReviewStore = parsed.records;
      return parsed.records;
    }
  } catch {
    /* first run */
  }
  globalCache.__bmVehicleImageReviewStore = [];
  return [];
}

async function saveRecords(records: VehicleImageReviewRecord[]): Promise<void> {
  globalCache.__bmVehicleImageReviewStore = records;
  await ensureDataDir();
  await writeFile(STORE_FILE, JSON.stringify({ version: 1, records }, null, 2), "utf8");
}

export async function listVehicleImageReviews(): Promise<VehicleImageReviewRecord[]> {
  return loadRecords();
}

export async function getVehicleImageReview(
  slug: string,
): Promise<VehicleImageReviewRecord | null> {
  const records = await loadRecords();
  return records.find((r) => r.slug === slug) ?? null;
}

export async function upsertVehicleImageReview(
  input: Omit<VehicleImageReviewRecord, "updatedAt"> & { updatedAt?: string },
): Promise<VehicleImageReviewRecord> {
  const records = await loadRecords();
  const now = new Date().toISOString();
  const next: VehicleImageReviewRecord = {
    slug: input.slug,
    status: input.status,
    adminMemo: input.adminMemo?.trim() ?? "",
    selectedReferenceUrl: input.selectedReferenceUrl ?? null,
    candidateImageUrl: input.candidateImageUrl ?? null,
    updatedAt: input.updatedAt ?? now,
  };
  const idx = records.findIndex((r) => r.slug === input.slug);
  if (idx >= 0) records[idx] = next;
  else records.push(next);
  await saveRecords(records);
  return next;
}
