import "server-only";

import { isPostgresConfigured } from "@/lib/db/postgres";

export function isMemberStoreConfigured(): boolean {
  return isPostgresConfigured();
}

export async function getMemberStore() {
  if (!isPostgresConfigured()) {
    throw new Error("DATABASE_URL is not configured");
  }
  return import("@/lib/auth/member-store.postgres");
}
