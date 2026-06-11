import "server-only";

import {
  commerceOrderAdminMetaGet,
  commerceOrderAdminMetaListAll,
  commerceOrderAdminMetaUpsert,
} from "@/lib/admin/commerce-order-admin-meta-store";
import { resolveDeliveryCarrier } from "@/lib/delivery/delivery-carriers";
import { isDeliveryTrackDelivered } from "@/lib/delivery/delivery-delivered-check";
import { fetchSweetTrackerTracking } from "@/lib/delivery/sweettracker-fetch";
import type { DeliveryTrackError, DeliveryTrackResult } from "@/lib/delivery/sweettracker-types";
import { COMMERCE_LIFECYCLE_LABELS } from "@/types/commerce-order";
import {
  storeCommerceOrderGet,
  storeCommerceOrderListItems,
  storeCommerceOrderUpdate,
} from "@/lib/payment/commerce-order-store";
import type { AdminCommerceOrderListItem } from "@/lib/payment/commerce-order-admin-mapper";

import {
  DELIVERY_SYNC_DEFAULT_LIMIT,
  DELIVERY_SYNC_MAX_LIMIT,
  getDeliverySyncSkipReason,
} from "@/lib/delivery/delivery-sync-policy";

export {
  DELIVERY_SYNC_DEFAULT_LIMIT,
  DELIVERY_SYNC_MAX_LIMIT,
} from "@/lib/delivery/delivery-sync-policy";

export type DeliveryTrackFetcher = (
  courierCode: string,
  invoiceNumber: string,
) => Promise<DeliveryTrackResult | DeliveryTrackError>;

export type DeliverySyncResultItem = {
  orderId: string;
  orderNumber: string;
  courierName: string;
  invoiceNumber: string;
  previousStatus: string;
  sweettrackerStatus: string;
  updatedStatus: string | null;
  changed: boolean;
  message: string;
};

export type DeliverySyncResponse = {
  ok: true;
  checked: number;
  updated: number;
  skipped: number;
  results: DeliverySyncResultItem[];
};

type SyncCandidate = {
  order: AdminCommerceOrderListItem;
  courierCode: string;
  courierName: string;
  invoiceNumber: string;
};

export type DeliverySyncRequest = {
  mode: "selected" | "inTransit";
  orderIds?: string[];
  limit?: number;
};

function statusLabel(status: string): string {
  return COMMERCE_LIFECYCLE_LABELS[status as keyof typeof COMMERCE_LIFECYCLE_LABELS] ?? status;
}

function resolveCourierFromMeta(meta: Awaited<ReturnType<typeof commerceOrderAdminMetaGet>>) {
  if (!meta) return null;
  return resolveDeliveryCarrier({
    courierCode: meta.courierCode,
    courierName: meta.shippingCarrier,
  });
}

async function buildCandidate(order: AdminCommerceOrderListItem): Promise<SyncCandidate | null> {
  const skipReason = getDeliverySyncSkipReason(order);
  if (skipReason) return null;

  const meta = await commerceOrderAdminMetaGet(order.orderId);
  const invoiceNumber = meta?.shippingTrackingNumber?.trim();
  const courier = resolveCourierFromMeta(meta);
  if (!courier || !invoiceNumber) return null;

  return {
    order,
    courierCode: courier.code,
    courierName: courier.name,
    invoiceNumber,
  };
}

async function listInTransitCandidates(limit: number): Promise<SyncCandidate[]> {
  const orders = await storeCommerceOrderListItems(500);
  const out: SyncCandidate[] = [];

  for (const order of orders) {
    const candidate = await buildCandidate(order);
    if (candidate) out.push(candidate);
  }

  out.sort(
    (a, b) => new Date(b.order.createdAt).getTime() - new Date(a.order.createdAt).getTime(),
  );
  return out.slice(0, limit);
}

async function listSelectedCandidates(orderIds: string[]): Promise<SyncCandidate[]> {
  const unique = [...new Set(orderIds.map((id) => id.trim()).filter(Boolean))].slice(
    0,
    DELIVERY_SYNC_MAX_LIMIT,
  );
  const out: SyncCandidate[] = [];

  for (const orderId of unique) {
    const orderRecord = await storeCommerceOrderGet(orderId);
    if (!orderRecord) continue;
    const order: AdminCommerceOrderListItem = {
      orderId: orderRecord.orderId,
      orderNumber: orderRecord.orderNumber,
      createdAt: orderRecord.createdAt,
      userId: orderRecord.userId,
      customerName: orderRecord.customerName,
      customerPhone: orderRecord.customerPhone,
      customerType: orderRecord.customerType,
      vehicleName: orderRecord.vehicleName,
      productName: orderRecord.productName,
      brand: orderRecord.brand,
      batteryCode: orderRecord.batteryCode,
      fulfillmentType: orderRecord.fulfillmentType,
      returnBatteryOption: orderRecord.returnBatteryOption,
      orderStatus: orderRecord.orderStatus,
      paymentStatus: orderRecord.paymentStatus,
      finalAmount: orderRecord.finalAmount,
    };
    const candidate = await buildCandidate(order);
    if (candidate) out.push(candidate);
  }

  return out;
}

