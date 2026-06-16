import "server-only";

import { createHash, randomInt, randomBytes, timingSafeEqual } from "node:crypto";
import { ensureVerificationSchema } from "@/lib/db/ensure-verification-schema";
import { getSql } from "@/lib/db/postgres";
import { getCustomerSessionSecret } from "@/lib/auth/member-credentials";

export type VerificationPurpose =
  | "find_id_phone"
  | "reset_password_email"
  | "set_password_email";

type VerificationRow = {
  id: string;
  user_id: string | null;
  purpose: string;
  destination_hash: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  attempt_count: number;
  created_at: string;
  request_ip_hash: string | null;
};

const MAX_OTP_ATTEMPTS = 5;

function verificationSecret(): string {
  const secret = getCustomerSessionSecret();
  if (!secret) throw new Error("CUSTOMER_SESSION_SECRET is not configured");
  return secret;
}

export function hashVerificationValue(value: string): string {
  return createHash("sha256").update(`${verificationSecret()}:${value}`).digest("hex");
}

export function hashRequestIp(ip: string): string {
  return createHash("sha256").update(`${verificationSecret()}:ip:${ip}`).digest("hex").slice(0, 32);
}

export function generateOtpCode(): string {
  return String(randomInt(100000, 1000000));
}

export function generateResetToken(): string {
  return randomBytes(32).toString("base64url");
}

function newVerificationId(): string {
  return `cvt_${Date.now()}_${randomBytes(6).toString("hex")}`;
}

export async function invalidateVerificationTokens(params: {
  purpose: VerificationPurpose;
  destinationHash: string;
}): Promise<void> {
  await ensureVerificationSchema();
  const sql = getSql();
  await sql`
    UPDATE customer_verification_tokens
    SET used_at = COALESCE(used_at, NOW())
    WHERE purpose = ${params.purpose}
      AND destination_hash = ${params.destinationHash}
      AND used_at IS NULL
  `;
}

export async function createOtpVerificationToken(params: {
  purpose: VerificationPurpose;
  destinationHash: string;
  userId?: string | null;
  otpCode: string;
  expiresAt: Date;
  requestIpHash?: string | null;
}): Promise<{ id: string }> {
  await ensureVerificationSchema();
  await invalidateVerificationTokens({
    purpose: params.purpose,
    destinationHash: params.destinationHash,
  });

  const sql = getSql();
  const id = newVerificationId();
  const tokenHash = hashVerificationValue(params.otpCode);

  await sql`
    INSERT INTO customer_verification_tokens (
      id, user_id, purpose, destination_hash, token_hash,
      expires_at, attempt_count, request_ip_hash
    ) VALUES (
      ${id},
      ${params.userId ?? null},
      ${params.purpose},
      ${params.destinationHash},
      ${tokenHash},
      ${params.expiresAt.toISOString()}::timestamptz,
      0,
      ${params.requestIpHash ?? null}
    )
  `;

  return { id };
}

export async function createResetTokenVerification(params: {
  userId: string;
  token: string;
  destinationHash: string;
  expiresAt: Date;
  requestIpHash?: string | null;
}): Promise<{ id: string }> {
  await ensureVerificationSchema();
  await invalidateVerificationTokens({
    purpose: "reset_password_email",
    destinationHash: params.destinationHash,
  });

  const sql = getSql();
  const id = newVerificationId();
  const tokenHash = hashVerificationValue(params.token);

  await sql`
    INSERT INTO customer_verification_tokens (
      id, user_id, purpose, destination_hash, token_hash,
      expires_at, attempt_count, request_ip_hash
    ) VALUES (
      ${id},
      ${params.userId},
      'reset_password_email',
      ${params.destinationHash},
      ${tokenHash},
      ${params.expiresAt.toISOString()}::timestamptz,
      0,
      ${params.requestIpHash ?? null}
    )
  `;

  return { id };
}

export type VerifyTokenResult =
  | { ok: true; userId: string | null; tokenId: string }
  | { ok: false; reason: "invalid" | "expired" | "used" | "max_attempts" };

async function getLatestActiveToken(
  purpose: VerificationPurpose,
  destinationHash: string,
): Promise<VerificationRow | null> {
  await ensureVerificationSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM customer_verification_tokens
    WHERE purpose = ${purpose}
      AND destination_hash = ${destinationHash}
      AND used_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `) as VerificationRow[];
  return rows[0] ?? null;
}

function compareTokenHash(input: string, storedHash: string): boolean {
  const actual = Buffer.from(hashVerificationValue(input), "hex");
  const expected = Buffer.from(storedHash, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export async function verifyOtpToken(params: {
  purpose: VerificationPurpose;
  destinationHash: string;
  otpCode: string;
}): Promise<VerifyTokenResult> {
  const row = await getLatestActiveToken(params.purpose, params.destinationHash);
  if (!row) return { ok: false, reason: "invalid" };

  if (row.used_at) return { ok: false, reason: "used" };
  if (new Date(row.expires_at).getTime() < Date.now()) return { ok: false, reason: "expired" };
  if (row.attempt_count >= MAX_OTP_ATTEMPTS) return { ok: false, reason: "max_attempts" };

  const sql = getSql();
  const matched = compareTokenHash(params.otpCode.trim(), row.token_hash);

  if (!matched) {
    await sql`
      UPDATE customer_verification_tokens
      SET attempt_count = attempt_count + 1
      WHERE id = ${row.id}
    `;
    const nextAttempts = row.attempt_count + 1;
    if (nextAttempts >= MAX_OTP_ATTEMPTS) {
      return { ok: false, reason: "max_attempts" };
    }
    return { ok: false, reason: "invalid" };
  }

  await sql`
    UPDATE customer_verification_tokens
    SET used_at = NOW()
    WHERE id = ${row.id}
  `;

  return { ok: true, userId: row.user_id, tokenId: row.id };
}

export async function verifyResetToken(params: {
  token: string;
  destinationHash: string;
}): Promise<VerifyTokenResult> {
  const row = await getLatestActiveToken("reset_password_email", params.destinationHash);
  if (!row) return { ok: false, reason: "invalid" };
  if (row.used_at) return { ok: false, reason: "used" };
  if (new Date(row.expires_at).getTime() < Date.now()) return { ok: false, reason: "expired" };
  if (!compareTokenHash(params.token, row.token_hash)) return { ok: false, reason: "invalid" };

  const sql = getSql();
  await sql`
    UPDATE customer_verification_tokens
    SET used_at = NOW()
    WHERE id = ${row.id}
  `;

  return { ok: true, userId: row.user_id, tokenId: row.id };
}

export async function verifyResetTokenByUserId(params: {
  userId: string;
  token: string;
}): Promise<VerifyTokenResult> {
  await ensureVerificationSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM customer_verification_tokens
    WHERE purpose = 'reset_password_email'
      AND user_id = ${params.userId}
      AND used_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `) as VerificationRow[];

  const row = rows[0];
  if (!row) return { ok: false, reason: "invalid" };
  if (new Date(row.expires_at).getTime() < Date.now()) return { ok: false, reason: "expired" };
  if (!compareTokenHash(params.token, row.token_hash)) return { ok: false, reason: "invalid" };

  await sql`
    UPDATE customer_verification_tokens
    SET used_at = NOW()
    WHERE id = ${row.id}
  `;

  return { ok: true, userId: row.user_id, tokenId: row.id };
}
