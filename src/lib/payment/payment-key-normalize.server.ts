import "server-only";

/** non-empty payment_key만 저장 — 빈 문자열은 NULL */
export function normalizePaymentKey(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
