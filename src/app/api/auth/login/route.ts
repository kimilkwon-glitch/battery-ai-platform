import { NextResponse } from "next/server";
import { verifyMemberPassword } from "@/lib/auth/member-password.server";
import { MEMBER_AUTH_MESSAGES } from "@/lib/auth/member-auth-errors";
import { toMemberPublic } from "@/lib/auth/member-public";
import { getMemberStore } from "@/lib/auth/member-store";
import {
  attachCustomerSessionCookie,
  isMemberAuthReady,
  memberServiceUnavailable,
} from "@/lib/auth/member-api-helpers";

export const dynamic = "force-dynamic";

const LOGIN_FAIL = { ok: false, message: MEMBER_AUTH_MESSAGES.loginFailed } as const;

export async function POST(request: Request) {
  if (!isMemberAuthReady()) {
    return memberServiceUnavailable();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(LOGIN_FAIL, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const idOrEmail = String(b.idOrEmail ?? "").trim();
  const password = String(b.password ?? "");

  if (!idOrEmail || !password) {
    return NextResponse.json(LOGIN_FAIL, { status: 400 });
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

  const response = NextResponse.json({
    ok: true,
    member: toMemberPublic(member),
  });
  return attachCustomerSessionCookie(response, member.id);
}
