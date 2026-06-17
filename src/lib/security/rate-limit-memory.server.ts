import "server-only";

export type RateLimitConsumeResult =
  | {
      ok: true;
      remaining: number;
      resetAt: number;
      requestCount: number;
    }
  | {
      ok: false;
      retryAfterSec: number;
      resetAt: number;
      requestCount: number;
      storeUnavailable?: boolean;
    };

export type RateLimitPolicy = "sensitive" | "public";

export type RateLimitAdapter = {
  consume(params: {
    namespace: string;
    identityHash: string;
    limit: number;
    windowMs: number;
  }): Promise<RateLimitConsumeResult>;
  reset(params: { namespace: string; identityHash: string }): Promise<void>;
};

type MemoryBucket = { count: number; resetAt: number };

const buckets = new Map<string, MemoryBucket>();
const keyLocks = new Map<string, Promise<void>>();

function bucketKey(namespace: string, identityHash: string): string {
  return `${namespace}:${identityHash}`;
}

async function withMemoryBucketLock<T>(key: string, fn: () => T | Promise<T>): Promise<T> {
  const prev = keyLocks.get(key) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  keyLocks.set(key, prev.then(() => gate));
  await prev;
  try {
    return await fn();
  } finally {
    release();
    keyLocks.delete(key);
  }
}

function consumeMemoryBucket(params: {
  namespace: string;
  identityHash: string;
  limit: number;
  windowMs: number;
}): RateLimitConsumeResult {
  const now = Date.now();
  const key = bucketKey(params.namespace, params.identityHash);
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + params.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: Math.max(0, params.limit - 1), resetAt, requestCount: 1 };
  }
  if (bucket.count >= params.limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      resetAt: bucket.resetAt,
      requestCount: bucket.count,
    };
  }
  bucket.count += 1;
  return {
    ok: true,
    remaining: Math.max(0, params.limit - bucket.count),
    resetAt: bucket.resetAt,
    requestCount: bucket.count,
  };
}

export const memoryRateLimitAdapter: RateLimitAdapter = {
  async consume(params) {
    return withMemoryBucketLock(`${params.namespace}:${params.identityHash}`, () =>
      consumeMemoryBucket(params),
    );
  },
  async reset({ namespace, identityHash }) {
    buckets.delete(bucketKey(namespace, identityHash));
  },
};

export function clearMemoryRateLimitBuckets(): void {
  buckets.clear();
  keyLocks.clear();
}
