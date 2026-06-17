import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import { reconcileCommerceOrderPayment } from "@/lib/payment/commerce-payment-confirm.server";
import { isTossPaymentsConfigured } from "@/lib/payment/toss-payments.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST — 관리자 단일 주문 결제 상태 재확인 (Toss 조회 → DB 동기화)
 * Toss 계약·secret 미설정 시 503
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  if (!isTossPaymentsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message: "Toss 결제 연동이 활성화되지 않았습니다. 계약 후 이용 가능합니다.",
        code: "TOSS_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }

  const { orderId } = await context.params;
  const result = await reconcileCommerceOrderPayment(orderId);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message, code: result.code },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    message: result.message,
    transitioned: result.transitioned,
    orderStatus: result.order.orderStatus,
    paymentStatus: result.order.paymentStatus,
  });
}
