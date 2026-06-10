import { itemNeedsReview } from "@/lib/cart/cart-storage";
import { calculateCartItemPrice } from "@/lib/pricing/order-price";
import type { BatteryCartItem } from "@/types/cart";

export function checkoutItemNeedsReview(item: BatteryCartItem): boolean {
  const specMissing =
    !item.batterySpec?.trim() || item.batterySpec === "규격 확인 필요";
  return itemNeedsReview(item) || specMissing;
}

export function cartHasCheckoutReviewItems(items: BatteryCartItem[]): boolean {
  return items.some(checkoutItemNeedsReview);
}

export function formatCheckoutTerminal(
  dir?: BatteryCartItem["terminalDirection"],
): string {
  if (dir === "L") return "L (좌)";
  if (dir === "R") return "R (우)";
  if (dir === "unknown") return "단자 방향 확인 필요";
  return "단자 방향 확인 필요";
}

export function formatCheckoutPrice(
  item: BatteryCartItem,
  fulfillmentOverride?: BatteryCartItem["fulfillment"]["method"],
): string {
  const result = calculateCartItemPrice(item, fulfillmentOverride ?? item.fulfillment.method);
  if (result.lineTotal != null) {
    return `${result.lineTotal.toLocaleString()}원`;
  }
  const unit = item.finalPrice ?? item.basePrice;
  if (unit == null || Number.isNaN(unit)) return "수령 방식 선택 후 표시";
  return `${(unit * item.quantity).toLocaleString()}원`;
}

export function formatCheckoutVehicle(item: BatteryCartItem): string {
  const memo = item.customerMemo?.trim();
  const name = item.vehicle?.displayName?.trim() || memo;
  if (!name) return "차량 기준 확인 필요";
  const parts = [
    name,
    item.vehicle?.year,
    item.vehicle?.fuelType ?? item.vehicle?.generationName,
  ].filter(Boolean);
  return parts.join(" · ");
}
