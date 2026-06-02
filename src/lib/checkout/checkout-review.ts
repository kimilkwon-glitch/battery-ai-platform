import { itemNeedsReview } from "@/lib/cart/cart-storage";
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

export function formatCheckoutPrice(item: BatteryCartItem): string {
  const unit = item.finalPrice ?? item.basePrice;
  if (unit == null || Number.isNaN(unit)) return "상담 후 안내";
  return `${(unit * item.quantity).toLocaleString()}원`;
}

export function formatCheckoutVehicle(item: BatteryCartItem): string {
  const memo = item.customerMemo?.trim();
  if (!item.vehicle?.displayName) {
    return memo || "차량 정보 미입력";
  }
  const parts = [
    item.vehicle.displayName,
    item.vehicle.generationName,
    item.vehicle.year,
  ].filter(Boolean);
  return parts.join(" · ");
}
