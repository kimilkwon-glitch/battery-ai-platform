import type { AppliedPromotion } from "@/types/promotion";
import type { BatteryCartItem } from "@/types/cart";
import type {
  OrderRequestFulfillmentMethod,
  OrderRequestUsedBatteryOption,
} from "@/types/order-request";

export type ValidatePromotionRequest = {
  cartItems: BatteryCartItem[];
  fulfillmentType: OrderRequestFulfillmentMethod;
  returnBatteryOption: OrderRequestUsedBatteryOption;
  couponCode?: string | null;
};

export type ValidatePromotionResponse =
  | {
      ok: true;
      appliedPromotions: AppliedPromotion[];
      promotionDiscountTotal: number;
      finalAmount: number;
      baseSubtotal: number;
      eligibleAutomatic: Array<{ id: string; title: string; reason: string }>;
      couponError?: string;
    }
  | { ok: false; message: string };

export async function apiValidatePromotions(
  body: ValidatePromotionRequest,
): Promise<ValidatePromotionResponse> {
  const res = await fetch("/api/promotions/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as ValidatePromotionResponse & { message?: string };
  if (!res.ok || !data.ok) {
    return { ok: false, message: data.message ?? "혜택을 적용할 수 없습니다." };
  }
  return data;
}

export async function apiFetchPublicPromotions(): Promise<{
  ok: boolean;
  items: import("@/types/promotion").PublicPromotionCard[];
  total?: number;
  hasMore?: boolean;
}> {
  const res = await fetch("/api/promotions/public", { credentials: "include" });
  if (!res.ok) return { ok: false, items: [] };
  return res.json();
}
