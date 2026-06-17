import "server-only";

import { getSql, isPostgresConfigured } from "@/lib/db/postgres";
import type { RateLimitAdapter, RateLimitConsumeResult } from "@/lib/security/rate-limit-memory.server";

const CLEANUP_PROBABILITY = 0.02;
const CLEANUP_BATCH = 500;

async function maybeCleanupExpired(): Promise<void> {
  if (Math.random() > CLEANUP_PROBABILITY) return;
  try {
    const sql = getSql();
    await sql`
      DELETE FROM rate_limit_buckets
      WHERE ctid IN (
        SELECT ctid FROM rate_limit_buckets
        WHERE expires_at < NOW() - INTERVAL '1 day'
        LIMIT ${CLEANUP_BATCH}
      )
    `;
  } catch {
    /* bounded cleanup — 실패해도 consume 계속 */
  }
}

export function isPostgresRateLimitAvailable(): boolean {
  return isPostgresConfigured();
}

export const postgresRateLimitAdapter: RateLimitAdapter = {
  async consume({ namespace, identityHash, limit, windowMs }) {
    const now = Date.now();
    const expiresAt = new Date(now + windowMs);

    try {
      const sql = getSql();
      const rows = (await sql`
        INSERT INTO rate_limit_buckets (
          namespace, identity_hash, window_started_at, request_count, expires_at, updated_at
        ) VALUES (
          ${namespace},
          ${identityHash},
          NOW(),
          1,
          ${expiresAt.toISOString()}::timestamptz,
          NOW()
        )
        ON CONFLICT (namespace, identity_hash) DO UPDATE SET
          request_count = CASE
            WHEN rate_limit_buckets.expires_at <= NOW() THEN 1
            ELSE rate_limit_buckets.request_count + 1
          END,
          window_started_at = CASE
            WHEN rate_limit_buckets.expires_at <= NOW() THEN NOW()
            ELSE rate_limit_buckets.window_started_at
          END,
          expires_at = CASE
            WHEN rate_limit_buckets.expires_at <= NOW() THEN EXCLUDED.expires_at
            ELSE rate_limit_buckets.expires_at
          END,
          updated_at = NOW()
        RETURNING request_count, expires_at
      `) as { request_count: number; expires_at: string }[];

      void maybeCleanupExpired();

      const row = rows[0];
      if (!row) {
        return storeError(now, windowMs);
      }

      const resetAt = new Date(row.expires_at).getTime();
      const requestCount = row.request_count;
      if (requestCount > limit) {
        return {
          ok: false,
          retryAfterSec: Math.max(1, Math.ceil((resetAt - now) / 1000)),
          resetAt,
          requestCount,
        };
      }
      return {
        ok: true,
        remaining: Math.max(0, limit - requestCount),
        resetAt,
        requestCount,
      };
    } catch {
      return storeError(now, windowMs);
    }
  },

  async reset({ namespace, identityHash }) {
    try {
      const sql = getSql();
      await sql`
        DELETE FROM rate_limit_buckets
        WHERE namespace = ${namespace} AND identity_hash = ${identityHash}
      `;
    } catch {
      /* ignore */
    }
  },
};

function storeError(now: number, windowMs: number): RateLimitConsumeResult {
  return {
    ok: false,
    retryAfterSec: 60,
    resetAt: now + windowMs,
    requestCount: 0,
    storeUnavailable: true,
  };
}
