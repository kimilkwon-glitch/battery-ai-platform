import "server-only";
import { neon } from "@neondatabase/serverless";

export function getDatabaseUrl(): string | null {
  const url = process.env.DATABASE_URL?.trim();
  return url || null;
}

export function isPostgresConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

export function requireDatabaseUrl(): string {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return url;
}

export function getSql() {
  return neon(requireDatabaseUrl());
}

export type Sql = ReturnType<typeof getSql>;
