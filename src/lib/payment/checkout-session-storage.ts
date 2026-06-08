import { computeCheckoutTotal } from "@/lib/pricing/compute-checkout-total";
import type { CheckoutSessionPayload } from "@/types/commerce-payment";

export const CHECKOUT_SESSION_KEY = "battery-manager-checkout-session-v1" as const;
export const CHECKOUT_ORDER_KEY = "battery-manager-checkout-order-v1" as const;

export function saveCheckoutSession(session: CheckoutSessionPayload): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(session));
  } catch {
    /* quota */
  }
}

export function loadCheckoutSession(): CheckoutSessionPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHECKOUT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CheckoutSessionPayload;
    if (parsed?.version !== 1 || !Array.isArray(parsed.items)) return null;
    if (parsed.batteryReturnFee == null || parsed.estimatedTotal == null) {
      const totals = computeCheckoutTotal(
        parsed.items,
        parsed.fulfillment.method,
        parsed.usedBatteryReturn,
      );
      return {
        ...parsed,
        batteryReturnFee: totals.batteryReturnFee,
        estimatedTotal: totals.finalAmount,
        priceLines: parsed.priceLines?.length ? parsed.priceLines : totals.priceLines,
      };
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveCheckoutOrderMeta(meta: {
  orderId: string;
  orderNumber: string;
  paymentRequestId?: string;
  finalAmount: number | null;
}): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHECKOUT_ORDER_KEY, JSON.stringify(meta));
  } catch {
    /* quota */
  }
}

export function loadCheckoutOrderMeta(): {
  orderId: string;
  orderNumber: string;
  paymentRequestId?: string;
  finalAmount: number | null;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHECKOUT_ORDER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
