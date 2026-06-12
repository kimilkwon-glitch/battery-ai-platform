import "server-only";

import {
  commerceOrderAdminMetaUpsert,
  type CommerceOrderAdminMeta,
} from "@/lib/admin/commerce-order-admin-meta-store";
import { deliveryCarrierCodeByName } from "@/lib/delivery/delivery-carriers";
import {
  actionStatusNote,
  canBulkAction,
  nextStatusForAction,
  type OrderBulkAction,
} from "@/lib/admin/order-workbench";
import { commerceToUnifiedRow } from "@/lib/admin/unified-orders";
import { commerceOrderToListItem } from "@/lib/payment/commerce-order-admin-mapper";
import {
  hookAlimtalkOrderCanceled,
  hookAlimtalkOrderConfirmed,
  hookAlimtalkOrderShipped,
} from "@/lib/notifications/alimtalk-hooks.server";
import { storeCommerceOrderGet, storeCommerceOrderUpdate } from "@/lib/payment/commerce-order-store";
import type { CommerceOrderRecord } from "@/types/commerce-payment";

export type BulkOrderTarget = {
  orderId: string;
  channel: "commerce" | "consultation";
};

export type BulkActionResult = {
  orderId: string;
  ok: boolean;
  message?: string;
  order?: CommerceOrderRecord;
  adminMeta?: CommerceOrderAdminMeta;
};

export async function executeBulkOrderAction(input: {
  action: OrderBulkAction;
  targets: BulkOrderTarget[];
  shippingCarrier?: string;
  shippingTrackingNumber?: string;
  adminMemo?: string;
}): Promise<{ results: BulkActionResult[] }> {
  const results: BulkActionResult[] = [];

  for (const target of input.targets) {
    if (target.channel !== "commerce") {
      results.push({
        orderId: target.orderId,
        ok: false,
        message: "자사몰 결제 주문만 처리할 수 있습니다.",
      });
      continue;
    }

    const current = await storeCommerceOrderGet(target.orderId);
    if (!current) {
      results.push({ orderId: target.orderId, ok: false, message: "주문을 찾을 수 없습니다." });
      continue;
    }

    const listItem = commerceOrderToListItem(current);
    const rowLike = commerceToUnifiedRow(listItem);

    const block = canBulkAction(rowLike, input.action);
    if (block) {
      results.push({ orderId: target.orderId, ok: false, message: block });
      continue;
    }

    if (input.action === "save_admin_memo") {
      const adminMeta = await commerceOrderAdminMetaUpsert(target.orderId, {
        adminMemo: input.adminMemo,
      });
      results.push({ orderId: target.orderId, ok: true, adminMeta, order: current });
      continue;
    }

    if (input.action === "ship_order") {
      if (current.fulfillmentType !== "delivery") {
        results.push({
          orderId: target.orderId,
          ok: false,
          message: "택배 주문만 송장 입력이 가능합니다.",
        });
        continue;
      }
      const carrier = input.shippingCarrier?.trim();
      const tracking = input.shippingTrackingNumber?.trim();
      if (!carrier || !tracking) {
        results.push({
          orderId: target.orderId,
          ok: false,
          message: "택배사와 송장번호를 입력해 주세요.",
        });
        continue;
      }
      const nextStatus = nextStatusForAction(current, input.action);
      if (!nextStatus) {
        results.push({ orderId: target.orderId, ok: false, message: "상태 변경에 실패했습니다." });
        continue;
      }
      const now = new Date().toISOString();
      const updated = await storeCommerceOrderUpdate(target.orderId, {
        orderStatus: nextStatus,
        statusHistory: [
          ...current.statusHistory,
          {
            status: nextStatus,
            paymentStatus: current.paymentStatus,
            note: `${actionStatusNote(input.action)} (${carrier} ${tracking})`,
            at: now,
          },
        ],
      });
      const adminMeta = await commerceOrderAdminMetaUpsert(target.orderId, {
        shippingCarrier: carrier,
        shippingTrackingNumber: tracking,
        courierCode: deliveryCarrierCodeByName(carrier),
        shippedAt: now,
        adminMemo: input.adminMemo,
      });
      if (updated) {
        hookAlimtalkOrderShipped(updated, carrier, tracking);
      }
      results.push({
        orderId: target.orderId,
        ok: Boolean(updated),
        order: updated ?? undefined,
        adminMeta,
        message: updated ? undefined : "저장에 실패했습니다.",
      });
      continue;
    }

    const nextStatus = nextStatusForAction(current, input.action);
    if (!nextStatus) {
      results.push({ orderId: target.orderId, ok: false, message: "상태 변경에 실패했습니다." });
      continue;
    }

    const now = new Date().toISOString();
    const updated = await storeCommerceOrderUpdate(target.orderId, {
      orderStatus: nextStatus,
      statusHistory: [
        ...current.statusHistory,
        {
          status: nextStatus,
          paymentStatus: current.paymentStatus,
          note: actionStatusNote(input.action),
          at: now,
        },
      ],
    });

    if (input.adminMemo?.trim()) {
      await commerceOrderAdminMetaUpsert(target.orderId, { adminMemo: input.adminMemo.trim() });
    }

    if (updated) {
      if (input.action === "confirm_order") {
        hookAlimtalkOrderConfirmed(updated);
      }
      if (input.action === "cancel_order") {
        hookAlimtalkOrderCanceled(updated);
      }
    }

    results.push({
      orderId: target.orderId,
      ok: Boolean(updated),
      order: updated ?? undefined,
      message: updated ? undefined : "저장에 실패했습니다.",
    });
  }

  return { results };
}
