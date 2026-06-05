import "server-only";

import { scryptSync, timingSafeEqual } from "node:crypto";
import {
  getAdminPasswordStored,
  timingSafeEqualUtf8,
} from "@/lib/admin/adminCredentials";

const SCRYPT_OPTS = { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 } as const;

/** ADMIN_PASSWORD_HASH 생성용 — `node scripts/hash-admin-password.mjs` */
export function hashAdminPassword(password: string): string {
  const salt = Buffer.from(cryptoRandomBytes(16));
  const hash = scryptSync(password, salt, 64, SCRYPT_OPTS);
  return `scrypt:${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

function cryptoRandomBytes(len: number): Uint8Array {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function verifyAdminPasswordInput(password: string | undefined | null): boolean {
  const stored = getAdminPasswordStored();
  if (!stored || !password) return false;

  if (stored.startsWith("scrypt:")) {
    const parts = stored.split(":");
    if (parts.length !== 3) return false;
    const salt = Buffer.from(parts[1]!, "base64url");
    const expected = Buffer.from(parts[2]!, "base64url");
    try {
      const actual = scryptSync(password, salt, 64, SCRYPT_OPTS);
      if (actual.length !== expected.length) return false;
      return timingSafeEqual(actual, expected);
    } catch {
      return false;
    }
  }

  return timingSafeEqualUtf8(password, stored);
}
