import { isPostgresConfigured } from "@/lib/db/postgres";
import type { CommerceOrderRecord } from "@/types/commerce-payment";

export function isCommerceOrderStoreReady(): boolean {
  return isPostgresConfigured();
}

async function getPostgresStore() {
  return import("@/lib/payment/commerce-order-store.postgres");
}

function storeUnavailableError(): never {
  throw new Error("COMMERCE_STORE_UNAVAILABLE");
}

export async function storeCommerceOrderCreate(
  record: CommerceOrderRecord,
): Promise<CommerceOrderRecord> {
  if (!isPostgresConfigured()) return storeUnavailableError();
  const pg = await getPostgresStore();
  return pg.pgStoreCommerceOrderCreate(record);
}

export async function storeCommerceOrderGet(
  orderId: string,
): Promise<CommerceOrderRecord | null> {
  if (!isPostgresConfigured()) return null;
  const pg = await getPostgresStore();
  return pg.pgStoreCommerceOrderGet(orderId);
}

export async function storeCommerceOrderUpdate(
  orderId: string,
  patch: Partial<CommerceOrderRecord>,
): Promise<CommerceOrderRecord | null> {
  if (!isPostgresConfigured()) return null;
  const pg = await getPostgresStore();
  return pg.pgStoreCommerceOrderUpdate(orderId, patch);
}

export async function storeCommerceOrderCountByPrefix(prefix: string): Promise<number> {
  if (!isPostgresConfigured()) return 0;
  const pg = await getPostgresStore();
  return pg.pgStoreCommerceOrderCountByPrefix(prefix);
}

export async function storeCommerceOrderList(limit = 200): Promise<CommerceOrderRecord[]> {
  if (!isPostgresConfigured()) return [];
  const pg = await getPostgresStore();
  return pg.pgStoreCommerceOrderList(limit);
}

export async function storeCommerceOrderListByUserId(
  userId: string,
  limit = 50,
): Promise<CommerceOrderRecord[]> {
  if (!isPostgresConfigured()) return [];
  const pg = await getPostgresStore();
  return pg.pgStoreCommerceOrderListByUserId(userId, limit);
}

export async function storeCommerceOrderLookupByRef(
  orderRef: string,
): Promise<CommerceOrderRecord | null> {
  if (!isPostgresConfigured()) return null;
  const pg = await getPostgresStore();
  return pg.pgStoreCommerceOrderLookupByRef(orderRef);
}
