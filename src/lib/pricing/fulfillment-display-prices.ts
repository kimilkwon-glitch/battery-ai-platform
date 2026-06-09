import type { BatteryCartItem } from "@/types/cart";
import type { FulfillmentMethod } from "@/types/cart";
import {
  calculateOrderPrice,
  formatPriceWon,
  resolveCartItemPrices,
  type FulfillmentPriceType,
} from "@/lib/pricing/order-price";

export type FulfillmentMethodDisplayPrice = {
  priceType: Exclude<FulfillmentPriceType, "undecided">;
  amount: number | null;
};

function toPriceType(method: FulfillmentMethod): Exclude<FulfillmentPriceType, "undecided"> {
  switch (method) {
    case "visit_install":
      return "onsite_install";
    case "store_install":
      return "store_install";
    case "store_pickup_self":
      return "store_pickup_self";
    default:
      return "delivery";
  }
}

export function computeFulfillmentMethodDisplayPrice(
  item: BatteryCartItem,
  method: FulfillmentMethod,
): FulfillmentMethodDisplayPrice {
  const prices = resolveCartItemPrices(item);
  const priceType = toPriceType(method);
  const result = calculateOrderPrice({
    internetPrice: prices.internetPrice,
    onsitePrice: prices.onsitePrice,
    fulfillmentType: priceType,
    quantity: item.quantity,
  });

  return {
    priceType,
    amount: result.finalPrice,
  };
}

export function computeAllFulfillmentDisplayPrices(
  item: BatteryCartItem,
  methods: FulfillmentMethod[],
): Map<FulfillmentMethod, FulfillmentMethodDisplayPrice> {
  const map = new Map<FulfillmentMethod, FulfillmentMethodDisplayPrice>();
  for (const method of methods) {
    map.set(method, computeFulfillmentMethodDisplayPrice(item, method));
  }
  return map;
}
