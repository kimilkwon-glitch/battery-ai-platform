import "server-only";

import { ensureOperationalSchema } from "@/lib/db/ensure-operational-schema";
import { getSql } from "@/lib/db/postgres";

export type CommerceOrderAdminMeta = {
  orderId: string;
  adminMemo?: string;
  /** 택배사 표시명 (courierName) */
  shippingCarrier?: string;
  /** 운송장번호 (invoiceNumber) */
  shippingTrackingNumber?: string;
  /** 스윗트래커 t_code */
  courierCode?: string;
  shippedAt?: string;
  lastDeliveryCheckedAt?: string;
  lastDeliveryStatus?: string | null;
  lastDeliveryMessage?: string | null;
  updatedAt: string;
};

type MetaRow = {
  order_id: string;
  admin_memo: string | null;
  shipping_carrier: string | null;
  shipping_tracking_number: string | null;
  courier_code: string | null;
  shipped_at: string | null;
  last_delivery_checked_at: string | null;
  last_delivery_status: string | null;
  last_delivery_message: string | null;
  updated_at: string;
};

function rowToMeta(row: MetaRow): CommerceOrderAdminMeta {
  return {
    orderId: row.order_id,
    adminMemo: row.admin_memo ?? undefined,
    shippingCarrier: row.shipping_carrier ?? undefined,
    shippingTrackingNumber: row.shipping_tracking_number ?? undefined,
    courierCode: row.courier_code ?? undefined,
    shippedAt: row.shipped_at ?? undefined,
    lastDeliveryCheckedAt: row.last_delivery_checked_at ?? undefined,
    lastDeliveryStatus: row.last_delivery_status ?? undefined,
    lastDeliveryMessage: row.last_delivery_message ?? undefined,
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
    courierCode: patch.courierCode ?? prev?.courierCode,
    shippedAt: patch.shippedAt ?? prev?.shippedAt,
    lastDeliveryCheckedAt: patch.lastDeliveryCheckedAt ?? prev?.lastDeliveryCheckedAt,
    lastDeliveryStatus:
      patch.lastDeliveryStatus !== undefined ? patch.lastDeliveryStatus : prev?.lastDeliveryStatus,
    lastDeliveryMessage:
      patch.lastDeliveryMessage !== undefined ? patch.lastDeliveryMessage : prev?.lastDeliveryMessage,
    updatedAt: now,
  };

  await sql`
    INSERT INTO commerce_order_admin_meta (
      order_id, admin_memo, shipping_carrier, shipping_tracking_number,
      courier_code, shipped_at, last_delivery_checked_at, last_delivery_status,
      last_delivery_message, updated_at
    ) VALUES (
      ${orderId},
      ${next.adminMemo ?? ""},
      ${next.shippingCarrier ?? null},
      ${next.shippingTrackingNumber ?? null},
      ${next.courierCode ?? null},
      ${next.shippedAt ?? null},
      ${next.lastDeliveryCheckedAt ?? null},
      ${next.lastDeliveryStatus ?? null},
      ${next.lastDeliveryMessage ?? null},
      ${now}
    )
    ON CONFLICT (order_id) DO UPDATE SET
      admin_memo = EXCLUDED.admin_memo,
      shipping_carrier = EXCLUDED.shipping_carrier,
      shipping_tracking_number = EXCLUDED.shipping_tracking_number,
      courier_code = EXCLUDED.courier_code,
      shipped_at = EXCLUDED.shipped_at,
      last_delivery_checked_at = EXCLUDED.last_delivery_checked_at,
      last_delivery_status = EXCLUDED.last_delivery_status,
      last_delivery_message = EXCLUDED.last_delivery_message,
      updated_at = EXCLUDED.updated_at
  `;
  return next;
}
