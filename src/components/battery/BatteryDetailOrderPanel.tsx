"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BatteryGallery } from "@/components/BatteryGallery";
import { BatteryWishlistButton } from "@/components/battery/BatteryWishlistButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { BuyNowButton } from "@/components/cart/BuyNowButton";
import { ProductFulfillmentPricePanel } from "@/components/pricing/ProductFulfillmentPricePanel";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { inferBrandIdFromCode } from "@/lib/battery-brand-inference";
import { batteryImageSetForCode } from "@/lib/battery-image";
import { getNormalizedBatterySummary, formatDimensions } from "@/lib/battery-knowledge";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { CONTACT } from "@/lib/contact-info";
import { getBattery, getBrand } from "@/lib/platform-data";
import type { BatteryReturnOption } from "@/lib/shop-order-types";

const RETURN_TOGGLE_OPTIONS: {
  id: BatteryReturnOption;
  shortLabel: string;
  description: string;
}[] = [
  { id: "return", shortLabel: "반납", description: "폐배터리 반납 조건 가격입니다." },
  { id: "no-return", shortLabel: "미반납", description: "폐배터리 미반납 조건 가격입니다." },
];
import { BatteryTalkInlineCard } from "@/components/batterytalk/BatteryTalkInlineCard";
import { CommercePrePaymentNotice } from "@/components/commerce/CommercePrePaymentNotice";
import { BatteryDetailPriceBlock } from "@/components/battery/BatteryDetailPriceBlock";
import { createCartItemFromBattery } from "@/lib/cart/cart-item-factory";
import { mapShopReturnOptionToUsedBattery } from "@/lib/shop-order-types";
import type { FulfillmentMethod } from "@/types/cart";
import { bm } from "@/lib/design-tokens";

type Props = {
  code: string;
  returnOption: BatteryReturnOption;
  onReturnOptionChange: (value: BatteryReturnOption) => void;
  fulfillmentMethod: FulfillmentMethod;
  onFulfillmentChange: (value: FulfillmentMethod) => void;
};

export function BatteryDetailOrderPanel({
  code,
  returnOption,
  onReturnOptionChange,
  fulfillmentMethod,
  onFulfillmentChange,
}: Props) {
  const spec = parseBatterySpecDisplay(code);
  const summary = getNormalizedBatterySummary(code);
  const brandId = inferBrandIdFromCode(code);
  const imageSet = batteryImageSetForCode(code);
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
      createCartItemFromBattery({
        batteryCode: code,
        brandName,
        usedBatteryReturnOption: returnOption,
        fulfillmentMethod: fulfillmentMethod,
        source: "battery_detail",
        quantity: 1,
      }),
    [code, brandName, returnOption, fulfillmentMethod],
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

          <BatteryDetailPriceBlock code={code} brandId={bat.brandId} />

          <div className="mt-4 min-w-0">
            <p className="text-sm font-black text-slate-700">폐배터리 반납</p>
            <div className="battery-order-panel__return mt-2" role="group" aria-label="폐배터리 반납 선택">
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
            <p className="battery-order-panel__return-desc mt-2 text-xs font-medium leading-relaxed text-slate-600">
              {RETURN_TOGGLE_OPTIONS.find((opt) => opt.id === returnOption)?.description}
            </p>
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

          <div className="battery-product-detail__consult mt-4 border-t border-slate-100 pt-4">
            <p className="text-sm font-black text-slate-900">규격이 맞는지 확인이 필요하신가요?</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
              이 상품 문의는 하단 상품문의 탭에서 남겨 주세요. 급한 상담은 고객센터로 연락해 주세요.
            </p>
            <a
              href={CONTACT.customerCenter.tel}
              className="mt-2 inline-block text-base font-black text-[#0F1B33] hover:text-blue-700"
            >
              {CONTACT.customerCenter.phone}
            </a>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={`${bm.btnSecondary} text-xs font-black`}
                onClick={() => {
                  document.getElementById("battery-tab-qna")?.click();
                  document.getElementById("battery-qna")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                상품 문의 보기
              </button>
              <Link href={HUB_STORE_DETAIL} className={`${bm.btnTertiary} text-xs font-black`}>
                매장 안내
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
