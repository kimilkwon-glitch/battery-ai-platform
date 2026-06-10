/**
 * 결제 주문 관리자 메타 파사드 — DATABASE_URL 시 Postgres, dev만 JSON fallback
 */

import path from "node:path";
import {
  assertOperationalStoreAvailable,
  isOperationalDbMode,
} from "@/lib/db/operational-store-config";

export type { CommerceOrderAdminMeta } from "@/lib/admin/commerce-order-admin-meta-store.postgres";

async function getStore() {
  assertOperationalStoreAvailable("order_admin_meta");
  if (isOperationalDbMode()) return import("@/lib/admin/commerce-order-admin-meta-store.postgres");
  return import("@/lib/admin/commerce-order-admin-meta-store.json");
}

export async function commerceOrderAdminMetaGet(orderId: string) {
  return (await getStore()).commerceOrderAdminMetaGet(orderId);
}

export async function commerceOrderAdminMetaListAll() {
  return (await getStore()).commerceOrderAdminMetaListAll();
}

export async function commerceOrderAdminMetaUpsert(
  orderId: string,
  patch: Partial<
    Omit<import("@/lib/admin/commerce-order-admin-meta-store.postgres").CommerceOrderAdminMeta, "orderId" | "updatedAt">
  >,
) {
  return (await getStore()).commerceOrderAdminMetaUpsert(orderId, patch);
}

export const COMMERCE_ORDER_ADMIN_META_PATH = isOperationalDbMode()
  ? null
  : path.join(process.cwd(), ".data", "commerce-order-admin-meta.json");
