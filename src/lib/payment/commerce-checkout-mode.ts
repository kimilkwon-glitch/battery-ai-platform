/**
 * 자사몰 결제 라이브 여부 — 클라이언트·서버 공용
 * PG 연동 전: NEXT_PUBLIC_COMMERCE_PAYMENT_LIVE 미설정 또는 false
 */
export function isCommercePaymentLive(): boolean {
  return process.env.NEXT_PUBLIC_COMMERCE_PAYMENT_LIVE === "true";
}
