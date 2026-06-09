/**
 * 운영 관리자 목록에서 개발·검수용 fixture를 숨깁니다.
 * 실제 고객 데이터는 삭제하지 않고 목록 API에서만 제외합니다.
 */

const TEXT_MARKERS: RegExp[] = [
  /\[AUDIT\]/i,
  /API테스트/,
  /김테스트/,
  /테스트/,
  /개발검수/,
  /기능검수/,
  /검수용/,
  /로컬\s*테스트/,
  /\bfixture\b/i,
  /\bdummy\b/i,
  /\btest\b/i,
  /\bsample\b/i,
];

const TEST_NAME_EXACT = new Set(["API테스트", "김테스트", "테스트고객", "테스트 사용자"]);

const TEST_PHONE_DIGITS = new Set([
  "01099990001",
  "01099999999",
  "01000000000",
  "01012345678",
]);

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

export function isAdminTestOrderRequest(record: {
  id?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  requestNumber?: string | null;
  memo?: string | null;
  vehicleName?: string | null;
  batterySpecSummary?: string | null;
}): boolean {
  const name = record.customerName?.trim() ?? "";
  if (TEST_NAME_EXACT.has(name)) return true;
  if (isPlaceholderGuest(name, record.customerPhone)) return true;
  if (hasTestPhone(record.customerPhone)) return true;
  if (
    hasTestMarkerText(
      name,
      record.memo,
      record.vehicleName,
      record.batterySpecSummary,
      record.requestNumber,
    )
  ) {
    return true;
  }
  const requestNumber = record.requestNumber ?? "";
  if (/BM-20260609/i.test(requestNumber)) {
    return true;
  }
  if (/or_178096/i.test(record.id ?? "")) {
    return true;
  }
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
}): boolean {
  const name = record.name?.trim() ?? "";
  if (TEST_NAME_EXACT.has(name)) return true;
  if (isPlaceholderGuest(name, record.contact)) return true;
  if (hasTestPhone(record.contact)) return true;
  return hasTestMarkerText(name, record.message, record.vehicle, record.inquiryType);
}

export function isAdminTestCommerceOrder(record: {
  customerName?: string | null;
  customerPhone?: string | null;
  orderNumber?: string | null;
  requestMemo?: string | null;
  productName?: string | null;
}): boolean {
  const name = record.customerName?.trim() ?? "";
  if (TEST_NAME_EXACT.has(name)) return true;
  if (isPlaceholderGuest(name, record.customerPhone)) return true;
  if (hasTestPhone(record.customerPhone)) return true;
  return hasTestMarkerText(name, record.requestMemo, record.productName, record.orderNumber);
}

export function filterAdminTestOrderRequests<T extends Parameters<typeof isAdminTestOrderRequest>[0]>(
  records: T[],
): T[] {
  return records.filter((r) => !isAdminTestOrderRequest(r));
}

export function filterAdminTestInquiries<T extends Parameters<typeof isAdminTestInquiry>[0]>(
  records: T[],
): T[] {
  return records.filter((r) => !isAdminTestInquiry(r));
}

export function filterAdminTestCommerceOrders<T extends Parameters<typeof isAdminTestCommerceOrder>[0]>(
  records: T[],
): T[] {
  return records.filter((r) => !isAdminTestCommerceOrder(r));
}
