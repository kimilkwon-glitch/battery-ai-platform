import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const NO_STORE = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

/** /search?q=… 별 CDN·브라우저 캐시 혼재 방지 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(NO_STORE)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: ["/search"],
};
