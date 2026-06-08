/**
 * 고객 접수번호 조회 — 공개 DTO 매핑 (13차)
 * internalMemo, reviewFlags, 서버 id, 전체 연락처 미포함
 */

import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import { CUSTOMER_ORDER_REQUEST_STATUS } from "@/lib/order-request/order-request-customer-status";
import type {
  CustomerOrderRequestLookup,
  OrderRequestStoreId,
  OrderRequestUsedBatteryOption,
  PersistedOrderRequest,
} from "@/types/order-request";

const STORE_LABELS: Record<Exclude<OrderRequestStoreId, "undecided">, string> = {
  deokcheon: "덕천점",
  hakjang: "학장점",
};

const USED_BATTERY_LABELS: Record<OrderRequestUsedBatteryOption, string> = {
  return: "반납",
  no_return: "미반납",
  unknown: "상담 시 확인",
};

export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** 고객명 일부 마스킹 */
/** 출장 지역·주소 일부 마스킹 */
export function maskRequestedRegion(region: string | undefined): string | undefined {
  const trimmed = region?.trim();
  if (!trimmed) return undefined;
  if (trimmed.length <= 6) return `${trimmed.slice(0, 2)}***`;
  return `${trimmed.slice(0, 8)}…`;
}

export function maskCustomerName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "고객";
  if (trimmed.length === 1) return `${trimmed}*`;
  if (trimmed.length === 2) return `${trimmed[0]}*`;
  return `${trimmed[0]}${"*".repeat(Math.min(trimmed.length - 2, 4))}${trimmed.slice(-1)}`;
}

export function toCustomerOrderRequestLookup(
  record: PersistedOrderRequest,
): CustomerOrderRequestLookup {
  const statusCopy = CUSTOMER_ORDER_REQUEST_STATUS[record.status];
  const products = record.itemsJson
    .map((i) => i.productName || i.batterySpec)
    .filter(Boolean);

  return {
    requestNumber: record.requestNumber,
    status: record.status,
    statusLabel: statusCopy.label,
    statusDescription: statusCopy.description,
    customerGuide: statusCopy.guide,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    customerNameMasked: maskCustomerName(record.customerName),
    vehicleName: record.vehicleName,
    vehicleYear: record.vehicleYear,
    batterySpecSummary: record.batterySpecSummary,
    productSummaries: products.length > 0 ? products : [record.batterySpecSummary].filter(Boolean),
    usedBatteryReturnOption: record.usedBatteryReturnOption,
    usedBatteryReturnLabel: USED_BATTERY_LABELS[record.usedBatteryReturnOption],
    fulfillmentMethod: record.fulfillmentMethod,
    fulfillmentLabel: FULFILLMENT_METHOD_LABELS[record.fulfillmentMethod],
    storeLabel:
      record.storeId && record.storeId !== "undecided"
        ? STORE_LABELS[record.storeId]
        : undefined,
    requestedRegion: maskRequestedRegion(record.requestedRegion),
    preferredTime: record.preferredTime,
    customerMemo: record.memo?.trim() || undefined,
  };
}

export type LookupValidationResult =
  | { ok: true; requestNumber: string; phone: string }
  | { ok: false; errors: string[] };

export function validateLookupInput(body: unknown): LookupValidationResult {
  const errors: string[] = [];
  if (!body || typeof body !== "object") {
    return { ok: false, errors: ["요청 형식이 올바르지 않습니다."] };
  }
  const b = body as Record<string, unknown>;
  if (b.website && String(b.website).trim()) {
    return { ok: false, errors: ["요청을 처리할 수 없습니다."] };
  }
  const requestNumber = String(b.requestNumber ?? "").trim();
  const phone = String(b.phone ?? "").trim();
  if (!requestNumber) errors.push("주문번호를 입력해 주세요.");
  if (!phone) errors.push("연락처를 입력해 주세요.");
  const digits = normalizePhoneDigits(phone);
  if (phone && digits.length < 9) errors.push("연락처 형식을 확인해 주세요.");
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, requestNumber, phone };
}
