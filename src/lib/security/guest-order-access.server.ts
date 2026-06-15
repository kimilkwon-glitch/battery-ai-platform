import "server-only";

import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { getCustomerSessionSecret } from "@/lib/auth/member-credentials";
import {
  normalizeCustomerLookupName,
  normalizeCustomerLookupPhone,
} from "@/lib/orders/customer-lookup-identity";
import { normalizePhoneDigits } from "@/lib/order-request/order-request-lookup";
import type { CommerceOrderRecord } from "@/types/commerce-payment";
import {
  createSignedAccessToken,
  readCookieValue,
  verifySignedAccessToken,
} from "@/lib/security/signed-access-token.server";

export const GUEST_ORDER_ACCESS_COOKIE = "bm_guest_order_access" as const;
export const GUEST_ORDER_ACCESS_MAX_AGE_SEC = 2 * 60 * 60;

const LEGACY_SUBJECT_PREFIX = "goa:";
const CUSTOMER_SUBJECT_PREFIX = "gca:";

function guestCustomerSubject(accessKey: string): string {
  return `${CUSTOMER_SUBJECT_PREFIX}${accessKey}`;
}

/** 이름+연락처 조합 서명 키 — 쿠키에 원문 저장하지 않음 */
export async function computeGuestLookupAccessKey(
  customerName: string,
  phone: string,
): Promise<string> {
  const name = normalizeCustomerLookupName(customerName);
  const digits = normalizeCustomerLookupPhone(phone);
  const payload = `${name}|${digits}`;
  const secret = getCustomerSessionSecret();
  return createHmac("sha256", secret).update(payload).digest("hex").slice(0, 32);
}

export async function orderMatchesGuestAccessKey(
  order: CommerceOrderRecord,
  accessKey: string,
): Promise<boolean> {
  const key = await computeGuestLookupAccessKey(order.customerName, order.customerPhone);
  return key === accessKey;
}

export async function mintGuestCustomerAccessToken(
  customerName: string,
  phone: string,
): Promise<string> {
  const accessKey = await computeGuestLookupAccessKey(customerName, phone);
  return createSignedAccessToken(
    guestCustomerSubject(accessKey),
    getCustomerSessionSecret(),
    GUEST_ORDER_ACCESS_MAX_AGE_SEC,
  );
}

/** @deprecated 단일 주문 쿠키 — 결제 직후 등 legacy */
export async function mintGuestOrderAccessToken(orderId: string): Promise<string> {
  return createSignedAccessToken(
    `${LEGACY_SUBJECT_PREFIX}${orderId.trim()}`,
    getCustomerSessionSecret(),
    GUEST_ORDER_ACCESS_MAX_AGE_SEC,
  );
}

async function resolveAccessKeyFromToken(
  token: string | undefined | null,
): Promise<string | null> {
  if (!token) return null;
  const verified = await verifySignedAccessToken(token, getCustomerSessionSecret());
  if (!verified) return null;
  if (verified.subject.startsWith(CUSTOMER_SUBJECT_PREFIX)) {
    return verified.subject.slice(CUSTOMER_SUBJECT_PREFIX.length) || null;
  }
  return null;
}

export async function getGuestOrderAccessKey(request: Request): Promise<string | null> {
  const token = readCookieValue(request.headers.get("cookie"), GUEST_ORDER_ACCESS_COOKIE);
  return resolveAccessKeyFromToken(token);
}

/** legacy 단일 주문 ID (goa:) */
export async function getGuestOrderAccessOrderId(request: Request): Promise<string | null> {
  const token = readCookieValue(request.headers.get("cookie"), GUEST_ORDER_ACCESS_COOKIE);
  if (!token) return null;
  const verified = await verifySignedAccessToken(token, getCustomerSessionSecret());
  if (!verified?.subject.startsWith(LEGACY_SUBJECT_PREFIX)) return null;
  return verified.subject.slice(LEGACY_SUBJECT_PREFIX.length) || null;
}

export async function assertGuestOrderAccess(
  request: Request,
  orderId: string,
  order?: CommerceOrderRecord | null,
): Promise<boolean> {
  const legacyId = await getGuestOrderAccessOrderId(request);
  if (legacyId === orderId.trim()) return true;

  const accessKey = await getGuestOrderAccessKey(request);
  if (!accessKey) return false;

  const target =
    order ??
    (await (
      await import("@/lib/payment/commerce-order-store")
    ).storeCommerceOrderGet(orderId.trim()));
  if (!target) return false;
  return orderMatchesGuestAccessKey(target, accessKey);
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

export async function attachGuestCustomerAccessCookie(
  response: NextResponse,
  customerName: string,
  phone: string,
): Promise<void> {
  const token = await mintGuestCustomerAccessToken(customerName, phone);
  response.cookies.set(GUEST_ORDER_ACCESS_COOKIE, token, guestOrderAccessCookieOptions());
}

/** @deprecated */
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

export function verifyGuestOrderNamePhoneProof(
  order: CommerceOrderRecord,
  name?: string | null,
  phone?: string | null,
): boolean {
  const inputName = normalizeCustomerLookupName(name ?? "");
  const storedName = normalizeCustomerLookupName(order.customerName);
  if (!inputName || inputName !== storedName) return false;
  const inputDigits = normalizeCustomerLookupPhone(phone ?? "");
  const storedDigits = normalizeCustomerLookupPhone(order.customerPhone);
  return inputDigits.length >= 9 && inputDigits === storedDigits;
}
