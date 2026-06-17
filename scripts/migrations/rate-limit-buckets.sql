-- 중앙 분산 rate limit bucket (Neon Postgres)
-- 재실행 안전, 고객 개인정보 미저장 (identity_hash only)

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  namespace TEXT NOT NULL,
  identity_hash TEXT NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (namespace, identity_hash)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_expires_at
  ON rate_limit_buckets (expires_at);
