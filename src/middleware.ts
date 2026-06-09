import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSessionSecret } from "@/lib/admin/adminCredentials";
import { ROOT_DOMAIN } from "@/lib/site-url";
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/admin/adminSessionCore";

const NO_STORE = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

const ADMIN_NOINDEX = {
  "X-Robots-Tag": "noindex, nofollow",
};

const SECURITY_HEADERS = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function applyHeaders(response: NextResponse, extra: Record<string, string>) {
  for (const [key, value] of Object.entries({ ...SECURITY_HEADERS, ...extra })) {
    response.headers.set(key, value);
  }
  return response;
}

async function hasValidAdminSession(request: NextRequest): Promise<boolean> {
  const secret = getAdminSessionSecret();
  if (!secret) return false;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return verifySessionToken(token, secret);
}

/** batterymanager.co.kr → www.batterymanager.co.kr */
function redirectRootToWww(request: NextRequest): NextResponse | null {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  if (host !== ROOT_DOMAIN) return null;

  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.host = `www.${ROOT_DOMAIN}`;
  return NextResponse.redirect(url, 308);
}

/** /search · /batteries — query·규격별 CDN 캐시 혼재 방지 */
export async function middleware(request: NextRequest) {
  const wwwRedirect = redirectRootToWww(request);
  if (wwwRedirect) return applyHeaders(wwwRedirect, {});

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    const isLogin = pathname === "/api/admin/auth/login" && request.method === "POST";
    const isLogout = pathname === "/api/admin/auth/logout" && request.method === "POST";
    if (isLogin || isLogout) {
      return applyHeaders(NextResponse.next(), NO_STORE);
    }

    if (!(await hasValidAdminSession(request))) {
      return applyHeaders(
        NextResponse.json(
          { ok: false, error: "UNAUTHORIZED", message: "관리자 인증이 필요합니다." },
          { status: 401 },
        ),
        NO_STORE,
      );
    }
    return applyHeaders(NextResponse.next(), NO_STORE);
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/coupons") {
      const dest = request.nextUrl.clone();
      dest.pathname = "/admin/promotions";
      return applyHeaders(NextResponse.redirect(dest, 308), { ...NO_STORE, ...ADMIN_NOINDEX });
    }

    if (pathname === "/admin/login") {
      return applyHeaders(NextResponse.next(), { ...NO_STORE, ...ADMIN_NOINDEX });
    }

    if (!(await hasValidAdminSession(request))) {
      const login = request.nextUrl.clone();
      login.pathname = "/admin/login";
      login.searchParams.set("next", pathname);
      return applyHeaders(NextResponse.redirect(login), { ...NO_STORE, ...ADMIN_NOINDEX });
    }

    return applyHeaders(NextResponse.next(), { ...NO_STORE, ...ADMIN_NOINDEX });
  }

  if (pathname.startsWith("/search") || pathname.startsWith("/batteries")) {
    const response = NextResponse.next();
    applyHeaders(response, NO_STORE);
    return response;
  }

  const response = NextResponse.next();
  applyHeaders(response, {});
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/api/admin/:path*",
    "/search",
    "/batteries/:path*",
    "/((?!_next/static|_next/image|favicon.ico|assets|images|fonts).*)",
  ],
};
