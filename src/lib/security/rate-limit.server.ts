import "server-only";

import {
  hashRateLimitIdentity,
  hashRateLimitIp,
  isRateLimitHashConfigured,
} from "@/lib/security/rate-limit-hash.server";
import {
  memoryRateLimitAdapter,
  type RateLimitAdapter,
  type RateLimitConsumeResult,
  type RateLimitPolicy,
} from "@/lib/security/rate-limit-memory.server";
import {
  isPostgresRateLimitAvailable,
  postgresRateLimitAdapter,
} from "@/lib/security/rate-limit-postgres.server";

export type { RateLimitConsumeResult, RateLimitPolicy };

let testAdapter: RateLimitAdapter | null | undefined;

export function setRateLimitAdapterForTests(adapter: RateLimitAdapter | null | undefined): void {
  testAdapter = adapter;
}

function resolveAdapter(): RateLimitAdapter | null {
  if (testAdapter !== undefined) return testAdapter;
  const forced = process.env.BM_RATE_LIMIT_ADAPTER?.trim();
  if (forced === "memory") return memoryRateLimitAdapter;
  if (forced === "postgres") {
    return isPostgresRateLimitAvailable() ? postgresRateLimitAdapter : null;
  }
  if (process.env.NODE_ENV === "test" || process.env.BM_VERIFY_TSX === "1") {
    return memoryRateLimitAdapter;
  }
  if (isPostgresRateLimitAvailable()) return postgresRateLimitAdapter;
  return null;
}

function sensitiveStoreMissing(): RateLimitConsumeResult {
  return {
    ok: false,
    retryAfterSec: 60,
    resetAt: Date.now() + 60_000,
    requestCount: 0,
    storeUnavailable: true,
  };
}

export async function consumeRateLimit(params: {
  namespace: string;
  parts: string[];
  limit: number;
  windowMs: number;
  policy?: RateLimitPolicy;
}): Promise<RateLimitConsumeResult> {
  const policy = params.policy ?? "sensitive";
  const adapter = resolveAdapter();

  if (!adapter) {
    if (policy === "public") {
      return { ok: true, remaining: params.limit, resetAt: Date.now() + params.windowMs, requestCount: 0 };
    }
    if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
      return sensitiveStoreMissing();
    }
    if (!isRateLimitHashConfigured()) {
      return sensitiveStoreMissing();
    }
    return memoryRateLimitAdapter.consume({
      namespace: params.namespace,
      identityHash: hashRateLimitIdentity(params.namespace, ...params.parts),
      limit: params.limit,
      windowMs: params.windowMs,
    });
  }

  const identityHash = hashRateLimitIdentity(params.namespace, ...params.parts);
  const result = await adapter.consume({
    namespace: params.namespace,
    identityHash,
    limit: params.limit,
    windowMs: params.windowMs,
  });

  if (!result.ok && result.storeUnavailable) {
    if (policy === "public") {
      return { ok: true, remaining: params.limit, resetAt: Date.now() + params.windowMs, requestCount: 0 };
    }
    return result;
  }

  return result;
}

export async function resetRateLimitBucket(params: {
  namespace: string;
  parts: string[];
}): Promise<void> {
  const adapter = resolveAdapter() ?? memoryRateLimitAdapter;
  const identityHash = hashRateLimitIdentity(params.namespace, ...params.parts);
  await adapter.reset({ namespace: params.namespace, identityHash });
}

export async function consumeRateLimitByKey(
  key: string,
  limit: number,
  windowMs: number,
  policy: RateLimitPolicy = "sensitive",
): Promise<RateLimitConsumeResult> {
  return consumeRateLimit({
    namespace: key.split(":")[0] ?? "default",
    parts: [key],
    limit,
    windowMs,
    policy,
  });
}

/** IP 기준 bucket */
export async function consumeRateLimitForIp(
  namespace: string,
  request: Request,
  limit: number,
  windowMs: number,
  policy: RateLimitPolicy = "sensitive",
): Promise<RateLimitConsumeResult> {
  const { getTrustedClientIp } = await import("@/lib/security/client-ip.server");
  const ip = getTrustedClientIp(request);
  return consumeRateLimit({
    namespace,
    parts: ["ip", hashRateLimitIp(ip)],
    limit,
    windowMs,
    policy,
  });
}

export async function clearRateLimitByKey(key: string): Promise<void> {
  await resetRateLimitBucket({ namespace: key.split(":")[0] ?? "default", parts: [key] });
}

export function rateLimitBlockedResponse(
  message: string,
  retryAfterSec: number,
  storeUnavailable = false,
): { status: number; body: { ok: false; message: string }; headers: Record<string, string> } {
  return {
    status: storeUnavailable ? 503 : 429,
    body: { ok: false, message },
    headers: { "Retry-After": String(Math.max(1, retryAfterSec)) },
  };
}
