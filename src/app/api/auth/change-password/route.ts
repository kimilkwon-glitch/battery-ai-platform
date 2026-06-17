import { NextResponse } from "next/server";
import { ACCOUNT_RECOVERY_MESSAGES } from "@/lib/auth/account-recovery-messages";
import { hashMemberPassword, verifyMemberPassword } from "@/lib/auth/member-password.server";
import {
  clearCustomerSessionCookie,
  isMemberAuthReady,
  memberServiceUnavailable,
} from "@/lib/auth/member-api-helpers";
import { MEMBER_AUTH_MESSAGES } from "@/lib/auth/member-auth-errors";
import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import { getMemberStore } from "@/lib/auth/member-store";
import { isValidPassword } from "@/lib/auth/signup-validation";
import { enforceRateLimitOrNull } from "@/lib/security/rate-limit-guard.server";
import { hashRateLimitIdentity } from "@/lib/security/rate-limit-hash.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isMemberAuthReady()) {
    return memberServiceUnavailable();
  }

  const session = await getVerifiedCustomerSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.loginRequired },
      { status: 401 },
    );
  }

  const blocked = await enforceRateLimitOrNull({
    request,
    namespace: "auth.change_password",
    limit: 10,
    windowMs: 15 * 60 * 1000,
    parts: ["user", hashRateLimitIdentity("auth.change_password", session.userId)],
    message: ACCOUNT_RECOVERY_MESSAGES.rateLimited,
  });
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.invalidInput },
      { status: 400 },
    );
  }

  const raw = body as Record<string, unknown>;
  const currentPassword = String(raw.currentPassword ?? "");
  const newPassword = String(raw.newPassword ?? "");
  const confirmPassword = String(raw.confirmPassword ?? newPassword);

  if (!currentPassword || !isValidPassword(newPassword) || newPassword !== confirmPassword) {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.invalidInput },
      { status: 400 },
    );
  }

  const store = await getMemberStore();
  const member = await store.findMemberById(session.userId);
  if (!member) {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.loginRequired },
      { status: 401 },
    );
  }

  if (member.provider !== "credentials" || !member.passwordHash) {
    return NextResponse.json(
      { ok: false, message: ACCOUNT_RECOVERY_MESSAGES.oauthAccount },
      { status: 400 },
    );
  }

  if (!verifyMemberPassword(currentPassword, member.passwordHash)) {
    return NextResponse.json(
      { ok: false, message: ACCOUNT_RECOVERY_MESSAGES.currentPasswordWrong },
      { status: 401 },
    );
  }

  if (verifyMemberPassword(newPassword, member.passwordHash)) {
    return NextResponse.json(
      { ok: false, message: ACCOUNT_RECOVERY_MESSAGES.passwordSameAsCurrent },
      { status: 400 },
    );
  }

  const updated = await store.updateMemberPasswordHash(
    member.id,
    hashMemberPassword(newPassword),
  );
  if (!updated) {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.profileSaveFailed },
      { status: 500 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    message: ACCOUNT_RECOVERY_MESSAGES.passwordChanged,
  });
  return clearCustomerSessionCookie(response);
}
