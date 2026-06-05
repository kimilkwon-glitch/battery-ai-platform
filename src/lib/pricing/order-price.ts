import { brandIdToBatteryBrandKey } from "@/lib/battery-alias-map";
import {
  getBatteryInternetPriceWon,
  getBatteryOnsitePriceWon,
  getBatteryPrices,
} from "@/lib/battery-prices";
import type { BatteryCartItem, FulfillmentMethod } from "@/types/cart";
import type { OrderRequestFulfillmentMethod } from "@/types/order-request";

/** 택배 발송 추가 택배비 */
export const DELIVERY_FEE = 15_000;

/** 내방교체 차감액 (출장가 기준) */
export const STORE_INSTALL_DISCOUNT = 5_000;

/** 가격 계산에 사용하는 수령/장착 방식 */
export type FulfillmentPriceType =
  | "delivery"
  | "onsite_install"
  | "store_install"
  | "store_pickup_self"
  | "undecided";

export type OrderPriceInput = {
  internetPrice: number | null;
  onsitePrice: number | null;
  fulfillmentType: FulfillmentPriceType;
  quantity?: number;
};

export type OrderPriceResult = {
  internetPrice: number | null;
  onsitePrice: number | null;
  basePrice: number | null;
  deliveryFee: number;
  storeInstallDiscount: number;
  finalPrice: number | null;
  priceBasisLabel: string;
  fulfillmentLabel: string;
  lineTotal: number | null;
};

export const FULFILLMENT_PRICE_LABELS: Record<
  Exclude<FulfillmentPriceType, "undecided">,
  string
> = {
  delivery: "택배 발송",
  onsite_install: "출장교체",
  store_install: "내방교체",
  store_pickup_self: "내방수령 / 셀프교체",
};

export const FULFILLMENT_PRICE_DESCRIPTIONS: Record<
  Exclude<FulfillmentPriceType, "undecided">,
  string
> = {
  delivery: "배터리를 택배로 받습니다. 택배비 15,000원이 추가됩니다.",
  onsite_install: "고객님 위치로 방문해 교체합니다. 출장가 기준으로 계산됩니다.",
  store_install: "매장 방문 후 교체받는 방식입니다. 출장가에서 5,000원이 차감됩니다.",
  store_pickup_self:
    "매장에서 배터리만 수령해 직접 교체하는 방식입니다. 인터넷가 기준이며 택배비는 없습니다.",
};

export function formatPriceWon(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "상담 후 안내";
  return `${amount.toLocaleString("ko-KR")}원`;
}

/** cart/order 레거시 값 → 가격 계산 타입 */
export function normalizeFulfillmentPriceType(
  method: FulfillmentMethod | OrderRequestFulfillmentMethod | undefined,
): FulfillmentPriceType {
  switch (method) {
    case "delivery":
      return "delivery";
    case "visit_install":
      return "onsite_install";
    case "store_install":
      return "store_install";
    case "store_pickup_self":
    case "store_pickup":
      return "store_pickup_self";
    default:
      return "undecided";
  }
}

export function calculateOrderPrice(input: OrderPriceInput): OrderPriceResult {
  const qty = Math.max(1, input.quantity ?? 1);
  const { internetPrice, onsitePrice, fulfillmentType } = input;

  let basePrice: number | null = null;
  let deliveryFee = 0;
  let storeInstallDiscount = 0;
  let priceBasisLabel = "미선택";
  let fulfillmentLabel = "수령 방식 미선택";

  if (fulfillmentType === "undecided") {
    return {
      internetPrice,
      onsitePrice,
      basePrice: null,
      deliveryFee: 0,
      storeInstallDiscount: 0,
      finalPrice: null,
      priceBasisLabel,
      fulfillmentLabel,
      lineTotal: null,
    };
  }

  fulfillmentLabel = FULFILLMENT_PRICE_LABELS[fulfillmentType];

  switch (fulfillmentType) {
    case "delivery":
      basePrice = internetPrice;
      deliveryFee = DELIVERY_FEE;
      priceBasisLabel = "인터넷가";
      break;
    case "onsite_install":
      basePrice = onsitePrice;
      priceBasisLabel = "출장가";
      break;
    case "store_install":
      basePrice = onsitePrice;
      storeInstallDiscount = STORE_INSTALL_DISCOUNT;
      priceBasisLabel = "출장가";
      break;
    case "store_pickup_self":
      basePrice = internetPrice;
      priceBasisLabel = "인터넷가";
      break;
  }

  const unitFinal =
    basePrice == null
      ? null
      : Math.max(0, basePrice + deliveryFee - storeInstallDiscount);

  return {
    internetPrice,
    onsitePrice,
    basePrice,
    deliveryFee,
    storeInstallDiscount,
    finalPrice: unitFinal,
    priceBasisLabel,
    fulfillmentLabel,
    lineTotal: unitFinal == null ? null : unitFinal * qty,
  };
}

export function resolveCartItemPrices(item: BatteryCartItem): {
  internetPrice: number | null;
  onsitePrice: number | null;
} {
  const code = item.batterySpec?.trim();
  if (!code) return { internetPrice: null, onsitePrice: null };

  const brandKey = item.brandName
    ? brandIdToBatteryBrandKey(item.brandName) ?? undefined
    : undefined;

  if (brandKey) {
    const pair = getBatteryPrices(brandKey, code);
    return {
      internetPrice: pair.internetPriceWon,
      onsitePrice: pair.onsitePriceWon,
    };
  }

  const rocketInternet = getBatteryInternetPriceWon("rocket", code);
  const soliteInternet = getBatteryInternetPriceWon("solite", code);
  const rocketOnsite = getBatteryOnsitePriceWon("rocket", code);
  const soliteOnsite = getBatteryOnsitePriceWon("solite", code);

  return {
    internetPrice: rocketInternet ?? soliteInternet,
    onsitePrice: rocketOnsite ?? soliteOnsite,
  };
}

export function calculateCartItemPrice(
  item: BatteryCartItem,
  fulfillmentOverride?: FulfillmentMethod | OrderRequestFulfillmentMethod,
): OrderPriceResult {
  const prices = resolveCartItemPrices(item);
  const fulfillmentType = normalizeFulfillmentPriceType(
    fulfillmentOverride ?? item.fulfillment.method,
  );
  return calculateOrderPrice({
    ...prices,
    fulfillmentType,
    quantity: item.quantity,
  });
}

export function sumCartItemsPrice(
  items: BatteryCartItem[],
  fulfillmentOverride?: FulfillmentMethod | OrderRequestFulfillmentMethod,
): number | null {
  let total = 0;
  let hasPrice = false;
  for (const item of items) {
    const result = calculateCartItemPrice(item, fulfillmentOverride);
    if (result.lineTotal != null) {
      total += result.lineTotal;
      hasPrice = true;
    }
  }
  return hasPrice ? total : null;
}

export function applyPricingToCartItem(
  item: BatteryCartItem,
  fulfillmentMethod: FulfillmentMethod,
): BatteryCartItem {
  const result = calculateCartItemPrice(item, fulfillmentMethod);
  return {
    ...item,
    fulfillment: { ...item.fulfillment, method: fulfillmentMethod },
    finalPrice: result.finalPrice ?? undefined,
    updatedAt: new Date().toISOString(),
  };
}
