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
import { checkIpRateLimit, getClientIp } from "@/lib/security/ip-rate-limit.server";

export const dynamic = "force-dynamic";

const GENERIC_FAIL = ACCOUNT_RECOVERY_MESSAGES.findIdNotFound;

export async function POST(request: Request) {
  if (!isMemberAuthReady()) {
    return memberServiceUnavailable();
  }

  const ip = getClientIp(request);
  const ipLimit = checkIpRateLimit(`find-id-send:${ip}`, 10, 15 * 60 * 1000);
  if (!ipLimit.ok) {
    return NextResponse.json(
      { ok: false, message: ACCOUNT_RECOVERY_MESSAGES.rateLimited },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSec) } },
    );
  }

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

  const phoneLimit = checkIpRateLimit(`find-id-phone:${phoneDigits}`, 5, 15 * 60 * 1000);
  if (!phoneLimit.ok) {
    return NextResponse.json(
      { ok: false, message: ACCOUNT_RECOVERY_MESSAGES.rateLimited },
      { status: 429, headers: { "Retry-After": String(phoneLimit.retryAfterSec) } },
    );
  }

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
