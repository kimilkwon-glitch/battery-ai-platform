import { randomBytes } from "node:crypto";
import { toPersistedOrderRequest } from "@/lib/order-request/order-request-api";
import { normalizePhoneDigits } from "@/lib/order-request/order-request-lookup";
import { maskPhone } from "@/lib/order-request/order-request-summary";
import {
  storeCountForDatePrefix,
  storeCreate,
  storeGetById,
  storeGetByRequestNumber,
  storeList,
  storeUpdate,
  type OrderRequestListFilters,
} from "@/lib/order-request/order-request-store";
import type {
  AdminOrderRequestListItem,
  CreateOrderRequestInput,
  PersistedOrderRequest,
  UpdateOrderRequestInput,
} from "@/types/order-request";

export function generateOrderRequestId(): string {
  return `or_${Date.now()}_${randomBytes(4).toString("hex")}`;
}

/** BM-YYYYMMDD-NNNN — 실제 DB 도입 시 unique index로 보강 */
export async function generateRequestNumber(date = new Date()): Promise<string> {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const prefix = `BM-${y}${m}${d}-`;
  const count = await storeCountForDatePrefix(prefix);
  const seq = String(count + 1).padStart(4, "0");
  return `${prefix}${seq}`;
}

export async function createOrderRequest(
  input: CreateOrderRequestInput,
): Promise<PersistedOrderRequest> {
  const id = generateOrderRequestId();
  const requestNumber = await generateRequestNumber();
  const record = toPersistedOrderRequest(input, id, requestNumber);
  return storeCreate(record);
}

export async function listOrderRequests(
  filters: OrderRequestListFilters = {},
): Promise<AdminOrderRequestListItem[]> {
  const rows = await storeList(filters);
  return rows.map(toAdminListItem);
}

export async function getOrderRequestById(
  id: string,
): Promise<PersistedOrderRequest | null> {
  return storeGetById(id);
}

/** 접수번호 + 연락처 검증 조회 (고객용) */
export async function lookupOrderRequest(
  requestNumber: string,
  phone: string,
): Promise<PersistedOrderRequest | null> {
  const record = await storeGetByRequestNumber(requestNumber);
  if (!record) return null;
  const inputDigits = normalizePhoneDigits(phone);
  const storedDigits = normalizePhoneDigits(record.customerPhone);
  if (!inputDigits || inputDigits !== storedDigits) return null;
  return record;
}

export async function updateOrderRequest(
  id: string,
  patch: UpdateOrderRequestInput,
): Promise<PersistedOrderRequest | null> {
  const prev = await storeGetById(id);
  if (!prev) return null;

  const now = new Date().toISOString();
  const next: Partial<PersistedOrderRequest> = {
    updatedAt: now,
  };

  if (patch.status !== undefined) {
    next.status = patch.status;
    if (patch.status === "contacted" && !prev.contactedAt) {
      next.contactedAt = patch.contactedAt ?? now;
    }
    if (patch.status === "closed" && !prev.closedAt) {
      next.closedAt = patch.closedAt ?? now;
    }
  }
  if (patch.internalMemo !== undefined) next.internalMemo = patch.internalMemo;
  if (patch.reviewFlags !== undefined) next.reviewFlags = patch.reviewFlags;
  if (patch.contactedAt !== undefined) next.contactedAt = patch.contactedAt ?? undefined;
  if (patch.closedAt !== undefined) next.closedAt = patch.closedAt ?? undefined;

  return storeUpdate(id, next);
}

function toAdminListItem(row: PersistedOrderRequest): AdminOrderRequestListItem {
  const vehicleParts = [row.vehicleName, row.vehicleYear].filter(Boolean);
  return {
    id: row.id,
    requestNumber: row.requestNumber,
    status: row.status,
    customerName: row.customerName || "(이름 없음)",
    customerPhoneMasked: maskPhone(row.customerPhone),
    customerType: row.customerType ?? (row.source === "guest_form" ? "guest" : "member"),
    vehicleSummary: vehicleParts.join(" · ") || "차량 미입력",
    batterySpecSummary: row.batterySpecSummary || "규격 미입력",
    usedBatteryReturnOption: row.usedBatteryReturnOption,
    fulfillmentMethod: row.fulfillmentMethod,
    storeId: row.storeId,
    reviewFlags: row.reviewFlags,
    hasInternalMemo: Boolean(row.internalMemo?.trim()),
    createdAt: row.createdAt,
  };
}

