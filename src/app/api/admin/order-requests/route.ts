import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import { listOrderRequests } from "@/lib/order-request/order-request-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET — 관리자 주문 요청 목록 (11차)
 * 보호: httpOnly 세션 쿠키 / Bearer 세션 / x-admin-key(서버·CI 전용)
 */
export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  try {
    const items = await listOrderRequests({
      status: searchParams.get("status"),
      q: searchParams.get("q"),
      limit: Number(searchParams.get("limit")) || 200,
    });
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json(
      { ok: false, message: "목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
