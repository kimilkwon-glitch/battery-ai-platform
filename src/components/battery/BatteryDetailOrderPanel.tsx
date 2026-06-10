"use client";

import { useMemo } from "react";
import { BatteryGallery } from "@/components/BatteryGallery";
import { BatteryWishlistButton } from "@/components/battery/BatteryWishlistButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { BuyNowButton } from "@/components/cart/BuyNowButton";
import { ProductFulfillmentPricePanel } from "@/components/pricing/ProductFulfillmentPricePanel";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { resolveCartItemBrandKey } from "@/lib/cart/cart-item-brand";
import { batteryImageSetForCode } from "@/lib/battery-image";
import { getNormalizedBatterySummary, formatDimensions } from "@/lib/battery-knowledge";
import { getBattery, getBrand } from "@/lib/platform-data";
import type { BatteryReturnOption } from "@/lib/shop-order-types";

const RETURN_TOGGLE_OPTIONS: { id: BatteryReturnOption; shortLabel: string }[] = [
  { id: "return", shortLabel: "반납" },
  { id: "no-return", shortLabel: "미반납" },
];
import { BatteryTalkInlineCard } from "@/components/batterytalk/BatteryTalkInlineCard";
import { CommercePrePaymentNotice } from "@/components/commerce/CommercePrePaymentNotice";
import {
  createCartItemWithVehicleContext,
  type VehicleCheckoutContext,
} from "@/lib/checkout/vehicle-checkout-context";
import { mapShopReturnOptionToUsedBattery } from "@/lib/shop-order-types";
import type { FulfillmentMethod } from "@/types/cart";
import { bm } from "@/lib/design-tokens";

type Props = {
  code: string;
  brandId?: string;
  returnOption: BatteryReturnOption;
  onReturnOptionChange: (value: BatteryReturnOption) => void;
  fulfillmentMethod: FulfillmentMethod;
  onFulfillmentChange: (value: FulfillmentMethod) => void;
  vehicleContext?: VehicleCheckoutContext | null;
};

