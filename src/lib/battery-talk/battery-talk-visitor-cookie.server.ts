import "server-only";

import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { readCookieValue } from "@/lib/security/signed-access-token.server";

export const BATTERY_TALK_VISITOR_COOKIE = "bm_bt_visitor" as const;
export const BATTERY_TALK_VISITOR_MAX_AGE_SEC = 30 * 24 * 60 * 60;

export function createBatteryTalkVisitorId(): string {
  return `btv_${Date.now()}_${randomBytes(8).toString("hex")}`;
}

export function batteryTalkVisitorCookieOptions(maxAge = BATTERY_TALK_VISITOR_MAX_AGE_SEC) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

export function getBatteryTalkVisitorFromRequest(request: Request): string {
  return readCookieValue(request.headers.get("cookie"), BATTERY_TALK_VISITOR_COOKIE)?.trim() ?? "";
}

export function setBatteryTalkVisitorCookie(response: NextResponse, visitorId: string): void {
  const vid = visitorId.trim();
  if (!vid) return;
  response.cookies.set(BATTERY_TALK_VISITOR_COOKIE, vid, batteryTalkVisitorCookieOptions());
}

/** 쿠키·요청 body·신규 발급 순으로 visitorId 확정 후 응답 쿠키 설정 */
export function resolveBatteryTalkVisitorId(
  request: Request,
  response: NextResponse,
  proposed?: string | null,
): string {
  const fromCookie = getBatteryTalkVisitorFromRequest(request);
  const fromBody = proposed?.trim();
  const visitorId = fromCookie || fromBody || createBatteryTalkVisitorId();
  if (!fromCookie || fromCookie !== visitorId) {
    setBatteryTalkVisitorCookie(response, visitorId);
  }
  return visitorId;
}
