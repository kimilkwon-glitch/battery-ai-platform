import "server-only";

import { NextResponse } from "next/server";
import { getCustomerSessionSecret } from "@/lib/auth/member-credentials";
import { normalizePhoneDigits } from "@/lib/order-request/order-request-lookup";
import type { CommerceOrderRecord } from "@/types/commerce-payment";
import {
  createSignedAccessToken,
  readCookieValue,
  verifySignedAccessToken,
} from "@/lib/security/signed-access-token.server";

export const GUEST_ORDER_ACCESS_COOKIE = "bm_guest_order_access" as const;
export const GUEST_ORDER_ACCESS_MAX_AGE_SEC = 2 * 60 * 60;

function guestOrderSubject(orderId: string): string {
  return `goa:${orderId.trim()}`;
}

export async function mintGuestOrderAccessToken(orderId: string): Promise<string> {
  return createSignedAccessToken(
    guestOrderSubject(orderId),
    getCustomerSessionSecret(),
    GUEST_ORDER_ACCESS_MAX_AGE_SEC,
  );
}

export async function verifyGuestOrderAccessToken(
  token: string | undefined | null,
  orderId: string,
): Promise<boolean> {
  const verified = await verifySignedAccessToken(
    token,
    getCustomerSessionSecret(),
    guestOrderSubject(orderId),
  );
  return Boolean(verified);
}

export async function getGuestOrderAccessOrderId(request: Request): Promise<string | null> {
  const token = readCookieValue(request.headers.get("cookie"), GUEST_ORDER_ACCESS_COOKIE);
  if (!token) return null;
  const verified = await verifySignedAccessToken(token, getCustomerSessionSecret());
  if (!verified?.subject.startsWith("goa:")) return null;
  return verified.subject.slice(4) || null;
}

export async function assertGuestOrderAccess(
  request: Request,
  orderId: string,
): Promise<boolean> {
  const bound = await getGuestOrderAccessOrderId(request);
  return bound === orderId.trim();
}

export function guestOrderAccessCookieOptions(maxAge = GUEST_ORDER_ACCESS_MAX_AGE_SEC) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

export async function attachGuestOrderAccessCookie(
  response: NextResponse,
  orderId: string,
): Promise<void> {
  const token = await mintGuestOrderAccessToken(orderId);
  response.cookies.set(GUEST_ORDER_ACCESS_COOKIE, token, guestOrderAccessCookieOptions());
}

export function verifyGuestOrderPhoneProof(
  order: CommerceOrderRecord,
  phone?: string | null,
  orderNumber?: string | null,
): boolean {
  const inputDigits = normalizePhoneDigits(phone ?? "");
  const storedDigits = normalizePhoneDigits(order.customerPhone);
  if (inputDigits.length < 9 || inputDigits !== storedDigits) return false;
  const ref = orderNumber?.trim();
  if (ref) {
    const matchesNumber = ref === order.orderNumber.trim();
    const matchesId = ref === order.orderId.trim();
    if (!matchesNumber && !matchesId) return false;
  }
  return true;
}
