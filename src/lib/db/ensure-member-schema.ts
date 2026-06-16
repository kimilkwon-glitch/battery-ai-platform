import "server-only";
import { getSql, isPostgresConfigured } from "@/lib/db/postgres";

let schemaReady: Promise<void> | null = null;

export async function ensureMemberSchema(): Promise<void> {
  if (!isPostgresConfigured()) return;
  if (!schemaReady) {
    schemaReady = runMigration();
  }
  await schemaReady;
}

async function runMigration(): Promise<void> {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      login_id TEXT UNIQUE,
      email TEXT,
      phone TEXT NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT,
      provider TEXT NOT NULL DEFAULT 'credentials',
      provider_id TEXT,
      zonecode TEXT,
      address TEXT,
      detail_address TEXT,
      vehicle_info JSONB,
      preferred_store TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE members ADD COLUMN IF NOT EXISTS preferred_store TEXT
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_members_email_lower
      ON members (LOWER(email))
      WHERE email IS NOT NULL AND email <> ''
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_members_provider_pair
      ON members (provider, provider_id)
      WHERE provider_id IS NOT NULL AND provider_id <> ''
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_members_login_id
      ON members (login_id)
      WHERE login_id IS NOT NULL
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_members_phone
      ON members (phone)
  `;

  await sql`
    ALTER TABLE members ADD COLUMN IF NOT EXISTS session_epoch INTEGER NOT NULL DEFAULT 0
  `;
}
