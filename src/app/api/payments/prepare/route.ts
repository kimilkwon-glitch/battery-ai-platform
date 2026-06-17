import { NextResponse } from "next/server";
import { prepareCommercePayment } from "@/lib/payment/commerce-order-service";
import { getSiteOrigin } from "@/lib/payment/payment-config";
import type { PaymentPrepareRequestBody } from "@/types/commerce-payment";
import { enforceIpRateLimitOrNull } from "@/lib/security/rate-limit-guard.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST — 결제 준비 (PG 연동 전: 준비 데이터만 반환)
 */
export async function POST(request: Request) {
  const blocked = await enforceIpRateLimitOrNull(request, "payments.prepare", 30, 15 * 60 * 1000);
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const b = body as Partial<PaymentPrepareRequestBody>;
  if (!b.orderId?.trim()) {
    return NextResponse.json(
      { ok: false, message: "주문 정보가 없습니다." },
      { status: 400 },
    );
  }

  const origin = getSiteOrigin();
  const result = await prepareCommercePayment(
    request,
    {
      orderId: b.orderId.trim(),
      clientAmount: b.clientAmount,
      paymentRequestId: b.paymentRequestId?.trim(),
      orderNumber: b.orderNumber?.trim(),
      phone: b.phone?.trim(),
    },
    origin,
  );

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
