import { NextResponse } from "next/server";
import { confirmCommercePayment } from "@/lib/payment/commerce-order-service";
import type { PaymentConfirmRequestBody } from "@/types/commerce-payment";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST — 토스페이먼츠 결제 승인 (서버 전용)
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

  const b = body as Partial<PaymentConfirmRequestBody>;
  const result = await confirmCommercePayment({
    orderId: b.orderId?.trim() ?? "",
    paymentRequestId: b.paymentRequestId?.trim(),
    paymentKey: b.paymentKey?.trim(),
    amount: b.amount != null ? Number(b.amount) : undefined,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message, code: result.code },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data);
}
