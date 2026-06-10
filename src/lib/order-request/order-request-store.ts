/**
 * 상담 주문 요청 저장소 파사드 — DATABASE_URL 시 Postgres, dev만 JSON fallback
 */

import path from "node:path";
import {
  assertOperationalStoreAvailable,
  isOperationalDbMode,
} from "@/lib/db/operational-store-config";
import type { PersistedOrderRequest } from "@/types/order-request";

export type { OrderRequestListFilters } from "@/lib/order-request/order-request-store.postgres";

async function getStore() {
  assertOperationalStoreAvailable("order_requests");
  if (isOperationalDbMode()) return import("@/lib/order-request/order-request-store.postgres");
  return import("@/lib/order-request/order-request-store.json");
}

export async function storeCreate(record: PersistedOrderRequest): Promise<PersistedOrderRequest> {
  return (await getStore()).storeCreate(record);
}

export async function storeList(
  filters: import("@/lib/order-request/order-request-store.postgres").OrderRequestListFilters = {},
): Promise<PersistedOrderRequest[]> {
  return (await getStore()).storeList(filters);
}

export async function storeGetById(id: string): Promise<PersistedOrderRequest | null> {
  return (await getStore()).storeGetById(id);
}

export async function storeGetByRequestNumber(
  requestNumber: string,
): Promise<PersistedOrderRequest | null> {
  return (await getStore()).storeGetByRequestNumber(requestNumber);
}

export async function storeUpdate(
  id: string,
  patch: Partial<PersistedOrderRequest>,
): Promise<PersistedOrderRequest | null> {
  return (await getStore()).storeUpdate(id, patch);
}

export async function storeCountForDatePrefix(prefix: string): Promise<number> {
  return (await getStore()).storeCountForDatePrefix(prefix);
}

export const ORDER_REQUEST_STORE_PATH = isOperationalDbMode()
  ? null
  : path.join(process.cwd(), ".data", "order-requests.json");
