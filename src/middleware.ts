import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/admin/adminSessionCore";

const NO_STORE = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

function getAdminSecret(): string {
  const fromEnv = process.env.ADMIN_ACCESS_KEY?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return "";
  return "battery-manager-admin";
}

/** /search · /batteries — query·규격별 CDN 캐시 혼재 방지 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const secret = getAdminSecret();
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const valid = secret && (await verifySessionToken(token, secret));

    if (!valid) {
      const login = request.nextUrl.clone();
      login.pathname = "/admin/login";
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/search") || pathname.startsWith("/batteries")) {
    const response = NextResponse.next();
    for (const [key, value] of Object.entries(NO_STORE)) {
      response.headers.set(key, value);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/search", "/batteries/:path*"],
};
