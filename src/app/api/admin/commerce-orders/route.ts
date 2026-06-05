import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import { commerceOrderToListItem } from "@/lib/payment/commerce-order-admin-mapper";
import { storeCommerceOrderList } from "@/lib/payment/commerce-order-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET — 자사몰 결제 대기/주문 목록 (관리자 전용)
 */
export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit")) || 200;

  try {
    const records = await storeCommerceOrderList(limit);
    return NextResponse.json({
      ok: true,
      items: records.map(commerceOrderToListItem),
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
