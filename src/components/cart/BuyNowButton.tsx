"use client";

import { useRouter } from "next/navigation";
import { createCartItemFromBattery } from "@/lib/cart/cart-item-factory";
import { CHECKOUT_PAGE } from "@/lib/customer-center-routes";
import type { BatteryReturnOption } from "@/lib/shop-order-types";
import { bm } from "@/lib/design-tokens";
import { useBatteryCart } from "@/components/cart/BatteryCartProvider";

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
  const { addItem } = useBatteryCart();
  const router = useRouter();

  return (
    <button
      type="button"
      className={`${bm.btnPrimary} justify-center text-sm font-black ${className}`}
      onClick={() => {
        addItem(
          createCartItemFromBattery({
            batteryCode,
            usedBatteryReturnOption: returnOption,
            fitmentStatus,
            source: "battery_detail",
          }),
        );
        router.push(CHECKOUT_PAGE);
      }}
    >
      구매하기
    </button>
  );
}
