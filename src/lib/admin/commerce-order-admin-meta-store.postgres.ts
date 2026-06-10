import "server-only";

import { ensureOperationalSchema } from "@/lib/db/ensure-operational-schema";
import { getSql } from "@/lib/db/postgres";

export type CommerceOrderAdminMeta = {
  orderId: string;
  adminMemo?: string;
  shippingCarrier?: string;
  shippingTrackingNumber?: string;
  updatedAt: string;
};

type MetaRow = {
  order_id: string;
  admin_memo: string | null;
  shipping_carrier: string | null;
  shipping_tracking_number: string | null;
  updated_at: string;
};

function rowToMeta(row: MetaRow): CommerceOrderAdminMeta {
  return {
    orderId: row.order_id,
    adminMemo: row.admin_memo ?? undefined,
    shippingCarrier: row.shipping_carrier ?? undefined,
    shippingTrackingNumber: row.shipping_tracking_number ?? undefined,
    updatedAt: row.updated_at,
  };
}

export async function commerceOrderAdminMetaGet(
  orderId: string,
): Promise<CommerceOrderAdminMeta | null> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM commerce_order_admin_meta WHERE order_id = ${orderId} LIMIT 1
  `) as MetaRow[];
  return rows[0] ? rowToMeta(rows[0]) : null;
}

export async function commerceOrderAdminMetaListAll(): Promise<CommerceOrderAdminMeta[]> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM commerce_order_admin_meta ORDER BY updated_at DESC`) as MetaRow[];
  return rows.map(rowToMeta);
}

export async function commerceOrderAdminMetaUpsert(
  orderId: string,
  patch: Partial<Omit<CommerceOrderAdminMeta, "orderId" | "updatedAt">>,
): Promise<CommerceOrderAdminMeta> {
  await ensureOperationalSchema();
  const sql = getSql();
  const prev = await commerceOrderAdminMetaGet(orderId);
  const now = new Date().toISOString();
  const next: CommerceOrderAdminMeta = {
    orderId,
    adminMemo: patch.adminMemo ?? prev?.adminMemo,
    shippingCarrier: patch.shippingCarrier ?? prev?.shippingCarrier,
    shippingTrackingNumber: patch.shippingTrackingNumber ?? prev?.shippingTrackingNumber,
    updatedAt: now,
  };

  await sql`
    INSERT INTO commerce_order_admin_meta (
      order_id, admin_memo, shipping_carrier, shipping_tracking_number, updated_at
    ) VALUES (
      ${orderId},
      ${next.adminMemo ?? ""},
      ${next.shippingCarrier ?? null},
      ${next.shippingTrackingNumber ?? null},
      ${now}
    )
    ON CONFLICT (order_id) DO UPDATE SET
      admin_memo = EXCLUDED.admin_memo,
      shipping_carrier = EXCLUDED.shipping_carrier,
      shipping_tracking_number = EXCLUDED.shipping_tracking_number,
      updated_at = EXCLUDED.updated_at
  `;
  return next;
}
