"use client";

import Link from "next/link";
import { useState } from "react";
import { BatteryGallery } from "@/components/BatteryGallery";
import { BatteryWishlistButton } from "@/components/battery/BatteryWishlistButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { BuyNowButton } from "@/components/cart/BuyNowButton";
import { ProductFulfillmentPricePanel } from "@/components/pricing/ProductFulfillmentPricePanel";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { batteryImageSetForCode } from "@/lib/battery-image";
import { getNormalizedBatterySummary, formatDimensions } from "@/lib/battery-knowledge";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { openProductInquiry } from "@/lib/chat-inquiry-events";
import { getBattery, getBrand } from "@/lib/platform-data";
import {
  BATTERY_RETURN_OPTIONS,
  type BatteryReturnOption,
} from "@/lib/shop-order-types";
import { BatteryDetailPriceBlock } from "@/components/battery/BatteryDetailPriceBlock";
import type { FulfillmentMethod } from "@/types/cart";
import { bm } from "@/lib/design-tokens";

export function BatteryDetailOrderPanel({ code }: { code: string }) {
  const [returnOption, setReturnOption] = useState<BatteryReturnOption>("return");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("delivery");
  const spec = parseBatterySpecDisplay(code);
  const summary = getNormalizedBatterySummary(code);
  const imageSet = batteryImageSetForCode(code);
  const bat = getBattery(code);
  const brand = getBrand(bat.brandId);
  const brandName = bat.brandId === "rocket" ? "로케트" : bat.brandId === "solite" ? "쏠라이트" : brand.displayName;
  const specLine = [
    brand.displayName,
    spec.typeLabel,
    spec.capacity,
    spec.cca,
    spec.terminalLabel,
  ]
    .filter(Boolean)
    .join(" · ");
  const sizeMm = formatDimensions(summary?.dimensionsMm ?? null);

  return (
    <section
      id="battery-order"
      className="battery-product-detail scroll-mt-24"
      data-battery-product={code}
    >
      <div className="battery-product-detail__grid">
        <div className="battery-product-detail__gallery">
          <BatteryGallery
            code={code}
            imageSet={imageSet}
            minHeightClass="battery-product-detail__gallery-main"
          />
        </div>

        <div className="battery-product-detail__info relative min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="absolute right-4 top-4">
            <BatteryWishlistButton code={code} />
          </div>

          <h1 className={`${bm.specTitle} pr-14 text-2xl sm:text-3xl`} data-spec-code>
            {code}
          </h1>
          <p className="mt-2 text-base font-semibold text-slate-600">{specLine}</p>

          {sizeMm ? (
            <p className="mt-2 text-sm font-medium text-slate-500">사이즈 {sizeMm}</p>
          ) : null}

          <BatteryDetailPriceBlock code={code} brandId={bat.brandId} />

          <div className="mt-4 min-w-0">
            <p className="text-sm font-black text-slate-700">폐배터리 반납</p>
            <div className="battery-order-panel__return mt-2" role="group" aria-label="폐배터리 반납 선택">
              {BATTERY_RETURN_OPTIONS.map((opt) => {
                const selected = returnOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setReturnOption(opt.id)}
                    className={`battery-order-panel__return-btn${
                      selected ? " battery-order-panel__return-btn--active" : ""
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <ProductFulfillmentPricePanel
            batteryCode={code}
            brandName={brandName}
            returnOption={returnOption}
            onFulfillmentChange={setFulfillmentMethod}
          />

          <div className="battery-order-panel__cta-row mt-5">
            <BuyNowButton
              batteryCode={code}
              brandName={brandName}
              returnOption={returnOption}
              fulfillmentMethod={fulfillmentMethod}
              className="min-h-[3.25rem] w-full py-4 text-base sm:text-lg"
            />
            <AddToCartButton
              mode="battery"
              variant="navy"
              returnOption={returnOption}
              fulfillmentMethod={fulfillmentMethod}
              className="w-full min-h-[3.25rem]"
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

          <button
            type="button"
            className="battery-product-inquiry-cta mt-3 w-full"
            onClick={() => openProductInquiry({ batteryCode: code })}
          >
            이 규격 제품 문의
          </button>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <Link
              href={HUB_STORE_DETAIL}
              className="text-sm font-bold text-slate-600 hover:text-blue-700"
            >
              매장·출장 상담
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
