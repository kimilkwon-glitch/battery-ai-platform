"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { BatteryDetailOrderPanel } from "@/components/battery/BatteryDetailOrderPanel";
import { BatteryDetailProductTabs } from "@/components/battery/BatteryDetailProductTabs";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { BuyNowButton } from "@/components/cart/BuyNowButton";
import { BATTERY_DETAIL_BUILD_STAMP } from "@/lib/battery-detail/core-battery-codes";
import { resolveBatteryDetailHubContent } from "@/lib/battery-detail/battery-detail-hub-fallback";
import { openProductInquiry } from "@/lib/chat-inquiry-events";
import { getBattery, getBrand } from "@/lib/platform-data";
import type { BatteryReturnOption } from "@/lib/shop-order-types";
import type { FulfillmentMethod } from "@/types/cart";
import { bm } from "@/lib/design-tokens";

type Props = {
  code: string;
  vehicles?: { slug: string; title: string; brand: string; fuel: string }[];
  relatedCodes?: string[];
};

function BatteryDetailMobileConsultFab({ code }: { code: string }) {
  return (
    <button
      type="button"
      className="battery-detail-consult-fab md:hidden"
      aria-label="상담 문의"
      onClick={() => openProductInquiry({ batteryCode: code })}
    >
      <MessageCircle className="size-5" aria-hidden />
    </button>
  );
}

function BatteryDetailMobileSticky({
  code,
  brandName,
  returnOption,
  fulfillmentMethod,
  visible,
}: {
  code: string;
  brandName?: string;
  returnOption: BatteryReturnOption;
  fulfillmentMethod: FulfillmentMethod;
  visible: boolean;
}) {
  return (
    <>
      <BatteryDetailMobileConsultFab code={code} />
      <div
        className={`${bm.stickyMobileBar} battery-detail-sticky-bar${visible ? "" : " battery-detail-sticky-bar--hidden"}`}
        data-battery-detail-sticky
        data-sticky-visible={visible ? "true" : "false"}
        aria-hidden={!visible}
      >
        <div className="battery-detail-sticky-bar__inner mx-auto flex max-w-[1280px] items-stretch gap-2">
          <BuyNowButton
            batteryCode={code}
            brandName={brandName}
            returnOption={returnOption}
            fulfillmentMethod={fulfillmentMethod}
            className="battery-detail-sticky-bar__btn min-h-[2.75rem] flex-1 py-2.5 text-sm font-black"
          />
          <AddToCartButton
            mode="battery"
            variant="navy"
            className="battery-detail-sticky-bar__btn min-h-[2.75rem] flex-1"
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
        </div>
      </div>
    </>
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
  const [stickyBarVisible, setStickyBarVisible] = useState(true);

  useEffect(() => {
    const sentinel = document.querySelector("[data-battery-order-panel-cta]");
    if (!sentinel) return;

    const mq = window.matchMedia("(max-width: 767px)");
    let observer: IntersectionObserver | null = null;

    const sync = () => {
      observer?.disconnect();
      observer = null;
      if (!mq.matches) {
        setStickyBarVisible(true);
        return;
      }
      observer = new IntersectionObserver(
        ([entry]) => setStickyBarVisible(!entry.isIntersecting),
        { threshold: 0, rootMargin: "0px 0px -4px 0px" },
      );
      observer.observe(sentinel);
    };

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      observer?.disconnect();
    };
  }, [displayCode]);

  return (
    <div
      className="battery-detail-hub mx-auto w-full max-w-6xl pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:pb-6"
      data-battery-detail-hub={displayCode}
      data-battery-detail-build-stamp={BATTERY_DETAIL_BUILD_STAMP}
      data-sticky-visible={stickyBarVisible ? "true" : "false"}
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
        visible={stickyBarVisible}
      />
    </div>
  );
}
