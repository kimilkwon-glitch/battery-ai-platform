import { NextResponse } from "next/server";
import { isCustomerAuthConfigured } from "@/lib/auth/member-credentials";
import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import { commerceOrderToMineListItem } from "@/lib/orders/commerce-order-mine";
import { storeCommerceOrderListByUserId } from "@/lib/payment/commerce-order-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  if (!isCustomerAuthConfigured()) {
    return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const session = await getVerifiedCustomerSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit") ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(1, Math.floor(limitParam)), MAX_LIMIT)
    : DEFAULT_LIMIT;

  try {
    const records = await storeCommerceOrderListByUserId(session.userId, limit);
    const orders = records.map(commerceOrderToMineListItem);
    return NextResponse.json({ ok: true, orders });
  } catch {
    return NextResponse.json(
      { ok: false, message: "주문 내역을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 },
    );
  }
}
