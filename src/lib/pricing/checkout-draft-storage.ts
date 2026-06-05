import type { CommerceOrderDraft } from "@/types/commerce-order";

export const CHECKOUT_DRAFT_KEY = "battery-manager-checkout-draft-v1" as const;

export function saveCheckoutDraft(draft: CommerceOrderDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* quota */
  }
}

export function loadCheckoutDraft(): CommerceOrderDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CommerceOrderDraft;
  } catch {
    return null;
  }
}
