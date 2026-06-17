import { NextResponse } from "next/server";
import {
  ACCOUNT_RECOVERY_MESSAGES,
  OTP_TTL_MS,
  uniformRecoveryDelay,
} from "@/lib/auth/account-recovery-messages";
import {
  hashRequestIp,
  hashVerificationValue,
  createOtpVerificationToken,
  generateOtpCode,
} from "@/lib/auth/verification-token.server";
import {
  normalizeMemberName,
  normalizeMemberPhoneDigits,
} from "@/lib/auth/member-normalize";
import {
  isMemberAuthReady,
  memberServiceUnavailable,
} from "@/lib/auth/member-api-helpers";
import { getMemberStore } from "@/lib/auth/member-store";
import { isValidPhoneDigits } from "@/lib/auth/signup-validation";
import { isSmsConfigured, sendPhoneOtpSms } from "@/lib/notifications/sms.server";
import { getTrustedClientIp } from "@/lib/security/client-ip.server";
import { hashRateLimitIdentity } from "@/lib/security/rate-limit-hash.server";
import { enforceRateLimitOrNull } from "@/lib/security/rate-limit-guard.server";

export const dynamic = "force-dynamic";

const GENERIC_FAIL = ACCOUNT_RECOVERY_MESSAGES.findIdNotFound;

export async function POST(request: Request) {
  if (!isMemberAuthReady()) {
    return memberServiceUnavailable();
  }

  const ip = getTrustedClientIp(request);
  const ipBlocked = await enforceRateLimitOrNull({
    request,
    namespace: "auth.find_id_send",
    limit: 10,
    windowMs: 15 * 60 * 1000,
    message: ACCOUNT_RECOVERY_MESSAGES.rateLimited,
  });
  if (ipBlocked) return ipBlocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: GENERIC_FAIL }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const name = normalizeMemberName(String(raw.name ?? ""));
  const phoneDigits = normalizeMemberPhoneDigits(String(raw.phone ?? ""));

  if (!name || !isValidPhoneDigits(phoneDigits)) {
    await uniformRecoveryDelay();
    return NextResponse.json({ ok: false, message: GENERIC_FAIL }, { status: 400 });
  }

  const phoneHash = hashRateLimitIdentity("auth.find_id_send", "phone", phoneDigits);
  const phoneBlocked = await enforceRateLimitOrNull({
    request,
    namespace: "auth.find_id_send",
    limit: 5,
    windowMs: 15 * 60 * 1000,
    ipOnly: false,
    parts: ["phone", phoneHash],
    message: ACCOUNT_RECOVERY_MESSAGES.rateLimited,
  });
  if (phoneBlocked) return phoneBlocked;

  const cooldownBlocked = await enforceRateLimitOrNull({
    request,
    namespace: "auth.find_id_cooldown",
    limit: 1,
    windowMs: 60 * 1000,
    ipOnly: false,
    parts: ["phone", phoneHash],
    message: ACCOUNT_RECOVERY_MESSAGES.rateLimited,
  });
  if (cooldownBlocked) return cooldownBlocked;

  const store = await getMemberStore();
  const member = await store.findMemberByNameAndPhone(name, phoneDigits);

  if (!member) {
    await uniformRecoveryDelay();
    return NextResponse.json({ ok: true, message: ACCOUNT_RECOVERY_MESSAGES.findIdSendOk });
  }

  if (!isSmsConfigured()) {
    await uniformRecoveryDelay();
    return NextResponse.json(
      { ok: false, message: ACCOUNT_RECOVERY_MESSAGES.smsUnavailable },
      { status: 503 },
    );
  }

  const destinationHash = hashVerificationValue(`find_id:${name}:${phoneDigits}`);
  const otpCode = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await createOtpVerificationToken({
    purpose: "find_id_phone",
    destinationHash,
    userId: member.id,
    otpCode,
    expiresAt,
    requestIpHash: hashRequestIp(ip),
  });

  const smsResult = await sendPhoneOtpSms({ to: phoneDigits, otpCode });
  if (!smsResult.ok) {
    await uniformRecoveryDelay();
    return NextResponse.json(
      { ok: false, message: ACCOUNT_RECOVERY_MESSAGES.smsUnavailable },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: ACCOUNT_RECOVERY_MESSAGES.findIdSendOk,
    expiresInSec: Math.floor(OTP_TTL_MS / 1000),
    resendCooldownSec: 60,
  });
}
