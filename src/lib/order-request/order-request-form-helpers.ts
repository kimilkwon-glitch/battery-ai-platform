import type { BatteryCartItem } from "@/types/cart";
import type { OrderRequestUsedBatteryOption } from "@/types/order-request";

/** 주문 폼 — 폐전지 미선택(unknown 저장 방지) */
export type UsedBatteryFormSelection = OrderRequestUsedBatteryOption | null;

export function initialUsedBatteryFromCart(
  items: BatteryCartItem[],
): UsedBatteryFormSelection {
  const opts = items.map((i) => i.usedBatteryReturn.option);
  if (opts.length === 0) return null;
  if (opts.every((o) => o === "no_return")) return "no_return";
  if (opts.every((o) => o === "return")) return "return";
  return null;
}

export function isUsedBatterySelected(
  value: UsedBatteryFormSelection,
): value is Exclude<OrderRequestUsedBatteryOption, "unknown"> {
  return value === "return" || value === "no_return";
}

/** checkout — 폼 state와 장바구니 item.usedBatteryReturn.option을 하나로 맞춤 */
export function resolveCheckoutUsedBatteryReturn(
  usedBattery: UsedBatteryFormSelection,
  items: BatteryCartItem[],
): Exclude<OrderRequestUsedBatteryOption, "unknown"> | null {
  if (isUsedBatterySelected(usedBattery)) return usedBattery;
  const fromCart = initialUsedBatteryFromCart(items);
  if (fromCart === "return" || fromCart === "no_return") return fromCart;
  return null;
}
