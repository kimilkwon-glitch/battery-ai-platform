import { NextResponse } from "next/server";
import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import { createCommerceOrder } from "@/lib/payment/commerce-order-service";
import { validateCreateOrderBody } from "@/lib/payment/validate-order-payload";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST — 자사몰 주문 생성 (PG 연동 전)
 * 실제 결제 완료 전까지 orderStatus=결제대기, paymentStatus=결제전
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

  const validated = validateCreateOrderBody(body);
  if (!validated.ok) {
    return NextResponse.json(
      { ok: false, message: validated.errors[0], errors: validated.errors },
      { status: 422 },
    );
  }

  const session = await getVerifiedCustomerSessionFromRequest(request);
  const orderBody = {
    ...validated.data,
    customerInfo: {
      ...validated.data.customerInfo,
      userId: session?.userId,
      customerType: session ? "member" : (validated.data.customerInfo.customerType ?? "guest"),
    },
  };

  const result = await createCommerceOrder(orderBody);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  const { order } = result;
  return NextResponse.json({
    ok: true,
    order: {
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      finalAmount: order.finalAmount,
      paymentRequestId: order.paymentRequestId,
    },
  });
}

export async function GET() {
  return NextResponse.json({ ok: false, message: "Method not allowed" }, { status: 405 });
}
