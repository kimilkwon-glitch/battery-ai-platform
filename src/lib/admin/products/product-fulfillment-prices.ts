import { calculateOrderPrice } from "@/lib/pricing/order-price";
import type { AdminProductFulfillmentPrices } from "@/types/admin-product";

/** 인터넷가·출장가 → 수령/장착 방식별 금액 (공통 calculateOrderPrice 사용) */
export function computeFulfillmentPrices(
  internetPrice: number | null,
  onsitePrice: number | null,
): AdminProductFulfillmentPrices {
  const delivery = calculateOrderPrice({
    internetPrice,
    onsitePrice,
    fulfillmentType: "delivery",
  }).finalPrice;

  const onsiteInstall = calculateOrderPrice({
    internetPrice,
    onsitePrice,
    fulfillmentType: "onsite_install",
  }).finalPrice;

  const storeInstall = calculateOrderPrice({
    internetPrice,
    onsitePrice,
    fulfillmentType: "store_install",
  }).finalPrice;

  const storePickupSelf = calculateOrderPrice({
    internetPrice,
    onsitePrice,
    fulfillmentType: "store_pickup_self",
  }).finalPrice;

  return {
    delivery,
    onsiteInstall,
    storeInstall,
    storePickupSelf,
  };
}
