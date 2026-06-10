"use client";

import { useRouter } from "next/navigation";
import { setBuyNowCheckoutItems } from "@/lib/cart/checkout-flow";
import {
  appendVehicleCheckoutQuery,
  createCartItemWithVehicleContext,
  type VehicleCheckoutContext,
} from "@/lib/checkout/vehicle-checkout-context";
import { CHECKOUT_PAGE } from "@/lib/customer-center-routes";
import type { FulfillmentMethod } from "@/types/cart";
import type { BatteryReturnOption } from "@/lib/shop-order-types";
import { bm } from "@/lib/design-tokens";

type Props = {
  batteryCode: string;
  brandId?: string;
  brandName?: string;
  returnOption?: BatteryReturnOption;
  fulfillmentMethod?: FulfillmentMethod;
  className?: string;
  fitmentStatus?: "confirmed" | "needs_customer_confirm" | "unknown";
  vehicleContext?: VehicleCheckoutContext | null;
};

export function BuyNowButton({
  batteryCode,
  brandId,
  brandName,
  returnOption = "return",
  fulfillmentMethod = "delivery",
  className = "",
  fitmentStatus = "needs_customer_confirm",
  vehicleContext = null,
}: Props) {
  const router = useRouter();
  const resolvedFitment = vehicleContext ? "confirmed" : fitmentStatus;

  return (
    <button
      type="button"
      className={`${bm.btnPrimary} cursor-pointer justify-center font-black ${className}`}
      onClick={() => {
        const item = createCartItemWithVehicleContext(
          {
            batteryCode,
            brandId,
            brandName,
            usedBatteryReturnOption: returnOption,
            fulfillmentMethod,
            fitmentStatus: resolvedFitment,
            source: vehicleContext ? "vehicle_detail" : "battery_detail",
            quantity: 1,
          },
          vehicleContext,
        );
        setBuyNowCheckoutItems([item]);
        const checkoutUrl = appendVehicleCheckoutQuery(`${CHECKOUT_PAGE}?flow=buy_now`, vehicleContext);
        router.push(checkoutUrl);
      }}
    >
      바로 주문하기
    </button>
  );
}
