import { buildPriceSnapshots, sumPriceSnapshots } from "@/lib/pricing/commerce-order-snapshot";
import { calculateCartItemPrice, resolveCartItemPrices } from "@/lib/pricing/order-price";
import type { BatteryCartItem } from "@/types/cart";
import type { CommerceOrderPriceSnapshot } from "@/types/commerce-order";
import type { OrderRequestFulfillmentMethod } from "@/types/order-request";

export type ServerAmountResult = {
  priceLines: CommerceOrderPriceSnapshot[];
  finalAmount: number | null;
  internetPrice: number | null;
  onsitePrice: number | null;
  deliveryFee: number;
  storeInstallDiscount: number;
};

export function computeServerOrderAmount(
  items: BatteryCartItem[],
  fulfillmentType: OrderRequestFulfillmentMethod,
): ServerAmountResult {
  const method = fulfillmentType === "undecided" ? items[0]?.fulfillment.method : fulfillmentType;
  const priceLines = buildPriceSnapshots(items, method);
  const finalAmount = sumPriceSnapshots(priceLines);

  const primary = items[0];
  const prices = primary ? resolveCartItemPrices(primary) : { internetPrice: null, onsitePrice: null };
  const calc = primary ? calculateCartItemPrice(primary, method) : null;

  return {
    priceLines,
    finalAmount,
    internetPrice: prices.internetPrice,
    onsitePrice: prices.onsitePrice,
    deliveryFee: calc?.deliveryFee ?? 0,
    storeInstallDiscount: calc?.storeInstallDiscount ?? 0,
  };
}

export function amountsMatch(
  serverAmount: number | null,
  clientAmount: number | null | undefined,
): boolean {
  if (serverAmount == null) return false;
  if (clientAmount == null || clientAmount === undefined) return true;
  return Math.abs(serverAmount - clientAmount) < 1;
}
