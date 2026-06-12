/**
 * checkout session — 할인 전 주문금액 (priceLines + 폐배터리 미반납 fee)
 */
import type { CheckoutSessionPayload } from "@/types/commerce-payment";

export function checkoutSessionPreDiscountTotal(
  session: Pick<CheckoutSessionPayload, "priceLines" | "batteryReturnFee">,
): number | null {
  let sum = 0;
  let has = false;
  for (const line of session.priceLines) {
    if (line.lineTotal == null) continue;
    sum += line.lineTotal;
    has = true;
  }
  if (!has) return null;
  return sum + (session.batteryReturnFee ?? 0);
}
