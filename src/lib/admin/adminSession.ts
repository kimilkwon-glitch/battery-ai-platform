import "server-only";

import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SEC,
  createSessionToken,
  getSessionCookieFromHeader,
  verifySessionToken,
} from "@/lib/admin/adminSessionCore";
import { getAdminAccessSecret } from "@/lib/admin/adminAccess";

export { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_SEC };

export async function getAdminSessionFromCookies(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(ADMIN_SESSION_COOKIE)?.value;
}

export async function isAdminSessionValid(): Promise<boolean> {
  const token = await getAdminSessionFromCookies();
  return verifySessionToken(token, getAdminAccessSecret());
}

export async function isAdminSessionValidFromRequest(
  request: Request,
): Promise<boolean> {
  const token = getSessionCookieFromHeader(request.headers.get("cookie"));
  return verifySessionToken(token, getAdminAccessSecret());
}

export async function mintAdminSessionToken(): Promise<string> {
  return createSessionToken(getAdminAccessSecret());
}

export { createSessionToken, verifySessionToken, getSessionCookieFromHeader };
