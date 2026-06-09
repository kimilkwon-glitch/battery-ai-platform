import type { BatteryCartItem } from "@/types/cart";
import type { FulfillmentMethod } from "@/types/cart";
import {
  calculateOrderPrice,
  formatPriceWon,
  resolveCartItemPrices,
  STORE_INSTALL_DISCOUNT,
  type FulfillmentPriceType,
} from "@/lib/pricing/order-price";

export type FulfillmentMethodDisplayPrice = {
  priceType: Exclude<FulfillmentPriceType, "undecided">;
  amount: number | null;
  /** 카드 가격 아래 보조 문구 (예: 출장가에서 5,000원 할인) */
  priceHint: string | null;
  /** 카드 하단 설명 (1~2줄) */
  descLine: string;
};

const DESC_LINE: Record<Exclude<FulfillmentPriceType, "undecided">, string> = {
  delivery: "택배 수령 · 직접 교체",
  onsite_install: "출장 방문 교체",
  store_install: "매장 방문 교체",
  store_pickup_self: "매장 수령 · 택배비 없음",
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

  let priceHint: string | null = null;
  if (priceType === "store_install") {
    priceHint = `출장가 기준 −${STORE_INSTALL_DISCOUNT.toLocaleString("ko-KR")}원`;
  }

  return {
    priceType,
    amount: result.finalPrice,
    priceHint,
    descLine: DESC_LINE[priceType],
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
