/** 고객 주문조회 결과용 개인정보 마스킹 */

export function maskCustomerName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "—";
  if (trimmed.length === 1) return "*";
  if (trimmed.length === 2) return `${trimmed[0]}*`;
  return `${trimmed[0]}${"*".repeat(trimmed.length - 2)}${trimmed[trimmed.length - 1]}`;
}

export function maskCustomerPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return "****";
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

/** 상세주소는 비공개, 기본 주소만 일부 표시 */
export function maskCustomerAddressSummary(
  address?: string | null,
  detailAddress?: string | null,
): string {
  const base = address?.trim();
  if (!base) return "—";
  const shortened = base.length > 24 ? `${base.slice(0, 24)}…` : base;
  if (detailAddress?.trim()) {
    return `${shortened} (상세주소 비공개)`;
  }
  return shortened;
}
