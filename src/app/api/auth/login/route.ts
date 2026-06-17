import { NextResponse } from "next/server";
import { verifyMemberPassword } from "@/lib/auth/member-password.server";
import { MEMBER_AUTH_MESSAGES } from "@/lib/auth/member-auth-errors";
import { toMemberPublic } from "@/lib/auth/member-public";
import { getMemberStore } from "@/lib/auth/member-store";
import {
  hashMemberLoginAccountKey,
  normalizeMemberLoginIdOrEmail,
} from "@/lib/auth/member-login-identity.server";
import {
  attachCustomerSessionCookie,
  isMemberAuthReady,
  memberServiceUnavailable,
} from "@/lib/auth/member-api-helpers";
import { getTrustedClientIp } from "@/lib/security/client-ip.server";
import { hashRateLimitIp } from "@/lib/security/rate-limit-hash.server";
import {
  consumeRateLimit,
  rateLimitBlockedResponse,
  resetRateLimitBucket,
} from "@/lib/security/rate-limit.server";
import { isValidPassword } from "@/lib/auth/signup-validation";

export const dynamic = "force-dynamic";

const LOGIN_FAIL = { ok: false, message: MEMBER_AUTH_MESSAGES.loginFailed } as const;

const LOGIN_RATE_LIMIT = 10;
const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  if (!isMemberAuthReady()) {
    return memberServiceUnavailable();
  }

  const ip = getTrustedClientIp(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(LOGIN_FAIL, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const idOrEmail = normalizeMemberLoginIdOrEmail(String(b.idOrEmail ?? ""));
  const password = String(b.password ?? "");

  if (!idOrEmail || !password || !isValidPassword(password)) {
    return NextResponse.json(LOGIN_FAIL, { status: 400 });
  }

  const ipLimit = await consumeRateLimit({
    namespace: "auth.login",
    parts: ["ip", hashRateLimitIp(ip)],
    limit: LOGIN_RATE_LIMIT,
    windowMs: LOGIN_RATE_WINDOW_MS,
  });
  const accountLimit = await consumeRateLimit({
    namespace: "auth.login",
    parts: ["acct", hashMemberLoginAccountKey(idOrEmail)],
    limit: LOGIN_RATE_LIMIT,
    windowMs: LOGIN_RATE_WINDOW_MS,
  });

  const blocked = !ipLimit.ok ? ipLimit : !accountLimit.ok ? accountLimit : null;
  if (blocked) {
    const resp = rateLimitBlockedResponse(
      MEMBER_AUTH_MESSAGES.loginRateLimited,
      blocked.retryAfterSec,
      blocked.storeUnavailable,
    );
    return NextResponse.json(resp.body, { status: resp.status, headers: resp.headers });
  }

  const store = await getMemberStore();
  const member = await store.findMemberByIdOrEmail(idOrEmail);

  if (
    !member ||
    member.provider !== "credentials" ||
    !member.passwordHash ||
    !verifyMemberPassword(password, member.passwordHash)
  ) {
    return NextResponse.json(LOGIN_FAIL, { status: 401 });
  }

  await resetRateLimitBucket({
    namespace: "auth.login",
    parts: ["ip", hashRateLimitIp(ip)],
  });
  await resetRateLimitBucket({
    namespace: "auth.login",
    parts: ["acct", hashMemberLoginAccountKey(idOrEmail)],
  });

  const response = NextResponse.json({
    ok: true,
    member: toMemberPublic(member),
  });
  return attachCustomerSessionCookie(response, member.id, { rotate: true });
}
