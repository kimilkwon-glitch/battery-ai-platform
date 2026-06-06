"use client";

import { useState } from "react";
import { BatteryDetailOrderPanel } from "@/components/battery/BatteryDetailOrderPanel";
import { BatteryDetailProductTabs } from "@/components/battery/BatteryDetailProductTabs";
import { BatteryWishlistButton } from "@/components/battery/BatteryWishlistButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { BuyNowButton } from "@/components/cart/BuyNowButton";
import { BATTERY_DETAIL_BUILD_STAMP } from "@/lib/battery-detail/core-battery-codes";
import { resolveBatteryDetailHubContent } from "@/lib/battery-detail/battery-detail-hub-fallback";
import { getBattery, getBrand } from "@/lib/platform-data";
import type { BatteryReturnOption } from "@/lib/shop-order-types";
import type { FulfillmentMethod } from "@/types/cart";
import { bm } from "@/lib/design-tokens";

type Props = {
  code: string;
  vehicles?: { slug: string; title: string; brand: string; fuel: string }[];
  relatedCodes?: string[];
};

function BatteryDetailMobileSticky({
  code,
  brandName,
  returnOption,
  fulfillmentMethod,
}: {
  code: string;
  brandName?: string;
  returnOption: BatteryReturnOption;
  fulfillmentMethod: FulfillmentMethod;
}) {
  return (
    <div className={bm.stickyMobileBar} data-battery-detail-sticky>
      <div className="mx-auto flex max-w-[1280px] items-center gap-2 px-1">
        <BuyNowButton
          batteryCode={code}
          brandName={brandName}
          returnOption={returnOption}
          fulfillmentMethod={fulfillmentMethod}
          className="min-h-[2.75rem] flex-1 py-3 text-sm font-black"
        />
        <AddToCartButton
          mode="battery"
          variant="navy"
          className="min-h-[2.75rem] flex-1"
          returnOption={returnOption}
          fulfillmentMethod={fulfillmentMethod}
          input={{
            batteryCode: code,
            brandName,
            usedBatteryReturnOption: returnOption,
            fulfillmentMethod,
            fitmentStatus: "needs_customer_confirm",
            source: "battery_detail",
          }}
        />
        <BatteryWishlistButton code={code} size="sm" />
      </div>
    </div>
  );
}

export function BatteryDetailHub({ code, relatedCodes = [] }: Props) {
  const hub = resolveBatteryDetailHubContent(code, relatedCodes);
  const displayCode = hub.code;
  const bat = getBattery(displayCode);
  const brand = getBrand(bat.brandId);
  const brandName =
    bat.brandId === "rocket" ? "로케트" : bat.brandId === "solite" ? "쏠라이트" : brand.displayName;

  const [returnOption, setReturnOption] = useState<BatteryReturnOption>("return");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("delivery");

  return (
    <div
      className="battery-detail-hub mx-auto w-full max-w-6xl pb-20 md:pb-6"
      data-battery-detail-hub={displayCode}
      data-battery-detail-build-stamp={BATTERY_DETAIL_BUILD_STAMP}
    >
      <BatteryDetailOrderPanel
        code={displayCode}
        returnOption={returnOption}
        onReturnOptionChange={setReturnOption}
        fulfillmentMethod={fulfillmentMethod}
        onFulfillmentChange={setFulfillmentMethod}
      />

      <BatteryDetailProductTabs code={displayCode} />

      <BatteryDetailMobileSticky
        code={displayCode}
        brandName={brandName}
        returnOption={returnOption}
        fulfillmentMethod={fulfillmentMethod}
      />
    </div>
  );
}
