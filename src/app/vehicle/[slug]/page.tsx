import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { Breadcrumb, PortalHeader } from "@/components/portal";
import { CarGenerationImage } from "@/components/car/CarGenerationImage";
import { VehicleActivityTracker } from "@/components/vehicle/VehicleActivityTracker";
import { VehicleCustomerBatteryShop } from "@/components/vehicle/VehicleCustomerBatteryShop";
import { bm } from "@/lib/design-tokens";
import { getVehicleAsset } from "@/lib/car-assets";
import { carImageForPlatformVehicleId } from "@/lib/car-data";
import { getVehicleBatteryPageData } from "@/lib/vehicleBattery";
import { getVehicleDetail, getVehicleSlugs } from "@/lib/vehicle-data";

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
  const highlightFuel = sp.fuel?.trim() || null;
  const repBattery =
    batteryPage.summary?.representativeBattery ?? vehicle.recommendedBattery;

  return (
    <main className={`${bm.pageBg} vehicle-detail-customer`} data-page="vehicle-detail">
      <VehicleActivityTracker vehicleId={slug} />
      <PortalHeader />

      <section className={`${bm.pageContainerWide} pt-4`}>
        <Breadcrumb
          items={[
            { label: "홈", href: "/" },
            { label: "차량검색", href: "/vehicles" },
            { label: displayTitle },
          ]}
        />
      </section>

      <section className={`${bm.pageContainerWide} mx-auto max-w-4xl space-y-4 px-4 pb-10`}>
        <div className={`${bm.card} ${bm.cardPad}`}>
          <div className="grid gap-5 sm:grid-cols-[minmax(0,42%)_1fr]">
            <div className="bm-vehicle-card-media flex min-h-[180px] items-center justify-center overflow-hidden rounded-xl sm:min-h-[220px]">
              {heroImage ? (
                <CarGenerationImage
                  alt={displayTitle}
                  className="!bg-transparent"
                  size="hero"
                  src={heroImage}
                />
              ) : (
                <span className="text-sm font-black text-slate-400">차량</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 text-sm font-black text-blue-700">
                <AppIcon iconKey="vehicle" size="sm" />
                내 차 배터리 규격
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {displayTitle}
              </h1>
              {batteryPage.profile?.subtitle ? (
                <p className="mt-1 text-sm font-bold text-slate-600">
                  {batteryPage.profile.subtitle}
                </p>
              ) : null}
              <dl className="vehicle-detail-customer__meta mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  ["제조사", vehicle.manufacturer],
                  ["연식", batteryPage.profile?.yearRange ?? vehicle.year],
                  ["대표 규격", repBattery],
                ].map(([label, value]) => (
                  <div className="flex gap-2" key={label}>
                    <dt className="font-bold text-slate-500">{label}</dt>
                    <dd className="font-black text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
              {highlightFuel ? (
                <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-900">
                  선택 연료: {highlightFuel}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <VehicleCustomerBatteryShop
          slug={slug}
          vehicleTitle={displayTitle}
          fuelGroups={batteryPage.fuelGroups}
          highlightFuel={highlightFuel}
          yearRange={batteryPage.profile?.yearRange ?? vehicle.year}
        />

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/vehicles?register=1`}
            className={`${bm.btnSecondary} text-sm font-black`}
          >
            내 차량으로 등록
          </Link>
        </div>
      </section>
    </main>
  );
}
