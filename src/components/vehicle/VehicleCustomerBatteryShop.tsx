import Link from "next/link";
import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import { getBatteryImageFit } from "@/lib/battery-image-presentation";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { batteryDetailHref } from "@/lib/canonical-battery-code";
import {
  findBatteryProductByCode,
  getBatteryImageSet,
  hasStrictBrandProductImage,
} from "@/lib/battery-alias-map";
import { productBatteryCode } from "@/lib/batteryNormalize";
import { getHomeCardCopy } from "@/data/battery/batterySpecIndex";
import { hasBrandSpecData } from "@/lib/battery-knowledge";
import {
  buildFuelHeroCardGroups,
  resolveVehicleFuelPrimaryBattery,
} from "@/lib/vehicle-fuel-primary-battery";
import {
  shouldShowVehicleTrimCautionNotice,
  VEHICLE_TRIM_CAUTION_COPY,
} from "@/lib/vehicle-detail-recommendation";
import type { FuelBatteryGroup } from "@/lib/vehicleBattery";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";

const BRAND_OFFERS = [
  { id: "rocket" as const, label: "로케트" },
  { id: "solite" as const, label: "쏠라이트" },
] as const;

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
  brandId: "rocket" | "solite";
  brandLabel: string;
  vehicleSpecCode: string;
  productCode: string;
  vehicleSlug: string;
}) {
  const imageSet = getBatteryImageSet(productCode, brandId, { strictBrand: true });
  const hasImageSet = Boolean(imageSet?.main?.trim());
  const displayLabel = productBatteryCode(productCode) || productCode;
  const display = parseBatterySpecDisplay(displayLabel);
  const detailHref = `${batteryDetailHref(productCode)}?brand=${brandId}`;

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
        <div className="vehicle-brand-product__actions">
          <Link href={detailHref} className={`${bm.btnSecondary} w-full text-sm font-black`}>
            상품 상세 보기
          </Link>
          <Link
            href={`${detailHref}#battery-order`}
            className={`${bm.btnPrimary} w-full text-sm font-black`}
            data-vehicle-slug={vehicleSlug}
          >
            주문하기
          </Link>
        </div>
      </div>
    </article>
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
  const fuelCards = buildFuelHeroCardGroups(slug, fuelGroups, highlightFuel);
  const showTrimCaution = shouldShowVehicleTrimCautionNotice(slug, fuelGroups);

  if (fuelCards.length === 0) {
    return (
      <section className={`${bm.card} ${bm.cardPad} vehicle-customer-battery`}>
        <p className="text-sm font-medium text-slate-600">
          이 차량의 대표 규격을 준비 중입니다. 상담을 통해 확인해 주세요.
        </p>
        <Link href={HUB_STORE_DETAIL} className={`${bm.btnPrimary} mt-4 inline-flex text-sm font-black`}>
          상담하기
        </Link>
      </section>
    );
  }

  return (
    <div className="vehicle-customer-battery space-y-4">
      {fuelCards.map((group) => {
        const batteryCode = resolveVehicleFuelPrimaryBattery(slug, group.fuelLabel);
        const brandOffers = batteryCode ? brandOffersForVehicleSpec(batteryCode) : [];
        const highlighted = highlightFuel === group.fuelLabel;

        if (!batteryCode || brandOffers.length === 0) return null;

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
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">
                적용 연료
              </span>
            </div>

            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
              같은 규격({batteryCode})에 로케트·쏠라이트 중 선택해 주문할 수 있습니다.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
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

            {showTrimCaution ? (
              <p className="mt-4 rounded-lg bg-amber-50/80 px-3 py-2 text-sm font-medium text-amber-950">
                {VEHICLE_TRIM_CAUTION_COPY}
              </p>
            ) : null}
          </section>
        );
      })}

      <section className={`${bm.card} ${bm.cardPad} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
        <p className="text-sm font-medium text-slate-600">
          규격이 맞는지 확실하지 않으면 차량 사진과 함께 상담해 주세요.
        </p>
        <Link href={HUB_STORE_DETAIL} className={`${bm.btnSecondary} shrink-0 text-sm font-black`}>
          상담하기
        </Link>
      </section>
    </div>
  );
}
