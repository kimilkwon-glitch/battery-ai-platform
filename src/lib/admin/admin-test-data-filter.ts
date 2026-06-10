/**
 * 운영 관리자 목록에서 개발·검수·UX 테스트 fixture를 식별합니다.
 * 기본 목록/대시보드는 `order-data-scope`에서 production만 표시합니다.
 */

import { isUx2AdminReviewRecord } from "@/lib/admin/ux2-admin-review-marker";

const TEXT_MARKERS: RegExp[] = [
  /\[AUDIT\]/i,
  /\[UX2-운영검수\]/i,
  /API테스트/,
  /김테스트/,
  /테스트/,
  /운영검수/,
  /개발검수/,
  /기능검수/,
  /검수용/,
  /로컬\s*테스트/,
  /\bfixture\b/i,
  /\bdummy\b/i,
  /\btest\b/i,
  /\bsample\b/i,
  /\bUX\b/i,
];

const TEST_NAME_EXACT = new Set(["API테스트", "김테스트", "테스트고객", "테스트 사용자"]);

const TEST_PHONE_DIGITS = new Set([
  "01099990001",
  "01099999999",
  "01000000000",
  "01012345678",
]);

const TEST_ORDER_NUMBER_RE = /BM-UX2?-|BM-LOCAL-|TEST|DEMO|SEED/i;
const LOCAL_SAMPLE_MEMO_RE = /로컬\s*관리자\s*검수\s*샘플/i;

function normalizePhone(phone: string | undefined | null): string {
  return (phone ?? "").replace(/\D/g, "");
}

function hasTestMarkerText(...parts: (string | undefined | null)[]): boolean {
  const hay = parts.filter(Boolean).join(" ");
  if (!hay.trim()) return false;
  return TEXT_MARKERS.some((re) => re.test(hay));
}

function hasTestPhone(phone: string | undefined | null): boolean {
  const digits = normalizePhone(phone);
  return digits.length > 0 && TEST_PHONE_DIGITS.has(digits);
}

function isPlaceholderGuest(name: string | undefined | null, phone: string | undefined | null): boolean {
  const n = (name ?? "").trim();
  const digits = normalizePhone(phone);
  return n === "홍길동" && (digits === "01000000000" || (phone ?? "").includes("0000-0000"));
}

function hasTestOrderNumber(orderNumber: string | undefined | null): boolean {
  const n = (orderNumber ?? "").trim();
  if (!n) return false;
  return TEST_ORDER_NUMBER_RE.test(n);
}

function isUx2OrSeedRecord(fields: {
  name?: string | null;
  phone?: string | null;
  memo?: string | null;
  orderNumber?: string | null;
  requestMemo?: string | null;
}): boolean {
  return isUx2AdminReviewRecord({
    name: fields.name,
    phone: fields.phone,
    memo: fields.memo ?? fields.requestMemo,
    orderNumber: fields.orderNumber,
  });
}

export function isAdminTestOrderRequest(record: {
  id?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  requestNumber?: string | null;
  memo?: string | null;
  vehicleName?: string | null;
  batterySpecSummary?: string | null;
  productName?: string | null;
}): boolean {
  if (
    isUx2OrSeedRecord({
      name: record.customerName,
      phone: record.customerPhone,
      memo: record.memo,
      orderNumber: record.requestNumber,
    })
  ) {
    return true;
  }
  const name = record.customerName?.trim() ?? "";
  if (TEST_NAME_EXACT.has(name)) return true;
  if (isPlaceholderGuest(name, record.customerPhone)) return true;
  if (hasTestPhone(record.customerPhone)) return true;
  if (hasTestOrderNumber(record.requestNumber)) return true;
  if (
    hasTestMarkerText(
      name,
      record.memo,
      record.vehicleName,
      record.batterySpecSummary,
      record.requestNumber,
      record.productName,
    )
  ) {
    return true;
  }
  if (/BM-20260609/i.test(record.requestNumber ?? "")) return true;
  if (/or_178096/i.test(record.id ?? "")) return true;
  return false;
}

export function isAdminTestOrderRequestRecord(record: {
  id?: string;
  customer?: { name?: string; phone?: string };
  requestNumber?: string | null;
  staffNotes?: string | null;
  vehicle?: { name?: string } | null;
  items?: { batterySpec?: string }[];
}): boolean {
  const batteryLine = record.items?.map((i) => i.batterySpec).filter(Boolean).join(", ");
  return isAdminTestOrderRequest({
    id: record.id,
    customerName: record.customer?.name,
    customerPhone: record.customer?.phone,
    requestNumber: record.requestNumber,
    memo: record.staffNotes,
    vehicleName: record.vehicle?.name,
    batterySpecSummary: batteryLine,
  });
}

export function isAdminTestInquiry(record: {
  name?: string | null;
  contact?: string | null;
  message?: string | null;
  vehicle?: string | null;
  inquiryType?: string | null;
  adminMemo?: string | null;
}): boolean {
  if (
    isUx2OrSeedRecord({
      name: record.name,
      phone: record.contact,
      memo: record.message ?? record.adminMemo,
    })
  ) {
    return true;
  }
  const name = record.name?.trim() ?? "";
  if (TEST_NAME_EXACT.has(name)) return true;
  if (isPlaceholderGuest(name, record.contact)) return true;
  if (hasTestPhone(record.contact)) return true;
  return hasTestMarkerText(name, record.message, record.vehicle, record.inquiryType, record.adminMemo);
}

export function isAdminTestCommerceOrder(record: {
  customerName?: string | null;
  customerPhone?: string | null;
  orderNumber?: string | null;
  requestMemo?: string | null;
  productName?: string | null;
}): boolean {
  if (
    isUx2OrSeedRecord({
      name: record.customerName,
      phone: record.customerPhone,
      requestMemo: record.requestMemo,
      orderNumber: record.orderNumber,
    })
  ) {
    return true;
  }
  const name = record.customerName?.trim() ?? "";
  if (TEST_NAME_EXACT.has(name)) return true;
  if (isPlaceholderGuest(name, record.customerPhone)) return true;
  if (hasTestPhone(record.customerPhone)) return true;
  if (hasTestOrderNumber(record.orderNumber)) return true;
  if (LOCAL_SAMPLE_MEMO_RE.test(record.requestMemo ?? "")) return true;
  return hasTestMarkerText(name, record.requestMemo, record.productName, record.orderNumber);
}

/** 로컬 시드 샘플 (BM-LOCAL) — 운영 목록 기본 제외용 */
export function isAdminLocalSampleOrder(orderNumber: string | undefined | null): boolean {
  const n = (orderNumber ?? "").trim();
  return /BM-LOCAL-/i.test(n);
}

/** @deprecated store 레벨 일괄 제외 — UI `order-data-scope` 사용 권장 */
export function filterAdminTestOrderRequests<T extends Parameters<typeof isAdminTestOrderRequest>[0]>(
  records: T[],
): T[] {
  return records.filter((r) => !isAdminTestOrderRequest(r));
}

/** @deprecated store 레벨 일괄 제외 — UI `order-data-scope` 사용 권장 */
export function filterAdminTestInquiries<T extends Parameters<typeof isAdminTestInquiry>[0]>(
  records: T[],
): T[] {
  return records.filter((r) => !isAdminTestInquiry(r));
}

/** @deprecated store 레벨 일괄 제외 — UI `order-data-scope` 사용 권장 */
export function filterAdminTestCommerceOrders<T extends Parameters<typeof isAdminTestCommerceOrder>[0]>(
  records: T[],
): T[] {
  return records.filter((r) => !isAdminTestCommerceOrder(r));
}
