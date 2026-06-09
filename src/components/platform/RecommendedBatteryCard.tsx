import Link from "next/link";

import { BatteryImageStage } from "@/components/media/BatteryImageStage";

import { BuyNowButton } from "@/components/cart/BuyNowButton";

import { CtaHierarchy } from "@/components/common/CtaHierarchy";

import {

  CardInfoMeta,

  CardInfoStack,

  CardInfoTitleRow,

} from "@/components/cards/CardHorizontalInfo";

import { SearchResultSpecChips } from "@/components/platform/SearchResultCoreSummary";

import { bm } from "@/lib/design-tokens";

import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";

import { inferBatteryBrandKeyFromCode } from "@/lib/battery-brand-inference";
import { getBatteryInternetPriceWon, getBatteryOnsitePriceWon } from "@/lib/battery-prices";

import { getSpecCardCopy } from "@/lib/battery-knowledge";

import { batteryProductDetailHref } from "@/lib/battery-product-routes";

import { formatPriceWon } from "@/lib/pricing/order-price";

import { CUSTOMER_DETAIL_PRICE_LABELS } from "@/lib/pricing/customer-price-labels";

import { vehicleContextLine } from "@/lib/search/battery-recommendation-copy";



export type RecommendedBatteryCardProps = {

  code: string;

  fieldLabel: string;

  vehicleLabel?: string | null;

  exceptionNote?: string | null;

  ctas: { label: string; href: string }[];

  secondaryLinks?: { label: string; href: string }[];

  /** 1순위 정답 카드 — 시각적 계층 강조 */

  primary?: boolean;

  /** 차량 상세 등 — 가격·주문 CTA 강조 */

  showPricing?: boolean;

  brandName?: string;

  /** 차량 상세 — 카드 높이·반복감 축소 */

  compact?: boolean;

  /** 차량 상세 전용 3열 가로 카드 레이아웃 */

  vehicleDetail?: boolean;

};



function VehicleDetailPriceBlock({

  internetPrice,

  onsitePrice,

}: {

  internetPrice: number | null;

  onsitePrice: number | null;

}) {

  if (internetPrice == null && onsitePrice == null) return null;



  return (

    <dl className="vehicle-recommended-card__prices" aria-label="가격 안내">

      {internetPrice != null ? (

        <div className="vehicle-recommended-card__price vehicle-recommended-card__price--internet">

          <dt>{CUSTOMER_DETAIL_PRICE_LABELS.productPurchase}</dt>

          <dd>{formatPriceWon(internetPrice)}</dd>

        </div>

      ) : null}

      {onsitePrice != null ? (

        <div className="vehicle-recommended-card__price vehicle-recommended-card__price--onsite">

          <dt>{CUSTOMER_DETAIL_PRICE_LABELS.mobileInstall}</dt>

          <dd>{formatPriceWon(onsitePrice)}</dd>

        </div>

      ) : null}

    </dl>

  );

}



