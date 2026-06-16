import "server-only";

import { cookies } from "next/headers";
import { getCustomerSessionSecret } from "@/lib/auth/member-credentials";
import { verifyCustomerSessionWithEpoch } from "@/lib/auth/customer-session-epoch.server";
import {
  createCustomerSessionToken,
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_MAX_AGE_SEC,
  getCustomerSessionCookieFromHeader,
  verifyCustomerSessionToken,
  type VerifiedCustomerSession,
} from "@/lib/auth/customer-session-core";

export {
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_MAX_AGE_SEC,
  createCustomerSessionToken,
  getCustomerSessionCookieFromHeader,
  verifyCustomerSessionToken,
};

export async function getCustomerSessionFromCookies(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(CUSTOMER_SESSION_COOKIE)?.value;
}

export async function getVerifiedCustomerSession(): Promise<VerifiedCustomerSession | null> {
  const token = await getCustomerSessionFromCookies();
  return verifyCustomerSessionWithEpoch(token);
}

export async function getVerifiedCustomerSessionFromRequest(
  request: Request,
): Promise<VerifiedCustomerSession | null> {
  const token = getCustomerSessionCookieFromHeader(request.headers.get("cookie"));
  return verifyCustomerSessionWithEpoch(token);
}

export async function mintCustomerSessionToken(
  userId: string,
  sessionEpoch = 0,
): Promise<string> {
  return createCustomerSessionToken(userId, getCustomerSessionSecret(), sessionEpoch);
}

export function customerSessionCookieOptions(maxAge = CUSTOMER_SESSION_MAX_AGE_SEC) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}
