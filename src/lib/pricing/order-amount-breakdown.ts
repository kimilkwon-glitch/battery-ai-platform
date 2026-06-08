import { computeServerOrderAmount } from "@/lib/payment/compute-order-amount";
import { calculateCartItemPrice, normalizeFulfillmentPriceType } from "@/lib/pricing/order-price";
import type { BatteryCartItem } from "@/types/cart";
import type {
  OrderRequestFulfillmentMethod,
  OrderRequestUsedBatteryOption,
} from "@/types/order-request";

/** 토스 결제·주문 저장용 금액 산출 내역 */
export type OrderAmountBreakdown = {
  basePrice: number | null;
  fulfillmentType: ReturnType<typeof normalizeFulfillmentPriceType>;
  fulfillmentPrice: number | null;
  batteryReturnType: OrderRequestUsedBatteryOption;
  usedBatteryReturnSurcharge: number;
  finalAmount: number | null;
  deliveryFee: number;
  storeInstallDiscount: number;
};

export function buildOrderAmountBreakdown(
  items: BatteryCartItem[],
  fulfillmentType: OrderRequestFulfillmentMethod,
  returnBatteryOption: OrderRequestUsedBatteryOption,
): OrderAmountBreakdown {
  const amounts = computeServerOrderAmount(items, fulfillmentType, returnBatteryOption);
  const method =
    fulfillmentType === "undecided" ? items[0]?.fulfillment.method : fulfillmentType;
  const primary = items[0];
  const calc = primary ? calculateCartItemPrice(primary, method) : null;
  const priceType = normalizeFulfillmentPriceType(method);

  return {
    basePrice: calc?.basePrice ?? null,
    fulfillmentType: priceType,
    fulfillmentPrice: amounts.productSubtotal,
    batteryReturnType: returnBatteryOption,
    usedBatteryReturnSurcharge: amounts.batteryReturnFee,
    finalAmount: amounts.finalAmount,
    deliveryFee: amounts.deliveryFee,
    storeInstallDiscount: amounts.storeInstallDiscount,
  };
}
