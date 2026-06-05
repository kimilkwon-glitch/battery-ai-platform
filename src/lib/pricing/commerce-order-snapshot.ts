import { calculateCartItemPrice } from "@/lib/pricing/order-price";
import type { BatteryCartItem } from "@/types/cart";
import type { CommerceOrderPriceSnapshot } from "@/types/commerce-order";

export function buildPriceSnapshots(
  items: BatteryCartItem[],
  fulfillmentOverride?: BatteryCartItem["fulfillment"]["method"],
): CommerceOrderPriceSnapshot[] {
  return items.map((item) => {
    const result = calculateCartItemPrice(item, fulfillmentOverride ?? item.fulfillment.method);
    return {
      internetPrice: result.internetPrice,
      onsitePrice: result.onsitePrice,
      fulfillmentMethod: fulfillmentOverride ?? item.fulfillment.method,
      priceBasisLabel: result.priceBasisLabel,
      fulfillmentLabel: result.fulfillmentLabel,
      productAmount: result.basePrice,
      deliveryFee: result.deliveryFee,
      storeInstallDiscount: result.storeInstallDiscount,
      lineTotal: result.lineTotal,
      quantity: item.quantity,
    };
  });
}

export function sumPriceSnapshots(lines: CommerceOrderPriceSnapshot[]): number | null {
  let total = 0;
  let has = false;
  for (const line of lines) {
    if (line.lineTotal != null) {
      total += line.lineTotal;
      has = true;
    }
  }
  return has ? total : null;
}
