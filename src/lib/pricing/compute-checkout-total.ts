import { buildPriceSnapshots, sumPriceSnapshots } from "@/lib/pricing/commerce-order-snapshot";
import { computeBatteryReturnFee } from "@/lib/pricing/order-price";
import type { BatteryCartItem } from "@/types/cart";
import type { CommerceOrderPriceSnapshot } from "@/types/commerce-order";
import type {
  OrderRequestFulfillmentMethod,
  OrderRequestUsedBatteryOption,
} from "@/types/order-request";

export type CheckoutTotalBreakdown = {
  priceLines: CommerceOrderPriceSnapshot[];
  productSubtotal: number | null;
  batteryReturnFee: number;
  finalAmount: number | null;
};

export function computeCheckoutTotal(
  items: BatteryCartItem[],
  fulfillmentType: OrderRequestFulfillmentMethod,
  returnBatteryOption: OrderRequestUsedBatteryOption | null | undefined,
): CheckoutTotalBreakdown {
  const method = fulfillmentType === "undecided" ? items[0]?.fulfillment.method : fulfillmentType;
  const priceLines = buildPriceSnapshots(items, method);
  const productSubtotal = sumPriceSnapshots(priceLines);
  const batteryReturnFee = computeBatteryReturnFee(returnBatteryOption, items);
  const finalAmount =
    productSubtotal != null ? productSubtotal + batteryReturnFee : null;

  return { priceLines, productSubtotal, batteryReturnFee, finalAmount };
}
