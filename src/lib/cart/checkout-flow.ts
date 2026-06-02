import type { BatteryCartItem } from "@/types/cart";

const BUY_NOW_KEY = "battery-manager-buy-now-v1" as const;

export type CheckoutFlowMode = "buy_now" | "cart";

export function setBuyNowCheckoutItems(items: BatteryCartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(BUY_NOW_KEY, JSON.stringify(items));
  } catch {
    /* private mode */
  }
}

export function getBuyNowCheckoutItems(): BatteryCartItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BUY_NOW_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed as BatteryCartItem[];
  } catch {
    return null;
  }
}

export function clearBuyNowCheckoutItems(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(BUY_NOW_KEY);
  } catch {
    /* ignore */
  }
}

export function resolveCheckoutFlowMode(
  searchParams: URLSearchParams | null | undefined,
): CheckoutFlowMode {
  if (searchParams?.get("flow") === "buy_now") return "buy_now";
  return "cart";
}
