import { NextResponse } from "next/server";
import { getCommerceOrder } from "@/lib/payment/commerce-order-service";
import { assertOrderPaymentAccess } from "@/lib/payment/order-payment-access.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET — 결제 흐름용 주문 요약 (paymentRequestId 일치 시에만 상세 반환)
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await context.params;
  const paymentRequestId = new URL(request.url).searchParams.get("paymentRequestId")?.trim();

  const order = await getCommerceOrder(orderId);
  if (!order) {
    return NextResponse.json(
      { ok: false, message: "주문 정보를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const access = await assertOrderPaymentAccess(request, order, { paymentRequestId });
  if (!access.ok) {
    return NextResponse.json({ ok: false, message: access.message }, { status: access.status });
  }

  return NextResponse.json({
    ok: true,
    order: {
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      productName: order.productName,
      brand: order.brand,
      batteryCode: order.batteryCode,
      vehicleName: order.vehicleName,
      vehicleYear: order.vehicleYear,
      vehicleFuel: order.vehicleFuel,
      fulfillmentType: order.fulfillmentType,
      returnBatteryOption: order.returnBatteryOption,
      finalAmount: order.finalAmount,
      address: order.address,
      store: order.store,
      requestMemo: order.requestMemo,
      priceLines: order.priceLines,
      paymentRequestId: order.paymentRequestId,
      paidAmount: order.paidAmount,
      paymentMethod: order.paymentMethod,
      pgTransactionId: order.pgTransactionId,
    },
  });
}
