import { brandIdToBatteryBrandKey } from "@/lib/battery-alias-map";
import {
  getBatteryInternetPriceWon,
  getBatteryOnsitePriceWon,
  getBatteryPrices,
} from "@/lib/battery-prices";
import type { BatteryCartItem, FulfillmentMethod, UsedBatteryReturnOption } from "@/types/cart";
import type {
  OrderRequestFulfillmentMethod,
  OrderRequestUsedBatteryOption,
} from "@/types/order-request";
import {
  CUSTOMER_FULFILLMENT_DESCRIPTIONS,
  CUSTOMER_FULFILLMENT_LABELS,
  CUSTOMER_PRICE_LABELS,
  type CustomerFulfillmentDisplayKey,
} from "@/lib/pricing/customer-price-labels";

/** 택배 발송 추가 택배비 */
export const DELIVERY_FEE = 15_000;

/** 내방교체 차감액 (출장가 기준) */
export const STORE_INSTALL_DISCOUNT = 5_000;

/** 폐배터리 미반납 추가금 (1개 기준) */
export const BATTERY_NO_RETURN_FEE = 25_000;

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
> = CUSTOMER_FULFILLMENT_LABELS;

export const FULFILLMENT_PRICE_DESCRIPTIONS: Record<
  Exclude<FulfillmentPriceType, "undecided">,
  string
> = CUSTOMER_FULFILLMENT_DESCRIPTIONS;

export { CUSTOMER_PRICE_LABELS, CUSTOMER_FULFILLMENT_LABELS };

export function formatPriceWon(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "가격 문의";
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
      priceBasisLabel = CUSTOMER_PRICE_LABELS.productPurchase;
      break;
    case "onsite_install":
      basePrice = onsitePrice;
      priceBasisLabel = CUSTOMER_PRICE_LABELS.mobileInstall;
      break;
    case "store_install":
      basePrice = onsitePrice;
      storeInstallDiscount = STORE_INSTALL_DISCOUNT;
      priceBasisLabel = CUSTOMER_PRICE_LABELS.storeInstall;
      break;
    case "store_pickup_self":
      basePrice = internetPrice;
      priceBasisLabel = CUSTOMER_PRICE_LABELS.productPurchase;
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

export type LineAmountWithReturnFee = {
  fulfillmentSubtotal: number | null;
  usedBatteryReturnSurcharge: number;
  finalAmount: number | null;
  returnOption: "return" | "no_return" | "undecided" | "unknown" | null;
};

/** 수령/장착 소계 + 폐배터리 미반납 surcharge → 최종 라인 금액 */
export function computeLineAmountWithReturnFee(
  item: BatteryCartItem,
  fulfillmentMethod?: FulfillmentMethod | OrderRequestFulfillmentMethod,
  returnOptionOverride?: OrderRequestUsedBatteryOption | null,
): LineAmountWithReturnFee {
  const result = calculateCartItemPrice(item, fulfillmentMethod);
  const returnOption =
    returnOptionOverride ??
    (item.usedBatteryReturn.option === "return" || item.usedBatteryReturn.option === "no_return"
      ? item.usedBatteryReturn.option
      : null);
  const surcharge = computeBatteryReturnFee(returnOption, [item]);
  const fulfillmentSubtotal = result.lineTotal;
  const finalAmount =
    fulfillmentSubtotal != null ? fulfillmentSubtotal + surcharge : null;
  return {
    fulfillmentSubtotal,
    usedBatteryReturnSurcharge: surcharge,
    finalAmount,
    returnOption,
  };
}

/** 주문 단위 폐배터리 미반납 추가금 */
export function computeBatteryReturnFee(
  option:
    | OrderRequestUsedBatteryOption
    | UsedBatteryReturnOption
    | null
    | undefined,
  items: Pick<BatteryCartItem, "quantity">[],
): number {
  if (option !== "no_return") return 0;
  const totalQty = items.reduce((sum, item) => sum + Math.max(1, item.quantity ?? 1), 0);
  return BATTERY_NO_RETURN_FEE * totalQty;
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
