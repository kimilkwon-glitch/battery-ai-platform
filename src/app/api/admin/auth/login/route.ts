import { NextResponse } from "next/server";
import { isAdminAuthConfigured, verifyAdminLogin } from "@/lib/admin/adminAccess";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SEC,
  mintAdminSessionToken,
} from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";

const LOGIN_FAIL = { ok: false, error: "INVALID_CREDENTIALS" } as const;

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(LOGIN_FAIL, { status: 503 });
  }

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
