import { NextResponse } from "next/server";
import { getCustomerSessionSecret } from "@/lib/auth/member-credentials";
import {
  clearCustomerSessionCookie,
  isMemberAuthReady,
} from "@/lib/auth/member-api-helpers";
import {
  getCustomerSessionCookieFromHeader,
  verifyCustomerSessionToken,
} from "@/lib/auth/customer-session-core";
import { getMemberStore } from "@/lib/auth/member-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const token = getCustomerSessionCookieFromHeader(request.headers.get("cookie"));
  if (token && isMemberAuthReady()) {
    try {
      const session = await verifyCustomerSessionToken(token, getCustomerSessionSecret());
      if (session) {
        const store = await getMemberStore();
        await store.bumpMemberSessionEpoch(session.userId);
      }
    } catch {
      // 로그아웃은 쿠키 삭제·epoch bump 시도 후 항상 성공 응답
    }
  }

  return clearCustomerSessionCookie(NextResponse.json({ ok: true }));
}
