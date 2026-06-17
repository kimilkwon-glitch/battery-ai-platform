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
import { normalizeMemberLoginIdOrEmail } from "@/lib/auth/member-login-identity.server";
import { getTrustedClientIp } from "@/lib/security/client-ip.server";
import { hashRateLimitIdentity } from "@/lib/security/rate-limit-hash.server";
import { enforceRateLimitOrNull } from "@/lib/security/rate-limit-guard.server";
import { CUSTOMER_RESET_PASSWORD_PAGE } from "@/lib/customer-auth-routes";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isMemberAuthReady()) {
    return memberServiceUnavailable();
  }

  const ip = getTrustedClientIp(request);
  const ipBlocked = await enforceRateLimitOrNull({
    request,
    namespace: "auth.forgot_password",
    limit: 10,
    windowMs: 15 * 60 * 1000,
    message: ACCOUNT_RECOVERY_MESSAGES.rateLimited,
  });
  if (ipBlocked) return ipBlocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    await uniformRecoveryDelay();
    return NextResponse.json({ ok: true, message: ACCOUNT_RECOVERY_MESSAGES.forgotPasswordOk });
  }

  const idOrEmail = normalizeMemberLoginIdOrEmail(
    String((body as Record<string, unknown>).idOrEmail ?? ""),
  );
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
  const emailHash = hashRateLimitIdentity("auth.forgot_password", "email", email);
  const emailBlocked = await enforceRateLimitOrNull({
    request,
    namespace: "auth.forgot_password",
    limit: 3,
    windowMs: 15 * 60 * 1000,
    ipOnly: false,
    parts: ["email", emailHash],
    message: ACCOUNT_RECOVERY_MESSAGES.rateLimited,
  });
  if (emailBlocked) return emailBlocked;

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
