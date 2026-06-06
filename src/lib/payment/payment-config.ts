/**
 * 결제·PG 환경변수 — 토스페이먼츠 확정 (Vercel / .env.local 에만 설정)
 */
export type PaymentProviderId = "toss" | "kcp" | "inicis" | "none";

export function getPaymentProvider(): PaymentProviderId {
  const raw = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (raw === "toss") return "toss";
  if (raw === "kcp" || raw === "inicis") return raw;
  if (process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim() && process.env.TOSS_SECRET_KEY?.trim()) {
    return "toss";
  }
  return "none";
}

export function isTossPaymentEnabled(): boolean {
  return getPaymentProvider() === "toss";
}

export function isTossTestModeFlag(): boolean {
  const secret = process.env.TOSS_SECRET_KEY?.trim();
  const client = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim();
  return Boolean(secret?.startsWith("test_") || client?.startsWith("test_"));
}

export function isCommerceOrderCreateEnabled(): boolean {
  if (process.env.COMMERCE_ORDERS_DISABLED === "true") return false;
  if (process.env.NEXT_PUBLIC_COMMERCE_PAYMENT_LIVE !== "true") return false;
  return true;
}

/** Postgres(DATABASE_URL) 영구 저장소 — production 결제 필수 */
export function isCommerceOrderStoreEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
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
  "DATABASE_URL",
  "PAYMENT_PROVIDER",
  "NEXT_PUBLIC_TOSS_CLIENT_KEY",
  "TOSS_SECRET_KEY",
  "TOSS_API_BASE_URL",
  "KCP_SITE_CODE",
  "KCP_SITE_KEY",
  "INICIS_MID",
  "INICIS_SIGN_KEY",
  "COMMERCE_ORDERS_DISABLED",
  "NEXT_PUBLIC_COMMERCE_PAYMENT_LIVE",
  "NEXT_PUBLIC_SITE_URL",
] as const;