export function RecommendedBatteryCard({

  code,

  fieldLabel,

  vehicleLabel,

  exceptionNote = null,

  ctas,

  secondaryLinks = [],

  primary = false,

  showPricing = false,

  brandName = "로케트",

  compact = false,

  vehicleDetail = false,

}: RecommendedBatteryCardProps) {

  const display = parseBatterySpecDisplay(code);

  const specCopy = getSpecCardCopy(code);

  const context =

    vehicleLabel && fieldLabel ? vehicleContextLine(vehicleLabel, fieldLabel) : null;

  const brandKey =
    brandName === "쏠라이트"
      ? "solite"
      : brandName === "로케트"
        ? "rocket"
        : inferBatteryBrandKeyFromCode(code);
  const brandId = brandKey === "solite" ? "solite" : "rocket";

  const internetPrice = showPricing ? getBatteryInternetPriceWon(brandKey, code) : null;

  const onsitePrice = showPricing ? getBatteryOnsitePriceWon(brandKey, code) : null;

  const detailHref =

    batteryProductDetailHref(brandId, code) ?? ctas.find((c) => /상세|규격/.test(c.label))?.href;



  if (vehicleDetail && showPricing) {

    return (

      <article className="vehicle-recommended-card" data-vehicle-recommended-card>

        <div className="vehicle-recommended-card__media" data-battery-image-role="search-recommend">

          <BatteryImageStage

            code={display.code}

            variant="vehicleResult"

            imageSet={display.imageSet ?? undefined}

            className="h-full w-full"

            layout="row"

            flushTop

          />

        </div>

        <div className="vehicle-recommended-card__info">

          <p className="vehicle-recommended-card__brand">{brandName}</p>

          <p className="vehicle-recommended-card__spec">{display.code}</p>

          {context ? <p className="vehicle-recommended-card__context">{context}</p> : null}

          <div className="vehicle-recommended-card__chips">

            <SearchResultSpecChips

              typeLabel={display.typeLabel}

              seriesLabel={display.seriesLabel}

              terminalLabel={display.terminalLabel}

            />

          </div>

        </div>

        <div className="vehicle-recommended-card__commerce">

          <VehicleDetailPriceBlock internetPrice={internetPrice} onsitePrice={onsitePrice} />

          <div className="vehicle-recommended-card__actions">

            {detailHref ? (

              <Link

                href={detailHref}

                className={`vehicle-recommended-card__btn-detail ${bm.btnSecondary} justify-center text-xs font-black`}

              >

                상세보기

              </Link>

            ) : null}

            <BuyNowButton

              batteryCode={code}

              brandName={brandName}

              className="vehicle-recommended-card__btn-order min-h-[2.375rem] w-full text-sm"

            />

          </div>

        </div>

      </article>

    );

  }



  return (

    <article

      className={primary && !compact ? bm.fitmentCardPrimary : bm.fitmentCard}

      data-search-battery-card={primary ? "primary" : "secondary"}

    >

      {primary && !compact ? (

        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--bm-border)] bg-gradient-to-r from-[var(--bm-hero-from)] to-[var(--bm-accent-soft)]/20 px-4 py-2.5">

          <span className={`${bm.badge} ${bm.statusRecommended}`}>추천</span>

          <span className="text-[11px] font-semibold text-[var(--bm-muted)]">추천 · 1순위 후보</span>

        </div>

      ) : null}

      <div className="flex flex-col md:grid md:grid-cols-[minmax(0,38%)_minmax(0,62%)]">

        <div
          data-battery-image-role="search-recommend"
          className={`${bm.cardHorizontalMedia} order-2 md:order-1 ${compact ? "!min-h-[120px] md:!min-h-[140px]" : "!min-h-[132px] md:!min-h-[180px]"}`}
        >

          <BatteryImageStage

            code={display.code}

            variant="vehicleResult"

            imageSet={display.imageSet ?? undefined}

            className="h-full w-full"

            layout="row"

            flushTop

          />

        </div>

        <div className={`${bm.cardHorizontalBody} order-1 md:order-2`}>

          <CardInfoStack>

            <CardInfoTitleRow

              iconKey="batterySpec"

              title={

                <>

                  <span className="spec-code text-lg sm:text-xl">{display.code}</span>

                  <span className="ml-1 text-xs font-bold text-[var(--bm-muted)] sm:text-sm">배터리</span>

                </>

              }

            />

            {showPricing ? (

              <p className="text-[0.6875rem] font-extrabold uppercase tracking-wide text-slate-500">

                {brandName}

              </p>

            ) : null}

            {showPricing && (internetPrice != null || onsitePrice != null) ? (

              <dl className="battery-card-prices" aria-label="가격 안내">

                {internetPrice != null ? (

                  <div className="battery-card-price battery-card-price--internet">

                    <dt className="battery-card-price__label">제품 구매가</dt>

                    <dd className="battery-card-price__amount">{formatPriceWon(internetPrice)}</dd>

                  </div>

                ) : null}

                {onsitePrice != null ? (

                  <div className="battery-card-price battery-card-price--onsite">

                    <dt className="battery-card-price__label">출장 교체가</dt>

                    <dd className="battery-card-price__amount">{formatPriceWon(onsitePrice)}</dd>

                  </div>

                ) : null}

              </dl>

            ) : null}

            {showPricing ? (

              <div className="battery-card-prices-actions flex flex-col gap-2 sm:hidden">

                <BuyNowButton

                  batteryCode={code}

                  brandName={brandName}

                  className="min-h-[2.75rem] w-full text-sm shadow-md"

                />

                {detailHref ? (

                  <Link href={detailHref} className={`${bm.btnSecondary} justify-center text-sm font-black`}>

                    상세보기

                  </Link>

                ) : null}

              </div>

            ) : null}

            {context && !compact ? (

              <p className="text-[11px] font-semibold text-slate-600">{context}</p>

            ) : null}

            {!compact || !showPricing ? (

              <SearchResultSpecChips

                typeLabel={display.typeLabel}

                seriesLabel={display.seriesLabel}

                terminalLabel={display.terminalLabel}

              />

            ) : null}

            {specCopy && !compact ? (

              <CardInfoMeta className="line-clamp-2 text-[11px] font-medium leading-relaxed text-slate-600">

                {specCopy.primary}

              </CardInfoMeta>

            ) : null}

            {exceptionNote ? <CardInfoMeta className="sm:text-[11px]">{exceptionNote}</CardInfoMeta> : null}

          </CardInfoStack>

        </div>

      </div>

      <div className="border-t border-[var(--bm-border)] bg-[var(--bm-surface-muted)] px-2.5 py-2">

        {showPricing ? (

          <div className="hidden items-center gap-2 sm:flex">

            {detailHref ? (

              <Link href={detailHref} className={`${bm.btnSecondary} flex-1 justify-center text-xs font-black`}>

                상세보기

              </Link>

            ) : null}

            <BuyNowButton

              batteryCode={code}

              brandName={brandName}

              className="min-h-[2.75rem] flex-[2] text-sm"

            />

          </div>

        ) : (

          <CtaHierarchy compact ctas={ctas} links={secondaryLinks} />

        )}

      </div>

    </article>

  );

}

