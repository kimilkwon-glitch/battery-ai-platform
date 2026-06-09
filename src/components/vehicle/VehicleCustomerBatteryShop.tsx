import Link from "next/link";
import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import { RecommendedBatteryCard } from "@/components/platform/RecommendedBatteryCard";
import { getBatteryImageFit } from "@/lib/battery-image-presentation";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import {
  batteryProductDetailHref,
  batterySpecGuideHref,
} from "@/lib/battery-product-routes";
import {
  findBatteryProductByCode,
  getBatteryImageSet,
  hasStrictBrandProductImage,
} from "@/lib/battery-alias-map";
import { productBatteryCode } from "@/lib/batteryNormalize";
import { getBatteryInternetPriceWon, getBatteryOnsitePriceWon } from "@/lib/battery-prices";
import { formatPriceWon } from "@/lib/pricing/order-price";
import { CUSTOMER_DETAIL_PRICE_LABELS } from "@/lib/pricing/customer-price-labels";
import { PRIMARY_BATTERY_CTAS } from "@/lib/search/battery-recommendation-copy";
import { buildFuelHeroCardGroups } from "@/lib/vehicle-fuel-primary-battery";
import type { BatteryBrandKey } from "@/lib/battery-alias-map";
import {
  shouldShowVehicleTrimCautionNotice,
  VEHICLE_TRIM_CAUTION_COPY,
} from "@/lib/vehicle-detail-recommendation";
import type { FuelBatteryGroup } from "@/lib/vehicleBattery";
import {
  EV_LOW_VOLTAGE_DISPLAY_SUBTITLE,
  EV_LOW_VOLTAGE_DISPLAY_TITLE,
  isEvLowVoltageBatteryStatus,
  resolveCustomerBatteryPresentation,
  shouldShowEvLowVoltageCard,
} from "@/lib/ev-low-voltage-battery-policy";
import {
  getVehicleFixedBatteryNotice,
  getVehicleSalesExcludedNotice,
  isVehicleFuelSalesExcluded,
  LITHIUM_EXCLUDED_FUEL_COPY,
  shouldRenderFuelGroupInShop,
} from "@/lib/vehicle-battery-customer-policy";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";
import {
  HYBRID_BATTERY_CHECK_MESSAGE,
  HYBRID_SPEC_PENDING_MESSAGE,
} from "@/lib/vehicle-fuel-selection";
import {
  BATTERY_MATCH_PENDING_MESSAGE,
  hasCatalogBatteryMatch,
  isValidBatterySpecCode,
  resolveCustomerCatalogPrimaryBattery,
} from "@/lib/vehicle-battery-match";

const BRAND_OFFERS: { id: BatteryBrandKey; label: string }[] = [
  { id: "rocket", label: "로케트" },
  { id: "solite", label: "쏠라이트" },
  { id: "delco", label: "델코" },
  { id: "varta", label: "아트라스BX" },
];

function brandOffersForVehicleSpec(vehicleSpecCode: string) {
  return BRAND_OFFERS.flatMap((b) => {
    const productCode = findBatteryProductByCode(vehicleSpecCode, b.id, { strictBrand: true });
    if (!productCode || !hasStrictBrandProductImage(vehicleSpecCode, b.id)) return [];
    return [{ ...b, productCode }];
  });
}

type SelectedFuelBattery = {
  batteryCode: string;
  fuelLabel: string;
};

/** 선택 연료 기준 단일 추천 규격 — 연료별 merge 금지 */
function buildSelectedFuelBattery(
  slug: string,
  fuelCards: ReturnType<typeof buildFuelHeroCardGroups>,
  selectedFuel: string | null,
): SelectedFuelBattery | null {
  if (!selectedFuel) return null;

  const group = fuelCards.find((g) => g.fuelLabel === selectedFuel);
  if (!group) return null;

  if (
    shouldShowEvLowVoltageCard(slug, group.fuelLabel) ||
    isEvLowVoltageBatteryStatus(group.primaryBattery)
  ) {
    return null;
  }

  const batteryCode = resolveCustomerCatalogPrimaryBattery(slug, group.fuelLabel);
  const presentation = resolveCustomerBatteryPresentation(slug, group.fuelLabel);
  if (!batteryCode || presentation.kind !== "ice_product") return null;

  return { batteryCode, fuelLabel: group.fuelLabel };
}

