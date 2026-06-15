import { normalizePhoneDigits } from "@/lib/order-request/order-request-lookup";

/** 주문 저장 규칙과 동일 — trim + 연속 공백 1칸 */
export function normalizeCustomerLookupName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/** 연락처 — 숫자만 (하이픈 무관) */
export function normalizeCustomerLookupPhone(phone: string): string {
  return normalizePhoneDigits(phone);
}

export function isValidCustomerLookupInput(name: string, phone: string): boolean {
  return normalizeCustomerLookupName(name).length > 0 && normalizeCustomerLookupPhone(phone).length >= 9;
}
