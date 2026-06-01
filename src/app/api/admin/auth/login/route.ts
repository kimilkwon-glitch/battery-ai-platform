import { NextResponse } from "next/server";
import { verifyAccessKeyInput } from "@/lib/admin/adminAccess";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SEC,
  mintAdminSessionToken,
} from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_REQUEST" },
      { status: 400 },
    );
  }

  const accessKey = String((body as Record<string, unknown>).accessKey ?? "").trim();
  if (!verifyAccessKeyInput(accessKey)) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401 },
    );
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