function BrandProductCard({
  brandId,
  brandLabel,
  vehicleSpecCode,
  productCode,
  vehicleSlug,
}: {
  brandId: BatteryBrandKey;
  brandLabel: string;
  vehicleSpecCode: string;
  productCode: string;
  vehicleSlug: string;
}) {
  const imageSet = getBatteryImageSet(productCode, brandId, { strictBrand: true });
  const hasImageSet = Boolean(imageSet?.main?.trim());
  const displayLabel = productBatteryCode(productCode) || productCode;
  const display = parseBatterySpecDisplay(displayLabel);
  const specHref = batterySpecGuideHref(vehicleSpecCode);
  const orderHref =
    batteryProductDetailHref(brandId, vehicleSpecCode) ??
    batterySpecGuideHref(vehicleSpecCode);
  const internetPrice = getBatteryInternetPriceWon(brandId, productCode);
  const onsitePrice = getBatteryOnsitePriceWon(brandId, productCode);

  const metaLine = [display.typeLabel, display.capacity, display.terminalLabel].filter(Boolean).join(" · ");

  return (
    <article className="vehicle-recommended-card" data-vehicle-recommended-card>
      <div className="vehicle-recommended-card__media">
        <BatteryThumbnail
          code={productCode}
          imageSet={hasImageSet ? imageSet : undefined}
          role="main"
          fit={getBatteryImageFit(productCode, brandId)}
          overlayLabel={false}
          surface="transparent"
          className="h-full w-full"
        />
      </div>
      <div className="vehicle-recommended-card__info">
        <p className="vehicle-recommended-card__brand">{brandLabel}</p>
        <p className="vehicle-recommended-card__spec">{displayLabel}</p>
        {metaLine ? <p className="vehicle-recommended-card__meta">{metaLine}</p> : null}
      </div>
      <div className="vehicle-recommended-card__commerce">
        {internetPrice != null || onsitePrice != null ? (
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
        ) : null}
        <div className="vehicle-recommended-card__actions">
          <Link
            href={specHref}
            className={`vehicle-recommended-card__btn-detail ${bm.btnSecondary} justify-center px-3 text-xs font-black`}
          >
            상세보기
          </Link>
          <Link
            href={orderHref}
            className={`vehicle-recommended-card__btn-order ${bm.btnPrimary} justify-center px-3 text-xs font-black`}
            data-vehicle-slug={vehicleSlug}
            data-battery-spec={vehicleSpecCode}
            data-brand={brandId}
          >
            주문하기
          </Link>
        </div>
      </div>
    </article>
  );
}

function EvLowVoltageBatteryCard({
  fuelLabel,
  vehicleTitle,
  yearRange,
  highlighted,
}: {
  fuelLabel: string;
  vehicleTitle: string;
  yearRange?: string;
  highlighted: boolean;
}) {
  return (
    <section
      className={`${bm.card} ${bm.cardPad} border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 ${
        highlighted ? "ring-2 ring-emerald-500" : ""
      }`}
      id={highlighted ? "fuel-card-focus" : undefined}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-black text-emerald-800">{fuelLabel}</p>
          <p className="vehicle-customer-battery__spec-title mt-1 text-emerald-950">
            {EV_LOW_VOLTAGE_DISPLAY_TITLE}
          </p>
          <p className="mt-1 text-sm font-semibold text-emerald-900/80">
            {EV_LOW_VOLTAGE_DISPLAY_SUBTITLE}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-600">
            {vehicleTitle}
            {yearRange ? ` · ${yearRange}` : ""}
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-900 ring-1 ring-emerald-200">
          EV 보조 12V
        </span>
      </div>
      <p className="mt-4 text-sm font-medium leading-relaxed text-slate-700">
        전기차 보조 전원용 12V 배터리입니다. 일반 승용차용 납산·AGM 규격(AGM60L, DIN 계열 등)과
        다릅니다.
      </p>
    </section>
  );
}

type Props = {
  slug: string;
  vehicleTitle: string;
  fuelGroups: FuelBatteryGroup[];
  selectedFuel?: string | null;
  yearRange?: string;
};