async function applyDeliveredStatus(orderId: string): Promise<boolean> {
  const current = await storeCommerceOrderGet(orderId);
  if (!current || current.orderStatus === "delivered") return false;

  const now = new Date().toISOString();
  await storeCommerceOrderUpdate(orderId, {
    orderStatus: "delivered",
    statusHistory: [
      ...current.statusHistory,
      {
        status: "delivered",
        paymentStatus: current.paymentStatus,
        note: "스윗트래커 배송완료 확인 반영",
        at: now,
      },
    ],
  });
  return true;
}

async function syncOneCandidate(
  candidate: SyncCandidate,
  trackFetcher: DeliveryTrackFetcher,
): Promise<DeliverySyncResultItem> {
  const { order, courierCode, courierName, invoiceNumber } = candidate;
  const previousStatus = statusLabel(order.orderStatus);
  const now = new Date().toISOString();

  const track = await trackFetcher(courierCode, invoiceNumber);

  if (!track.ok) {
    await commerceOrderAdminMetaUpsert(order.orderId, {
      lastDeliveryCheckedAt: now,
      lastDeliveryStatus: null,
      lastDeliveryMessage: track.message,
    });
    return {
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      courierName,
      invoiceNumber,
      previousStatus,
      sweettrackerStatus: "조회불가",
      updatedStatus: null,
      changed: false,
      message: track.message,
    };
  }

  const delivered = isDeliveryTrackDelivered(track);
  await commerceOrderAdminMetaUpsert(order.orderId, {
    lastDeliveryCheckedAt: now,
    lastDeliveryStatus: track.status,
    lastDeliveryMessage: delivered ? "배송완료 확인" : null,
  });

  if (!delivered) {
    return {
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      courierName,
      invoiceNumber,
      previousStatus,
      sweettrackerStatus: track.status,
      updatedStatus: null,
      changed: false,
      message: "배송중 — 상태 유지",
    };
  }

  const changed = await applyDeliveredStatus(order.orderId);
  const updatedStatus = statusLabel("delivered");

  return {
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    courierName,
    invoiceNumber,
    previousStatus,
    sweettrackerStatus: track.status,
    updatedStatus: changed ? updatedStatus : previousStatus,
    changed,
    message: changed ? "배송완료로 반영했습니다." : "이미 배송완료 상태입니다.",
  };
}

export async function runDeliveryStatusSync(
  input: DeliverySyncRequest,
  deps?: { trackFetcher?: DeliveryTrackFetcher },
): Promise<DeliverySyncResponse> {
  const trackFetcher = deps?.trackFetcher ?? fetchSweetTrackerTracking;
  const limit = Math.min(
    DELIVERY_SYNC_MAX_LIMIT,
    Math.max(1, input.limit ?? DELIVERY_SYNC_DEFAULT_LIMIT),
  );

  let candidates: SyncCandidate[] = [];
  if (input.mode === "selected") {
    candidates = await listSelectedCandidates(input.orderIds ?? []);
  } else {
    candidates = await listInTransitCandidates(limit);
  }

  const results: DeliverySyncResultItem[] = [];
  for (const candidate of candidates) {
    results.push(await syncOneCandidate(candidate, trackFetcher));
  }

  const updated = results.filter((r) => r.changed).length;
  const skipped = results.length - updated;

  return {
    ok: true,
    checked: results.length,
    updated,
    skipped,
    results,
  };
}

/** inTransit 후보 수 (UI 안내용) */
export async function countInTransitSyncCandidates(): Promise<number> {
  const metas = await commerceOrderAdminMetaListAll();
  const metaById = new Map(metas.map((m) => [m.orderId, m]));
  const orders = await storeCommerceOrderListItems(500);
  let count = 0;
  for (const order of orders) {
    if (getDeliverySyncSkipReason(order) !== null) continue;
    const meta = metaById.get(order.orderId);
    const invoice = meta?.shippingTrackingNumber?.trim();
    const courier = resolveCourierFromMeta(meta ?? null);
    if (courier && invoice) count += 1;
  }
  return count;
}
