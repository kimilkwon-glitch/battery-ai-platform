import { NextResponse } from "next/server";
import { isAdminAuthConfigured, verifyAdminLogin } from "@/lib/admin/adminAccess";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SEC,
  mintAdminSessionToken,
} from "@/lib/admin/adminSession";
import { enforceIpRateLimitOrNull } from "@/lib/security/rate-limit-guard.server";
import { resetRateLimitBucket } from "@/lib/security/rate-limit.server";
import { getTrustedClientIp } from "@/lib/security/client-ip.server";
import { hashRateLimitIp } from "@/lib/security/rate-limit-hash.server";

export const dynamic = "force-dynamic";

const LOGIN_FAIL = { ok: false, error: "INVALID_CREDENTIALS" } as const;

const LOGIN_RATE_LIMIT = 10;
const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(LOGIN_FAIL, { status: 503 });
  }

  const blocked = await enforceIpRateLimitOrNull(
    request,
    "admin.auth.login",
    LOGIN_RATE_LIMIT,
    LOGIN_RATE_WINDOW_MS,
  );
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(LOGIN_FAIL, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const username = String(b.username ?? "").trim();
  const password = String(b.password ?? b.accessKey ?? "").trim();

  if (!verifyAdminLogin(username, password)) {
    return NextResponse.json(LOGIN_FAIL, { status: 401 });
  }

  const ip = getTrustedClientIp(request);
  await resetRateLimitBucket({
    namespace: "admin.auth.login",
    parts: ["ip", hashRateLimitIp(ip)],
  });

  const token = await mintAdminSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
    path: "/",
  });
  return response;
}
