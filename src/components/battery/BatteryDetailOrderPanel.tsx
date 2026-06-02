"use client";

import Link from "next/link";
import { useState } from "react";
import { BatteryGallery } from "@/components/BatteryGallery";
import { BatteryWishlistButton } from "@/components/battery/BatteryWishlistButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { BuyNowButton } from "@/components/cart/BuyNowButton";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { batteryImageSetForCode } from "@/lib/battery-image";
import { getNormalizedBatterySummary, formatDimensions } from "@/lib/battery-knowledge";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { getBattery, getBrand } from "@/lib/platform-data";
import {
  BATTERY_RETURN_OPTIONS,
  type BatteryReturnOption,
} from "@/lib/shop-order-types";
import { bm } from "@/lib/design-tokens";

export function BatteryDetailOrderPanel({ code }: { code: string }) {
  const [returnOption, setReturnOption] = useState<BatteryReturnOption>("return");
  const spec = parseBatterySpecDisplay(code);
  const summary = getNormalizedBatterySummary(code);
  const imageSet = batteryImageSetForCode(code);
  const bat = getBattery(code);
  const brand = getBrand(bat.brandId);
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

        <div className="battery-product-detail__info relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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

          <p className="mt-5 text-xl font-black text-slate-900">
            상담 후 안내
            <span className="ml-2 text-sm font-semibold text-slate-400">가격·배송</span>
          </p>

          <div className="mt-4">
            <p className="text-sm font-black text-slate-700">폐배터리 반납</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {BATTERY_RETURN_OPTIONS.map((opt) => {
                const selected = returnOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setReturnOption(opt.id)}
                    className={`rounded-lg px-4 py-3 text-base font-black transition ring-1 ${
                      selected
                        ? "bg-blue-600 text-white ring-blue-600"
                        : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            <BuyNowButton
              batteryCode={code}
              returnOption={returnOption}
              className="w-full py-3.5 text-base"
            />
            <AddToCartButton
              mode="battery"
              variant="secondary"
              className="w-full"
              input={{
                batteryCode: code,
                usedBatteryReturnOption: returnOption,
                fitmentStatus: "needs_customer_confirm",
                source: "battery_detail",
              }}
            />
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <Link href={HUB_STORE_DETAIL} className="text-sm font-bold text-slate-600 hover:text-blue-700">
              매장·출장 상담
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
