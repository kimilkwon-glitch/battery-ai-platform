"use client";

import { useRouter } from "next/navigation";
import { createCartItemFromBattery } from "@/lib/cart/cart-item-factory";
import { setBuyNowCheckoutItems } from "@/lib/cart/checkout-flow";
import { buildLoginRedirectUrl } from "@/lib/customer-auth-redirect";
import { isCustomerLoggedIn } from "@/lib/customer-auth-session";
import { CHECKOUT_PAGE } from "@/lib/customer-center-routes";
import type { FulfillmentMethod } from "@/types/cart";
import type { BatteryReturnOption } from "@/lib/shop-order-types";
import { bm } from "@/lib/design-tokens";

type Props = {
  batteryCode: string;
  brandName?: string;
  returnOption?: BatteryReturnOption;
  fulfillmentMethod?: FulfillmentMethod;
  className?: string;
  fitmentStatus?: "confirmed" | "needs_customer_confirm" | "unknown";
};

export function BuyNowButton({
  batteryCode,
  brandName,
  returnOption = "return",
  fulfillmentMethod = "delivery",
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
          brandName,
          usedBatteryReturnOption: returnOption,
          fulfillmentMethod,
          fitmentStatus,
          source: "battery_detail",
          quantity: 1,
        });
        setBuyNowCheckoutItems([item]);
        const checkoutUrl = `${CHECKOUT_PAGE}?flow=buy_now`;
        if (!isCustomerLoggedIn()) {
          router.push(buildLoginRedirectUrl(checkoutUrl));
          return;
        }
        router.push(checkoutUrl);
      }}
    >
      바로 주문하기
    </button>
  );
}
