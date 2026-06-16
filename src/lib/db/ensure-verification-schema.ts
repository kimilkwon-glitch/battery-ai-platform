import "server-only";
import { getSql, isPostgresConfigured } from "@/lib/db/postgres";

let schemaReady: Promise<void> | null = null;

export async function ensureVerificationSchema(): Promise<void> {
  if (!isPostgresConfigured()) return;
  if (!schemaReady) {
    schemaReady = runMigration();
  }
  await schemaReady;
}

async function runMigration(): Promise<void> {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS customer_verification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      purpose TEXT NOT NULL,
      destination_hash TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      request_ip_hash TEXT
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_customer_verification_tokens_lookup
      ON customer_verification_tokens (purpose, destination_hash, created_at DESC)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_customer_verification_tokens_user
      ON customer_verification_tokens (user_id, purpose, created_at DESC)
      WHERE user_id IS NOT NULL
  `;
}