export function VehicleCustomerBatteryShop({
  slug,
  vehicleTitle,
  fuelGroups,
  selectedFuel,
  yearRange,
}: Props) {
  const normalizedSelectedFuel = selectedFuel ?? null;
  const salesExcludedNotice = getVehicleSalesExcludedNotice(slug);
  const fixedNotice = getVehicleFixedBatteryNotice(slug);
  const fuelCards = buildFuelHeroCardGroups(slug, fuelGroups, selectedFuel).filter((g) =>
    shouldRenderFuelGroupInShop(slug, g.fuelLabel),
  );
  const selectedBattery = buildSelectedFuelBattery(slug, fuelCards, normalizedSelectedFuel);
  const excludedFuelGroups = fuelGroups.filter((g) =>
    isVehicleFuelSalesExcluded(slug, g.fuelLabel),
  );
  const showTrimCaution = shouldShowVehicleTrimCautionNotice(slug, fuelGroups);

  if (salesExcludedNotice) {
    return (
      <section className={`${bm.card} ${bm.cardPad} vehicle-customer-battery`}>
        <p className="text-sm font-black text-slate-900">배터리 판매 안내</p>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">{salesExcludedNotice}</p>
      </section>
    );
  }

  if (fuelCards.length === 0 || !hasCatalogBatteryMatch(slug)) {
    return (
      <section className={`${bm.card} ${bm.cardPad} vehicle-customer-battery`}>
        <p className="text-sm font-medium text-slate-600">{BATTERY_MATCH_PENDING_MESSAGE}</p>
        <Link href={HUB_STORE_DETAIL} className={`${bm.btnPrimary} mt-4 inline-flex text-sm font-black`}>
          상담하기
        </Link>
      </section>
    );
  }

  return (
    <div className="vehicle-customer-battery space-y-4">
      {fixedNotice ? (
        <p className="rounded-lg bg-amber-50/90 px-3 py-2 text-sm font-medium text-amber-950">
          {fixedNotice}
        </p>
      ) : null}
      {excludedFuelGroups.map((group) => (
        <section
          key={`excluded-${group.fuelLabel}`}
          className={`${bm.card} ${bm.cardPad} border border-slate-200`}
        >
          <p className="text-sm font-black text-slate-800">{group.fuelLabel}</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
            {group.caution?.trim() || LITHIUM_EXCLUDED_FUEL_COPY}
          </p>
        </section>
      ))}
      {selectedFuel
        ? fuelCards
            .filter((group) => group.fuelLabel === selectedFuel)
            .map((group) => {
              const isEvCard =
                shouldShowEvLowVoltageCard(slug, group.fuelLabel) ||
                isEvLowVoltageBatteryStatus(group.primaryBattery);

              if (!isEvCard) return null;

              return (
                <EvLowVoltageBatteryCard
                  key={group.fuelLabel}
                  fuelLabel={group.fuelLabel}
                  vehicleTitle={vehicleTitle}
                  yearRange={yearRange}
                  highlighted
                />
              );
            })
        : null}

      {selectedBattery ? (
        (() => {
          const entry = selectedBattery;
          const brandOffers = brandOffersForVehicleSpec(entry.batteryCode);
          const isHybridFuel = entry.fuelLabel === "하이브리드";
          const hasRenderableProducts = brandOffers.length > 0;
          const showHybridPending =
            isHybridFuel && !hasRenderableProducts && isValidBatterySpecCode(entry.batteryCode);

          return (
            <section
              key={`${entry.fuelLabel}-${entry.batteryCode}`}
              className={`${bm.card} ${bm.cardPad} ring-2 ring-blue-500`}
              id="fuel-card-focus"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="vehicle-customer-battery__spec-title">{entry.batteryCode}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {vehicleTitle} {entry.fuelLabel} 추천 규격
                    {yearRange ? ` · ${yearRange}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 ring-1 ring-blue-100">
                      {entry.fuelLabel}
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-800 ring-1 ring-blue-100">
                  대표 규격
                </span>
              </div>

              {showHybridPending ? (
                <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
                  <p className="text-sm font-black text-slate-900">{HYBRID_SPEC_PENDING_MESSAGE}</p>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {HYBRID_BATTERY_CHECK_MESSAGE}
                  </p>
                </div>
              ) : hasRenderableProducts ? (
                <div className="mt-3 space-y-2">
                  {brandOffers.map((b) => (
                    <BrandProductCard
                      key={`${entry.batteryCode}-${b.id}`}
                      brandId={b.id}
                      brandLabel={b.label}
                      vehicleSpecCode={entry.batteryCode}
                      productCode={b.productCode}
                      vehicleSlug={slug}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-3">
                  <RecommendedBatteryCard
                    code={entry.batteryCode}
                    fieldLabel="추천 규격"
                    vehicleLabel={vehicleTitle}
                    ctas={PRIMARY_BATTERY_CTAS(entry.batteryCode)}
                    primary
                    compact
                    showPricing
                    vehicleDetail
                    brandName="로케트"
                  />
                </div>
              )}

              {showTrimCaution ? (
                <p className="mt-3 rounded-lg bg-amber-50/80 px-3 py-2 text-sm font-medium text-amber-950">
                  {VEHICLE_TRIM_CAUTION_COPY}
                </p>
              ) : null}
            </section>
          );
        })()
      ) : selectedFuel ? (
        <section className={`${bm.card} ${bm.cardPad}`}>
          <p className="text-sm font-medium text-slate-600">
            {selectedFuel === "하이브리드"
              ? HYBRID_BATTERY_CHECK_MESSAGE
              : BATTERY_MATCH_PENDING_MESSAGE}
          </p>
        </section>
      ) : null}

    </div>
  );
}
