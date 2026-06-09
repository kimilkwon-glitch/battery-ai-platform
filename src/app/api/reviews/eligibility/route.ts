import { NextResponse } from "next/server";
import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { reviewExistsForOrder } from "@/lib/cms/customer-review-store.postgres";
import { storeCommerceOrderListByUserId } from "@/lib/payment/commerce-order-store";

export const dynamic = "force-dynamic";

const ELIGIBLE_STATUSES = new Set(["completed", "payment_completed", "shipping"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const battery = searchParams.get("battery")?.trim().toUpperCase();
  const orderId = searchParams.get("orderId")?.trim();

  const session = await getVerifiedCustomerSessionFromRequest(request);
  if (!session?.userId || !isPostgresConfigured()) {
    return NextResponse.json({ ok: true, canWrite: false });
  }

  try {
    const orders = await storeCommerceOrderListByUserId(session.userId, 50);
    const eligible = orders.filter(
      (o) =>
        ELIGIBLE_STATUSES.has(o.orderStatus) &&
        (!battery || o.batteryCode?.toUpperCase() === battery) &&
        (!orderId || o.orderId === orderId),
    );

    for (const order of eligible) {
      const exists = await reviewExistsForOrder(order.orderId);
      if (!exists) {
        return NextResponse.json({
          ok: true,
          canWrite: true,
          orderId: order.orderId,
          batteryCode: order.batteryCode,
        });
      }
    }
    return NextResponse.json({ ok: true, canWrite: false });
  } catch {
    return NextResponse.json({ ok: true, canWrite: false });
  }
}
