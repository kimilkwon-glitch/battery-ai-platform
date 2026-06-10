import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import { loadOrderRelatedCustomerActivity } from "@/lib/admin/order-related-customer-activity";
import { getCommerceOrder } from "@/lib/payment/commerce-order-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    return NextResponse.json({ ok: false, message: "주문을 찾을 수 없습니다." }, { status: 404 });
  }

  const activity = await loadOrderRelatedCustomerActivity({
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    customerPhone: order.customerPhone,
    customerName: order.customerName,
  });

  return NextResponse.json({ ok: true, activity });
}
