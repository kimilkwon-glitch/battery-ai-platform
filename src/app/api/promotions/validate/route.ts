import { NextResponse } from "next/server";
import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import { computeCheckoutTotal } from "@/lib/pricing/compute-checkout-total";
import { evaluatePromotions } from "@/lib/promotion/promotion-evaluate";
import { countCompletedOrdersForMember } from "@/lib/promotion/promotion-store.postgres";
import { getMemberStore } from "@/lib/auth/member-store";
import type { BatteryCartItem } from "@/types/cart";
import type {
  OrderRequestFulfillmentMethod,
  OrderRequestUsedBatteryOption,
} from "@/types/order-request";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Body = {
  cartItems?: BatteryCartItem[];
  fulfillmentType?: OrderRequestFulfillmentMethod;
  returnBatteryOption?: OrderRequestUsedBatteryOption;
  couponCode?: string | null;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!Array.isArray(body.cartItems) || body.cartItems.length === 0) {
    return NextResponse.json({ ok: false, message: "주문 상품이 없습니다." }, { status: 400 });
  }

  if (!body.fulfillmentType || !body.returnBatteryOption) {
    return NextResponse.json({ ok: false, message: "주문 정보가 부족합니다." }, { status: 400 });
  }

  const session = await getVerifiedCustomerSessionFromRequest(request);
  const totals = computeCheckoutTotal(
    body.cartItems,
    body.fulfillmentType,
    body.returnBatteryOption,
  );

  if (totals.finalAmount == null) {
    return NextResponse.json(
      { ok: false, message: "결제 금액을 계산할 수 없습니다." },
      { status: 400 },
    );
  }

  let completedOrderCount = 0;
  let memberCreatedAt: string | null = null;

  if (session?.userId) {
    completedOrderCount = await countCompletedOrdersForMember(session.userId);
    try {
      const store = await getMemberStore();
      const member = await store.findMemberById(session.userId);
      memberCreatedAt = member?.createdAt ?? null;
    } catch {
      /* member store unavailable */
    }
  }

  const evaluation = await evaluatePromotions({
    memberId: session?.userId,
    couponCode: body.couponCode,
    items: body.cartItems,
    fulfillmentType: body.fulfillmentType,
    returnBatteryOption: body.returnBatteryOption,
    productSubtotal: totals.productSubtotal ?? 0,
    batteryReturnFee: totals.batteryReturnFee,
    completedOrderCount,
    memberCreatedAt,
  });

  return NextResponse.json({
    ok: true,
    appliedPromotions: evaluation.appliedPromotions,
    promotionDiscountTotal: evaluation.promotionDiscountTotal,
    finalAmount: evaluation.finalAmount,
    baseSubtotal: totals.finalAmount,
    eligibleAutomatic: evaluation.eligibleAutomatic.map((e) => ({
      id: e.promotion.id,
      title: e.promotion.title,
      reason: e.reason,
    })),
    couponError: evaluation.couponError,
  });
}
