import Link from "next/link";
import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import { RecommendedBatteryCard } from "@/components/platform/RecommendedBatteryCard";
import { getBatteryImageFit } from "@/lib/battery-image-presentation";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { BATTERY_SPEC_DETAIL_VIEW_LABEL } from "@/lib/battery-card-cta";
import {
  batteryProductDetailHref,
  batteryReviewHref,
  batterySpecGuideHref,
} from "@/lib/battery-product-routes";
import {
  findBatteryProductByCode,
  getBatteryImageSet,
  hasStrictBrandProductImage,
} from "@/lib/battery-alias-map";
import { productBatteryCode } from "@/lib/batteryNormalize";
import { getHomeCardCopy } from "@/data/battery/batterySpecIndex";
import { hasBrandSpecData } from "@/lib/battery-knowledge";
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
  BATTERY_MATCH_PENDING_MESSAGE,
  hasCatalogBatteryMatch,
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
  const reviewHref = batteryReviewHref({ batteryCode: vehicleSpecCode, brandId });

  return (
    <article className="vehicle-brand-product">
      <div className="vehicle-brand-product__media">
        <BatteryThumbnail
          code={productCode}
          imageSet={hasImageSet ? imageSet : undefined}
          role="main"
          fit={getBatteryImageFit(productCode, brandId)}
          tall
          overlayLabel={false}
          surface="transparent"
          className="h-full"
        />
      </div>
      <div className="vehicle-brand-product__body">
        <p className="text-sm font-black text-slate-900">
          {brandLabel} {displayLabel}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-600">
          {[display.typeLabel, display.capacity, display.terminalLabel].filter(Boolean).join(" · ")}
        </p>
        {hasBrandSpecData(productCode) ? (
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
            {getHomeCardCopy(productCode) ?? "상세 페이지에서 제원을 확인할 수 있습니다."}
          </p>
        ) : null}
        <div className="vehicle-brand-product__actions flex flex-col gap-2">
          <Link
            href={reviewHref}
            className="inline-flex w-full items-center justify-center rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-100"
          >
            리뷰 보기
          </Link>
          <Link href={specHref} className={`${bm.btnSecondary} w-full text-sm font-black`}>
            {BATTERY_SPEC_DETAIL_VIEW_LABEL}
          </Link>
          <Link
            href={orderHref}
            className={`${bm.btnPrimary} w-full text-sm font-black shadow-sm`}
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
  highlightFuel?: string | null;
  yearRange?: string;
};

export function VehicleCustomerBatteryShop({
  slug,
  vehicleTitle,
  fuelGroups,
  highlightFuel,
  yearRange,
}: Props) {
  const salesExcludedNotice = getVehicleSalesExcludedNotice(slug);
  const fixedNotice = getVehicleFixedBatteryNotice(slug);
  const fuelCards = buildFuelHeroCardGroups(slug, fuelGroups, highlightFuel).filter((g) =>
    shouldRenderFuelGroupInShop(slug, g.fuelLabel),
  );
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
      {fuelCards.map((group) => {
        const highlighted = highlightFuel === group.fuelLabel;
        const isEvCard =
          shouldShowEvLowVoltageCard(slug, group.fuelLabel) ||
          isEvLowVoltageBatteryStatus(group.primaryBattery);

        if (isEvCard) {
          return (
            <EvLowVoltageBatteryCard
              key={group.fuelLabel}
              fuelLabel={group.fuelLabel}
              vehicleTitle={vehicleTitle}
              yearRange={yearRange}
              highlighted={highlighted}
            />
          );
        }

        const batteryCode = resolveCustomerCatalogPrimaryBattery(slug, group.fuelLabel);
        const brandOffers = batteryCode ? brandOffersForVehicleSpec(batteryCode) : [];
        const presentation = resolveCustomerBatteryPresentation(slug, group.fuelLabel);

        if (!batteryCode || presentation.kind !== "ice_product") return null;

        return (
          <section
            key={group.fuelLabel}
            className={`${bm.card} ${bm.cardPad} ${highlighted ? "ring-2 ring-blue-500" : ""}`}
            id={highlighted ? "fuel-card-focus" : undefined}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-black text-blue-700">{group.fuelLabel}</p>
                <p className="vehicle-customer-battery__spec-title mt-1">{batteryCode}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {vehicleTitle} 기본 추천 규격
                  {yearRange ? ` · ${yearRange}` : ""}
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-800 ring-1 ring-blue-100">
                대표 규격
              </span>
            </div>

            {brandOffers.length > 0 ? (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                  {brandOffers.map((b) => (
                    <BrandProductCard
                      key={`${group.fuelLabel}-${b.id}`}
                      brandId={b.id}
                      brandLabel={b.label}
                      vehicleSpecCode={batteryCode}
                      productCode={b.productCode}
                      vehicleSlug={slug}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-4">
                <p className="mb-3 text-sm font-medium text-slate-600">
                  브랜드별 전용 이미지가 없어도 아래 규격 기준으로 주문·상담이 가능합니다.
                </p>
                <RecommendedBatteryCard
                  code={batteryCode}
                  fieldLabel="추천 규격"
                  vehicleLabel={vehicleTitle}
                  ctas={PRIMARY_BATTERY_CTAS(batteryCode)}
                  primary
                />
              </div>
            )}

            {showTrimCaution ? (
              <p className="mt-4 rounded-lg bg-amber-50/80 px-3 py-2 text-sm font-medium text-amber-950">
                {VEHICLE_TRIM_CAUTION_COPY}
              </p>
            ) : null}
          </section>
        );
      })}

    </div>
  );
}
