import { NextResponse } from "next/server";
import { recordCommercePaymentFail } from "@/lib/payment/commerce-order-service";
import type { PaymentFailRequestBody } from "@/types/commerce-payment";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST — 결제 실패/취소 기록 (PG 연동 전 stub)
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const b = body as Partial<PaymentFailRequestBody>;
  if (!b.orderId?.trim()) {
    return NextResponse.json(
      { ok: false, message: "주문 정보가 없습니다." },
      { status: 400 },
    );
  }

  const result = await recordCommercePaymentFail({
    orderId: b.orderId.trim(),
    paymentRequestId: b.paymentRequestId?.trim(),
    errorCode: b.errorCode?.trim(),
    errorMessage: b.errorMessage?.trim(),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 404 });
  }

  return NextResponse.json({ ok: true, message: result.message });
}
