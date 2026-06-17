import "server-only";

/**
 * 하위 호환 — 신규 코드는 rate-limit.server.ts 사용
 */
export { getTrustedClientIp, getClientIp } from "@/lib/security/client-ip.server";
export {
  clearRateLimitByKey as clearIpRateLimit,
  consumeRateLimitByKey as checkIpRateLimit,
} from "@/lib/security/rate-limit.server";
