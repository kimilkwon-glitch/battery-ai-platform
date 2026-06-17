import { NextResponse } from "next/server";
import {
  ACCOUNT_RECOVERY_MESSAGES,
  uniformRecoveryDelay,
} from "@/lib/auth/account-recovery-messages";
import {
  hashVerificationValue,
  verifyOtpToken,
} from "@/lib/auth/verification-token.server";
import {
  normalizeMemberName,
  normalizeMemberPhoneDigits,
  oauthProviderLabel,
} from "@/lib/auth/member-normalize";
import {
  isMemberAuthReady,
  memberServiceUnavailable,
} from "@/lib/auth/member-api-helpers";
import { getMemberStore } from "@/lib/auth/member-store";
import { isValidPhoneDigits } from "@/lib/auth/signup-validation";
import { enforceIpRateLimitOrNull } from "@/lib/security/rate-limit-guard.server";
import { CUSTOMER_FORGOT_PASSWORD_PAGE, CUSTOMER_LOGIN_PAGE } from "@/lib/customer-auth-routes";

export const dynamic = "force-dynamic";

const GENERIC_FAIL = ACCOUNT_RECOVERY_MESSAGES.findIdNotFound;

export async function POST(request: Request) {
  if (!isMemberAuthReady()) {
    return memberServiceUnavailable();
  }

  const blocked = await enforceIpRateLimitOrNull(
    request,
    "auth.find_id_verify",
    20,
    15 * 60 * 1000,
    ACCOUNT_RECOVERY_MESSAGES.rateLimited,
  );
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: GENERIC_FAIL }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const name = normalizeMemberName(String(raw.name ?? ""));
  const phoneDigits = normalizeMemberPhoneDigits(String(raw.phone ?? ""));
  const otpCode = String(raw.otpCode ?? "").trim();

  if (!name || !isValidPhoneDigits(phoneDigits) || !/^\d{6}$/.test(otpCode)) {
    await uniformRecoveryDelay();
    return NextResponse.json({ ok: false, message: ACCOUNT_RECOVERY_MESSAGES.otpInvalid }, { status: 400 });
  }

  const destinationHash = hashVerificationValue(`find_id:${name}:${phoneDigits}`);
  const verified = await verifyOtpToken({
    purpose: "find_id_phone",
    destinationHash,
    otpCode,
  });

  if (!verified.ok) {
    await uniformRecoveryDelay();
    const message =
      verified.reason === "max_attempts"
        ? ACCOUNT_RECOVERY_MESSAGES.otpMaxAttempts
        : verified.reason === "expired"
          ? ACCOUNT_RECOVERY_MESSAGES.otpExpired
          : ACCOUNT_RECOVERY_MESSAGES.otpInvalid;
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }

  const store = await getMemberStore();
  const member = verified.userId
    ? await store.findMemberById(verified.userId)
    : await store.findMemberByNameAndPhone(name, phoneDigits);

  if (!member) {
    await uniformRecoveryDelay();
    return NextResponse.json({ ok: false, message: GENERIC_FAIL }, { status: 404 });
  }

  if (member.provider !== "credentials") {
    return NextResponse.json({
      ok: true,
      resultType: "oauth",
      provider: member.provider,
      providerLabel: oauthProviderLabel(member.provider),
      message: `이 계정은 ${oauthProviderLabel(member.provider)} 간편 로그인으로 가입되었습니다.`,
      loginHref: CUSTOMER_LOGIN_PAGE,
    });
  }

  if (!member.loginId) {
    return NextResponse.json({
      ok: true,
      resultType: "oauth",
      provider: member.provider,
      providerLabel: "간편",
      message: "이 계정은 간편 로그인으로 가입되었습니다.",
      loginHref: CUSTOMER_LOGIN_PAGE,
    });
  }

  const joinedAt = member.createdAt.slice(0, 10);

  return NextResponse.json({
    ok: true,
    resultType: "credentials",
    loginId: member.loginId,
    joinedAt,
    loginHref: CUSTOMER_LOGIN_PAGE,
    forgotPasswordHref: CUSTOMER_FORGOT_PASSWORD_PAGE,
    message: "아이디 확인이 완료되었습니다.",
  });
}
