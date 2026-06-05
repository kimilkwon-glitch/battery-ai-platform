import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import { commerceOrderToAdminMeta } from "@/lib/payment/commerce-order-admin-mapper";
import { getCommerceOrder } from "@/lib/payment/commerce-order-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET — 자사몰 주문 결제 상세 (관리자 전용)
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { orderId } = await context.params;
  const order = await getCommerceOrder(orderId);
  if (!order) {
    return NextResponse.json(
      { ok: false, message: "주문을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    order,
    paymentMeta: commerceOrderToAdminMeta(order),
  });
}