export function BatteryDetailOrderPanel({
  code,
  brandId: brandIdProp,
  returnOption,
  onReturnOptionChange,
  fulfillmentMethod,
  onFulfillmentChange,
  vehicleContext = null,
}: Props) {
  const spec = parseBatterySpecDisplay(code);
  const summary = getNormalizedBatterySummary(code);
  const brandKey = resolveCartItemBrandKey({
    brandId: brandIdProp,
    batteryCode: code,
  });
  const brandId = brandIdProp ?? brandKey;
  const imageSet = batteryImageSetForCode(code, brandKey);
  const bat = getBattery(code, brandId);
  const brand = getBrand(bat.brandId);
  const brandName =
    bat.brandId === "rocket" ? "로케트" : bat.brandId === "solite" ? "쏠라이트" : brand.displayName;
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
  const typeChip =
    /^CMF|^GB/i.test(code) ? "일반형" : spec.typeLabel && spec.typeLabel !== "배터리" ? spec.typeLabel : null;
  const specChips = [typeChip, spec.capacity, spec.cca, spec.terminalLabel].filter(
    (chip): chip is string => Boolean(chip),
  );

  const previewItem = useMemo(
    () =>
      createCartItemWithVehicleContext(
        {
          batteryCode: code,
          brandId,
          brandName,
          usedBatteryReturnOption: returnOption,
          fulfillmentMethod,
          fitmentStatus: vehicleContext ? "confirmed" : "needs_customer_confirm",
          source: vehicleContext ? "vehicle_detail" : "battery_detail",
          quantity: 1,
        },
        vehicleContext,
      ),
    [code, brandName, returnOption, fulfillmentMethod, vehicleContext],
  );
  const usedBatteryOption = mapShopReturnOptionToUsedBattery(returnOption);

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
            variant="productDetail"
          />
        </div>

        <div className="battery-product-detail__info battery-product-detail__order-card relative min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="absolute right-4 top-4">
            <BatteryWishlistButton code={code} />
          </div>

          <div className="battery-product-hero-mobile pr-14 lg:hidden">
            <h1 className={`${bm.specTitle} text-2xl`} data-spec-code>
              {code}
            </h1>
            <p className="mt-1 text-sm font-bold text-slate-600">{brandName}</p>
            {specChips.length > 0 ? (
              <div className="battery-product-spec-chips mt-2.5" aria-label="상품 정보">
                {specChips.map((chip) => (
                  <span key={chip} className="battery-product-spec-chip">
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}
            {sizeMm ? (
              <p className="battery-product-spec-size mt-2 text-xs font-medium text-slate-500">
                사이즈 {sizeMm}
              </p>
            ) : null}
          </div>

          <div className="battery-product-hero-desktop hidden pr-14 lg:block">
            <h1 className={`${bm.specTitle} text-2xl sm:text-3xl`} data-spec-code>
              {code}
            </h1>
            <p className="mt-2 text-base font-semibold text-slate-600">{specLine}</p>
            {sizeMm ? (
              <p className="mt-2 text-sm font-medium text-slate-500">사이즈 {sizeMm}</p>
            ) : null}
          </div>

          {vehicleContext ? (
            <p className="mt-3 rounded-lg bg-blue-50/80 px-3 py-2 text-xs font-semibold text-blue-950 ring-1 ring-blue-100">
              {vehicleContext.vehicleTitle}
              {vehicleContext.year ? ` · ${vehicleContext.year}` : ""}
              {vehicleContext.fuel ? ` · ${vehicleContext.fuel}` : ""} 기준 주문
            </p>
          ) : null}

          <div className="mt-3 min-w-0">
            <p className="text-sm font-black text-slate-700">폐배터리 반납</p>
            <div className="battery-order-panel__return mt-1.5" role="group" aria-label="폐배터리 반납 선택">
              {RETURN_TOGGLE_OPTIONS.map((opt) => {
                const selected = returnOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onReturnOptionChange(opt.id)}
                    className={`battery-order-panel__return-btn${
                      selected ? " battery-order-panel__return-btn--active" : ""
                    }`}
                  >
                    {opt.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <ProductFulfillmentPricePanel
            batteryCode={code}
            brandName={brandName}
            returnOption={returnOption}
            fulfillmentMethod={fulfillmentMethod}
            onFulfillmentChange={onFulfillmentChange}
          />

          <div className="mt-4">
            <BatteryTalkInlineCard
              preset={{
                batteryCode: code,
                productCode: code,
                productName: code,
                topic: "spec",
              }}
            />
          </div>

          <div className="mt-4">
            <CommercePrePaymentNotice
              variant="compact"
              items={[previewItem]}
              fulfillmentMethod={fulfillmentMethod}
              usedBatteryReturn={usedBatteryOption}
            />
          </div>

          <div className="battery-order-panel__cta-row mt-5" data-battery-order-panel-cta>
            <BuyNowButton
              batteryCode={code}
              brandId={brandId}
              brandName={brandName}
              returnOption={returnOption}
              fulfillmentMethod={fulfillmentMethod}
              vehicleContext={vehicleContext}
              className="min-h-[3.25rem] w-full py-4 text-base sm:text-lg"
            />
            {vehicleContext ? (
              <AddToCartButton
                mode="vehicle"
                variant="navy"
                className="w-full min-h-[3.25rem]"
                batteryCode={code}
                vehicleSlug={vehicleContext.vehicleSlug}
                vehicleTitle={vehicleContext.vehicleTitle}
                fuelLabel={vehicleContext.fuel}
                usedBatteryReturnOption={returnOption}
              />
            ) : (
              <AddToCartButton
                mode="battery"
                variant="navy"
                returnOption={returnOption}
                fulfillmentMethod={fulfillmentMethod}
                className="w-full min-h-[3.25rem]"
                input={{
                  batteryCode: code,
                  brandId,
                  brandName,
                  usedBatteryReturnOption: returnOption,
                  fulfillmentMethod,
                  fitmentStatus: "needs_customer_confirm",
                  source: "battery_detail",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
