import { NextResponse } from "next/server";
import {
  ACCOUNT_RECOVERY_MESSAGES,
  RESET_TOKEN_TTL_MS,
  uniformRecoveryDelay,
} from "@/lib/auth/account-recovery-messages";
import {
  createResetTokenVerification,
  generateResetToken,
  hashRequestIp,
  hashVerificationValue,
} from "@/lib/auth/verification-token.server";
import {
  isMemberAuthReady,
  memberServiceUnavailable,
} from "@/lib/auth/member-api-helpers";
import { getMemberStore } from "@/lib/auth/member-store";
import {
  getPublicSiteOrigin,
  isEmailConfigured,
  sendPasswordResetEmail,
} from "@/lib/notifications/email.server";
import { checkIpRateLimit, getClientIp } from "@/lib/security/ip-rate-limit.server";
import { CUSTOMER_RESET_PASSWORD_PAGE } from "@/lib/customer-auth-routes";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isMemberAuthReady()) {
    return memberServiceUnavailable();
  }

  const ip = getClientIp(request);
  const ipLimit = checkIpRateLimit(`forgot-password:${ip}`, 10, 15 * 60 * 1000);
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
    await uniformRecoveryDelay();
    return NextResponse.json({ ok: true, message: ACCOUNT_RECOVERY_MESSAGES.forgotPasswordOk });
  }

  const idOrEmail = String((body as Record<string, unknown>).idOrEmail ?? "").trim();
  if (!idOrEmail) {
    await uniformRecoveryDelay();
    return NextResponse.json({ ok: true, message: ACCOUNT_RECOVERY_MESSAGES.forgotPasswordOk });
  }

  const store = await getMemberStore();
  const member = await store.findMemberByIdOrEmail(idOrEmail);

  if (
    !member ||
    member.provider !== "credentials" ||
    !member.passwordHash ||
    !member.email?.trim()
  ) {
    await uniformRecoveryDelay();
    return NextResponse.json({ ok: true, message: ACCOUNT_RECOVERY_MESSAGES.forgotPasswordOk });
  }

  if (!isEmailConfigured()) {
    await uniformRecoveryDelay();
    return NextResponse.json(
      { ok: false, message: ACCOUNT_RECOVERY_MESSAGES.emailUnavailable },
      { status: 503 },
    );
  }

  const email = member.email.trim();
  const emailLimit = checkIpRateLimit(`forgot-password-email:${email.toLowerCase()}`, 3, 15 * 60 * 1000);
  if (!emailLimit.ok) {
    return NextResponse.json(
      { ok: false, message: ACCOUNT_RECOVERY_MESSAGES.rateLimited },
      { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSec) } },
    );
  }

  const resetToken = generateResetToken();
  const destinationHash = hashVerificationValue(`reset_password:${member.id}`);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await createResetTokenVerification({
    userId: member.id,
    token: resetToken,
    destinationHash,
    expiresAt,
    requestIpHash: hashRequestIp(ip),
  });

  const resetUrl = `${getPublicSiteOrigin()}${CUSTOMER_RESET_PASSWORD_PAGE}?token=${encodeURIComponent(resetToken)}&uid=${encodeURIComponent(member.id)}`;
  const emailResult = await sendPasswordResetEmail({
    to: email,
    resetUrl,
    requestedAt: new Date(),
  });

  if (!emailResult.ok) {
    await uniformRecoveryDelay();
    return NextResponse.json(
      { ok: false, message: ACCOUNT_RECOVERY_MESSAGES.emailUnavailable },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, message: ACCOUNT_RECOVERY_MESSAGES.forgotPasswordOk });
}
