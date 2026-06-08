import "server-only";
import { computeServerOrderAmount } from "@/lib/payment/compute-order-amount";
import { countCompletedOrdersForMember } from "@/lib/promotion/promotion-store.postgres";
import { evaluatePromotions, recomputeWithStoredPromotions } from "@/lib/promotion/promotion-evaluate";
import { getMemberStore } from "@/lib/auth/member-store";
import type { BatteryCartItem } from "@/types/cart";
import type { AppliedPromotion } from "@/types/promotion";
import type {
  OrderRequestFulfillmentMethod,
  OrderRequestUsedBatteryOption,
} from "@/types/order-request";

export type OrderAmountWithPromotions = {
  priceLines: ReturnType<typeof computeServerOrderAmount>["priceLines"];
  productSubtotal: number | null;
  batteryReturnFee: number;
  deliveryFee: number;
  storeInstallDiscount: number;
  internetPrice: number | null;
  onsitePrice: number | null;
  promotionDiscountTotal: number;
  appliedPromotions: AppliedPromotion[];
  finalAmount: number | null;
  couponError?: string;
};

export async function computeOrderAmountWithPromotions(
  items: BatteryCartItem[],
  fulfillmentType: OrderRequestFulfillmentMethod,
  returnBatteryOption: OrderRequestUsedBatteryOption,
  options?: {
    memberId?: string | null;
    couponCode?: string | null;
    excludeOrderId?: string;
  },
): Promise<OrderAmountWithPromotions> {
  const base = computeServerOrderAmount(items, fulfillmentType, returnBatteryOption);
  const productSubtotal = base.productSubtotal ?? 0;
  const batteryReturnFee = base.batteryReturnFee;

  if (base.finalAmount == null) {
    return {
      ...base,
      promotionDiscountTotal: 0,
      appliedPromotions: [],
      finalAmount: null,
    };
  }

  let completedOrderCount = 0;
  let memberCreatedAt: string | null = null;

  if (options?.memberId) {
    completedOrderCount = await countCompletedOrdersForMember(
      options.memberId,
      options.excludeOrderId,
    );
    const store = await getMemberStore();
    const member = await store.findMemberById(options.memberId);
    memberCreatedAt = member?.createdAt ?? null;
  }

  const evaluation = await evaluatePromotions({
    memberId: options?.memberId,
    couponCode: options?.couponCode,
    items,
    fulfillmentType,
    returnBatteryOption,
    productSubtotal,
    batteryReturnFee,
    completedOrderCount,
    memberCreatedAt,
    excludeOrderId: options?.excludeOrderId,
  });

  return {
    priceLines: base.priceLines,
    productSubtotal: base.productSubtotal,
    batteryReturnFee: base.batteryReturnFee,
    deliveryFee: base.deliveryFee,
    storeInstallDiscount: base.storeInstallDiscount,
    internetPrice: base.internetPrice,
    onsitePrice: base.onsitePrice,
    promotionDiscountTotal: evaluation.promotionDiscountTotal,
    appliedPromotions: evaluation.appliedPromotions,
    finalAmount: evaluation.finalAmount,
    couponError: evaluation.couponError,
  };
}

export function computeFinalFromStoredPromotions(
  items: BatteryCartItem[],
  fulfillmentType: OrderRequestFulfillmentMethod,
  returnBatteryOption: OrderRequestUsedBatteryOption,
  appliedPromotions: AppliedPromotion[],
): OrderAmountWithPromotions {
  const base = computeServerOrderAmount(items, fulfillmentType, returnBatteryOption);
  const subtotal = (base.productSubtotal ?? 0) + base.batteryReturnFee;

  if (base.finalAmount == null) {
    return {
      ...base,
      promotionDiscountTotal: 0,
      appliedPromotions: [],
      finalAmount: null,
    };
  }

  const discounted = recomputeWithStoredPromotions(subtotal, appliedPromotions);

  return {
    priceLines: base.priceLines,
    productSubtotal: base.productSubtotal,
    batteryReturnFee: base.batteryReturnFee,
    deliveryFee: base.deliveryFee,
    storeInstallDiscount: base.storeInstallDiscount,
    internetPrice: base.internetPrice,
    onsitePrice: base.onsitePrice,
    promotionDiscountTotal: discounted.promotionDiscountTotal,
    appliedPromotions,
    finalAmount: discounted.finalAmount,
  };
}
