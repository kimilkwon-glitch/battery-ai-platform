"use client";

import { useRouter } from "next/navigation";
import { createCartItemFromBattery } from "@/lib/cart/cart-item-factory";
import { setBuyNowCheckoutItems } from "@/lib/cart/checkout-flow";
import { CHECKOUT_PAGE } from "@/lib/customer-center-routes";
import type { BatteryReturnOption } from "@/lib/shop-order-types";
import { bm } from "@/lib/design-tokens";

type Props = {
  batteryCode: string;
  returnOption?: BatteryReturnOption;
  className?: string;
  fitmentStatus?: "confirmed" | "needs_customer_confirm" | "unknown";
};

export function BuyNowButton({
  batteryCode,
  returnOption = "return",
  className = "",
  fitmentStatus = "needs_customer_confirm",
}: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={`${bm.btnPrimary} cursor-pointer justify-center font-black ${className}`}
      onClick={() => {
        const item = createCartItemFromBattery({
          batteryCode,
          usedBatteryReturnOption: returnOption,
          fitmentStatus,
          source: "battery_detail",
          quantity: 1,
        });
        setBuyNowCheckoutItems([item]);
        router.push(`${CHECKOUT_PAGE}?flow=buy_now`);
      }}
    >
      구매하기
    </button>
  );
}
