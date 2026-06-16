import { NextResponse } from "next/server";
import { ACCOUNT_RECOVERY_MESSAGES } from "@/lib/auth/account-recovery-messages";
import { hashMemberPassword, verifyMemberPassword } from "@/lib/auth/member-password.server";
import {
  clearCustomerSessionCookie,
  isMemberAuthReady,
  memberServiceUnavailable,
} from "@/lib/auth/member-api-helpers";
import { getMemberStore } from "@/lib/auth/member-store";
import { verifyResetTokenByUserId } from "@/lib/auth/verification-token.server";
import { isValidPassword } from "@/lib/auth/signup-validation";
import { checkIpRateLimit, getClientIp } from "@/lib/security/ip-rate-limit.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isMemberAuthReady()) {
    return memberServiceUnavailable();
  }

  const ip = getClientIp(request);
  const ipLimit = checkIpRateLimit(`reset-password:${ip}`, 15, 15 * 60 * 1000);
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
    return NextResponse.json(
      { ok: false, message: ACCOUNT_RECOVERY_MESSAGES.resetLinkInvalid },
      { status: 400 },
    );
  }

  const raw = body as Record<string, unknown>;
  const token = String(raw.token ?? "").trim();
  const userId = String(raw.userId ?? "").trim();
  const newPassword = String(raw.newPassword ?? "");
  const confirmPassword = String(raw.confirmPassword ?? newPassword);

  if (!token || !userId || !isValidPassword(newPassword) || newPassword !== confirmPassword) {
    return NextResponse.json(
      { ok: false, message: ACCOUNT_RECOVERY_MESSAGES.resetLinkInvalid },
      { status: 400 },
    );
  }

  const verified = await verifyResetTokenByUserId({ userId, token });
  if (!verified.ok) {
    const message =
      verified.reason === "expired"
        ? ACCOUNT_RECOVERY_MESSAGES.resetLinkInvalid
        : ACCOUNT_RECOVERY_MESSAGES.resetLinkInvalid;
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }

  const store = await getMemberStore();
  const member = await store.findMemberById(userId);
  if (
    !member ||
    member.provider !== "credentials" ||
    !member.passwordHash ||
    member.id !== verified.userId
  ) {
    return NextResponse.json(
      { ok: false, message: ACCOUNT_RECOVERY_MESSAGES.resetLinkInvalid },
      { status: 400 },
    );
  }

  if (verifyMemberPassword(newPassword, member.passwordHash)) {
    return NextResponse.json(
      { ok: false, message: ACCOUNT_RECOVERY_MESSAGES.passwordSameAsCurrent },
      { status: 400 },
    );
  }

  const updated = await store.updateMemberPasswordHash(userId, hashMemberPassword(newPassword));
  if (!updated) {
    return NextResponse.json(
      { ok: false, message: ACCOUNT_RECOVERY_MESSAGES.resetLinkInvalid },
      { status: 500 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    message: ACCOUNT_RECOVERY_MESSAGES.passwordChanged,
  });
  return clearCustomerSessionCookie(response);
}
