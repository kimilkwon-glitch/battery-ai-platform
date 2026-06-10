/** UX2 운영검수 30명 페르소나 식별 (관리자 노출·cleanup 공용) */

export const UX2_NAME_PREFIX = "[UX2-운영검수]";
export const UX2_ADMIN_MEMO = "UX2_ADMIN_REVIEW";
export const UX2_ORDER_TYPE = "ux2_admin_review";
export const UX2_ORDER_NUMBER_PREFIX = "BM-UX2-";
export const UX2_PERSONA_ID_RE = /\bUX2-(0[1-9]|[12]\d|30)\b/;
export const UX2_PHONE_PREFIX = "010910000";
export const UX2_EMAIL_DOMAIN = "@example.com";

export function normalizeUx2PhoneDigits(phone: string | null | undefined): string {
  return (phone ?? "").replace(/\D/g, "");
}

export function isUx2AdminReviewPhone(phone: string | null | undefined): boolean {
  const digits = normalizeUx2PhoneDigits(phone);
  if (!digits.startsWith(UX2_PHONE_PREFIX) || digits.length !== 11) return false;
  const seq = Number(digits.slice(-2));
  return seq >= 1 && seq <= 30;
}

export function isUx2AdminReviewOrderNumber(orderNumber: string | null | undefined): boolean {
  return (orderNumber ?? "").startsWith(UX2_ORDER_NUMBER_PREFIX);
}

export function formatUx2Phone(seq: number): string {
  return `010-9100-${String(seq).padStart(4, "0")}`;
}

export function formatUx2Email(seq: number): string {
  return `ux2-review-${String(seq).padStart(3, "0")}${UX2_EMAIL_DOMAIN}`;
}

export function formatUx2CustomerName(name: string, personaId: string): string {
  return `${UX2_NAME_PREFIX} ${name.trim()} · ${personaId}`;
}

export function formatUx2RequestMemo(personaId: string, channel: string, note?: string): string {
  const base = `${UX2_NAME_PREFIX} order_type:${UX2_ORDER_TYPE} persona:${personaId} channel:${channel}`;
  return note ? `${base} note:${note}` : base;
}

export function isUx2AdminReviewRecord(parts: {
  name?: string | null;
  phone?: string | null;
  contact?: string | null;
  memo?: string | null;
  requestMemo?: string | null;
  adminMemo?: string | null;
  orderNumber?: string | null;
  message?: string | null;
  email?: string | null;
}): boolean {
  const phone = parts.phone ?? parts.contact;
  if (!isUx2AdminReviewPhone(phone)) return false;

  if (isUx2AdminReviewOrderNumber(parts.orderNumber)) return true;

  const hay = [
    parts.name,
    parts.memo,
    parts.requestMemo,
    parts.adminMemo,
    parts.orderNumber,
    parts.message,
    parts.email,
  ]
    .filter(Boolean)
    .join(" ");

  if ((parts.name ?? "").includes(UX2_NAME_PREFIX)) return true;
  if (hay.includes(`order_type:${UX2_ORDER_TYPE}`)) return true;
  if (hay.includes(UX2_ADMIN_MEMO)) return true;
  if (UX2_PERSONA_ID_RE.test(hay)) return true;
  if ((parts.email ?? "").startsWith("ux2-review-")) return true;

  return false;
}
