import { NextResponse } from "next/server";
import { isMemberUniqueViolation } from "@/lib/auth/member-db-errors.server";
import { MEMBER_AUTH_MESSAGES } from "@/lib/auth/member-auth-errors";
import {
  formatPhoneForDisplay,
  normalizeMemberPhoneDigits,
} from "@/lib/auth/member-normalize";
import { normalizeMemberEmailForStorage } from "@/lib/auth/member-login-identity.server";
import { toMemberPublic } from "@/lib/auth/member-public";
import { getMemberStore } from "@/lib/auth/member-store";
import { parseVehicleInfo } from "@/lib/auth/member-profile-parse";
import {
  attachCustomerSessionCookie,
  isMemberAuthReady,
  memberServiceUnavailable,
} from "@/lib/auth/member-api-helpers";
import {
  isValidEmail,
  isValidLoginId,
  isValidPassword,
  isValidPhoneDigits,
} from "@/lib/auth/signup-validation";
import { hookAlimtalkSignup } from "@/lib/notifications/alimtalk-hooks.server";
import { enforceIpRateLimitOrNull } from "@/lib/security/rate-limit-guard.server";

export const dynamic = "force-dynamic";

const SIGNUP_RATE_LIMIT = 10;
const SIGNUP_RATE_WINDOW_MS = 15 * 60 * 1000;

type SignupBody = {
  loginId?: string;
  password?: string;
  name?: string;
  phone?: string;
  email?: string;
  zonecode?: string;
  address?: string;
  detailAddress?: string;
  vehicleInfo?: unknown;
  agreeTerms?: boolean;
  agreePrivacy?: boolean;
};

function isAgreed(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

export async function POST(request: Request) {
  if (!isMemberAuthReady()) {
    return memberServiceUnavailable();
  }

  const blocked = await enforceIpRateLimitOrNull(
    request,
    "auth.signup",
    SIGNUP_RATE_LIMIT,
    SIGNUP_RATE_WINDOW_MS,
    MEMBER_AUTH_MESSAGES.signupConflict,
  );
  if (blocked) return blocked;

  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.invalidInput },
      { status: 400 },
    );
  }

  if (!isAgreed(body.agreeTerms) || !isAgreed(body.agreePrivacy)) {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.invalidInput },
      { status: 400 },
    );
  }

  const loginId = String(body.loginId ?? "").trim();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim();
  const phoneDigits = normalizeMemberPhoneDigits(String(body.phone ?? ""));
  const phone = formatPhoneForDisplay(phoneDigits);
  const email = normalizeMemberEmailForStorage(String(body.email ?? ""));
  const zonecode = String(body.zonecode ?? "").trim();
  const address = String(body.address ?? "").trim();
  const detailAddress = String(body.detailAddress ?? "").trim();
  const vehicleInfo = parseVehicleInfo(body.vehicleInfo);

  if (
    !isValidLoginId(loginId) ||
    !isValidPassword(password) ||
    !name ||
    !isValidPhoneDigits(phoneDigits) ||
    !isValidEmail(email) ||
    !zonecode ||
    !address ||
    !detailAddress
  ) {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.invalidInput },
      { status: 400 },
    );
  }

  const store = await getMemberStore();

  if (
    (await store.findMemberByLoginId(loginId)) ||
    (await store.findMemberByEmail(email)) ||
    (await store.findMemberByPhone(phoneDigits))
  ) {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.signupConflict },
      { status: 409 },
    );
  }

  try {
    const member = await store.createCredentialsMember({
      loginId,
      password,
      name,
      phone,
      email,
      zonecode,
      address,
      detailAddress,
      vehicleInfo,
    });

    hookAlimtalkSignup(member);

    const response = NextResponse.json({
      ok: true,
      member: toMemberPublic(member),
    });
    return attachCustomerSessionCookie(response, member.id, { rotate: true });
  } catch (err) {
    if (isMemberUniqueViolation(err)) {
      return NextResponse.json(
        { ok: false, message: MEMBER_AUTH_MESSAGES.signupConflict },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.serviceUnavailable },
      { status: 500 },
    );
  }
}
