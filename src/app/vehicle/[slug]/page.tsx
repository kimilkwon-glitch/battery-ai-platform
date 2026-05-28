import { Breadcrumb, PortalHeader } from "@/components/portal";

import { CarGenerationImage } from "@/components/car/CarGenerationImage";

import { VehicleActivityTracker } from "@/components/vehicle/VehicleActivityTracker";

import { VehicleBatterySummaryBox } from "@/components/vehicle/VehicleBatterySummaryBox";

import { VehicleDetailSidebar } from "@/components/vehicle/VehicleDetailSidebar";

import { VehicleBatteryHeroCards } from "@/components/vehicle/VehicleBatteryHeroCards";

import { VehicleDetailTabs } from "@/components/vehicle/VehicleDetailTabs";

import { VehicleNavFooter } from "@/components/vehicle/VehicleNavFooter";
import { VehicleDetailRelatedQna } from "@/components/vehicle/VehicleDetailRelatedQna";

import { bm } from "@/lib/design-tokens";

import { getVehicleAsset } from "@/lib/car-assets";

import { carImageForPlatformVehicleId } from "@/lib/car-data";

import { resolveVehicleFuelPrimaryBattery } from "@/lib/vehicle-fuel-primary-battery";
import { getVehicleBatteryPageData } from "@/lib/vehicleBattery";

import { getVehicleDetail, getVehicleSlugs } from "@/lib/vehicle-data";

import { Suspense } from "react";

/** Git/ISR 캐시로 구버전 HTML이 남지 않도록 항상 동적 렌더 */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export function generateStaticParams() {

  return getVehicleSlugs().map((slug) => ({ slug }));

}



export default async function VehicleDetailPage({

  params,

  searchParams,

}: {

  params: Promise<{ slug: string }>;

  searchParams: Promise<{ fuel?: string; year?: string }>;

}) {

  const { slug } = await params;

  const sp = await searchParams;

  const vehicle = getVehicleDetail(slug);

  const asset = getVehicleAsset(slug);

  const heroImage = asset?.image || carImageForPlatformVehicleId(slug);

  const batteryPage = getVehicleBatteryPageData(slug);

  const displayTitle = batteryPage.profile?.title ?? vehicle.model;

  const highlightFuel = sp.fuel?.trim();
  const showFuelHeroCards =
    batteryPage.fuelGroups.length > 0 &&
    (batteryPage.fuelGroups.length > 1 || /porter2/i.test(slug) || Boolean(highlightFuel));

  const navBatteryCode = resolveVehicleFuelPrimaryBattery(slug, sp.fuel ?? null, {
    yearChipId: sp.year ?? null,
    fallback: batteryPage.summary?.representativeBattery ?? vehicle.recommendedBattery,
  });



  return (

    <main className={bm.pageBg} data-page="vehicle-detail">

      <VehicleActivityTracker vehicleId={slug} />

      <PortalHeader title={vehicle.model} showSearch searchPlaceholder={`${vehicle.model} 배터리 검색`} />



      <section className={`${bm.pageContainerWide} pt-4`}>

        <Breadcrumb

          items={[{ label: "홈", href: "/" }, { label: "차량검색", href: "/vehicles" }, { label: displayTitle }]}

        />

      </section>



      <section className={`mx-auto grid max-w-[1440px] gap-4 px-4 pb-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-6 lg:px-6`}>

        <section className="min-w-0 space-y-4">

          {showFuelHeroCards ? (

            <VehicleBatteryHeroCards

              fuelGroups={batteryPage.fuelGroups}

              highlightFuel={sp.fuel ?? null}

              highlightYear={sp.year ?? null}

              slug={slug}

              vehicleTitle={displayTitle}

              yearChips={batteryPage.yearChips}

            />

          ) : null}



          <div className={`${bm.card} ${bm.cardPad}`}>

            <div className="grid gap-4 sm:grid-cols-[180px_1fr]">

              <div className="overflow-hidden rounded-xl bg-white ring-1 ring-[var(--bm-border)]">

                {heroImage ? (

                  <CarGenerationImage alt={displayTitle} size="hero" src={heroImage} />

                ) : (

                  <div className={`flex h-[105px] items-center justify-center ${vehicle.imageTone} text-white`}>

                    <span className="text-xs font-black">차량</span>

                  </div>

                )}

              </div>

              <div>

                <p className={bm.label}>차량 배터리 프로필</p>

                <h1 className="mt-1 text-xl font-black text-slate-950">{displayTitle}</h1>

                {batteryPage.profile?.subtitle ? (

                  <p className="mt-0.5 text-xs font-bold text-slate-500">{batteryPage.profile.subtitle}</p>

                ) : null}

                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">{vehicle.heroSummary}</p>

                <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">

                  {[

                    ["제조사", vehicle.manufacturer],

                    ["연식", batteryPage.profile?.yearRange ?? vehicle.year],

                    ["연료", vehicle.fuel],

                  ].map(([label, value]) => (

                    <div className="flex gap-1.5" key={label}>

                      <dt className="font-bold text-slate-400">{label}</dt>

                      <dd className="font-black text-slate-700">{value}</dd>

                    </div>

                  ))}

                </dl>

                {asset?.tags?.length ? (

                  <div className="mt-2 flex flex-wrap gap-1">

                    {asset.tags.map((tag) => (

                      <span className={`${bm.badge} ${bm.badgeBlue}`} key={tag}>

                        {tag}

                      </span>

                    ))}

                  </div>

                ) : null}

              </div>

            </div>

          </div>



          {batteryPage.fuelGroups.length <= 1 ? (

            <VehicleBatterySummaryBox summary={batteryPage.summary} title={displayTitle} />

          ) : null}



          <Suspense fallback={null}>

            <VehicleDetailTabs

              fuelGroups={batteryPage.fuelGroups}

              profile={batteryPage.profile}

              slug={slug}

              vehicle={vehicle}

              vehicleTitle={displayTitle}

              yearChips={batteryPage.yearChips}

            />

          </Suspense>



          <VehicleNavFooter

            batteryCode={navBatteryCode}

            vehicleId={slug}

          />



          <VehicleDetailRelatedQna slug={slug} fuelHint={highlightFuel ?? null} />

        </section>



        {batteryPage.fuelGroups.length <= 1 ? (

          <VehicleDetailSidebar

            fuelGroups={batteryPage.fuelGroups}

            relatedFromCatalog={vehicle.related}

            relatedFromDb={batteryPage.relatedVehicles}

            slug={slug}

          />

        ) : (

          <VehicleDetailSidebar

            fuelGroups={batteryPage.fuelGroups}

            hideBatteryLinks

            relatedFromCatalog={vehicle.related}

            relatedFromDb={batteryPage.relatedVehicles}

            slug={slug}

          />

        )}

      </section>

    </main>

  );

}


