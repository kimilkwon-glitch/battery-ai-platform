/**
 * 결제·PG 환경변수 후보 (이번 작업에서는 값 불필요)
 * 추후 PG 확정 시 Vercel / .env.local 에만 설정
 */
export type PaymentProviderId = "toss" | "kcp" | "inicis" | "none";

export function getPaymentProvider(): PaymentProviderId {
  const raw = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (raw === "toss" || raw === "kcp" || raw === "inicis") return raw;
  return "none";
}

export function isCommerceOrderCreateEnabled(): boolean {
  if (process.env.COMMERCE_ORDERS_DISABLED === "true") return false;
  return true;
}

export function getSiteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

export const PAYMENT_ENV_KEYS = [
  "PAYMENT_PROVIDER",
  "TOSS_CLIENT_KEY",
  "TOSS_SECRET_KEY",
  "KCP_SITE_CODE",
  "KCP_SITE_KEY",
  "INICIS_MID",
  "INICIS_SIGN_KEY",
  "COMMERCE_ORDERS_DISABLED",
  "NEXT_PUBLIC_SITE_URL",
] as const;
