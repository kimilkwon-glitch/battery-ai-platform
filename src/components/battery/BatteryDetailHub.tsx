"use client";

import { BatteryDetailOrderPanel } from "@/components/battery/BatteryDetailOrderPanel";
import { BatteryDetailProductTabs } from "@/components/battery/BatteryDetailProductTabs";
import { BatteryWishlistButton } from "@/components/battery/BatteryWishlistButton";
import { BuyNowButton } from "@/components/cart/BuyNowButton";
import { BATTERY_DETAIL_BUILD_STAMP } from "@/lib/battery-detail/core-battery-codes";
import { resolveBatteryDetailHubContent } from "@/lib/battery-detail/battery-detail-hub-fallback";
import { bm } from "@/lib/design-tokens";

type Props = {
  code: string;
  vehicles?: { slug: string; title: string; brand: string; fuel: string }[];
  relatedCodes?: string[];
};

function BatteryDetailMobileSticky({ code }: { code: string }) {
  return (
    <div className={bm.stickyMobileBar} data-battery-detail-sticky>
      <div className="mx-auto flex max-w-[1280px] items-center gap-2 px-1">
        <BuyNowButton batteryCode={code} className="flex-1 py-3 text-sm" />
        <BatteryWishlistButton code={code} size="sm" />
      </div>
    </div>
  );
}

export function BatteryDetailHub({ code, relatedCodes = [] }: Props) {
  const hub = resolveBatteryDetailHubContent(code, relatedCodes);
  const displayCode = hub.code;

  return (
    <div
      className="space-y-8 pb-20 md:pb-6"
      data-battery-detail-hub={displayCode}
      data-battery-detail-build-stamp={BATTERY_DETAIL_BUILD_STAMP}
    >
      <BatteryDetailOrderPanel code={displayCode} />

      <BatteryDetailProductTabs code={displayCode} />

      <BatteryDetailMobileSticky code={displayCode} />
    </div>
  );
}
