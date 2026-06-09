import { notFound } from "next/navigation";
import { AppIcon } from "@/components/common/AppIcon";
import { Breadcrumb, PortalHeader } from "@/components/portal";
import { CarGenerationImage } from "@/components/car/CarGenerationImage";
import { VehicleActivityTracker } from "@/components/vehicle/VehicleActivityTracker";
import { VehicleFuelBatterySection } from "@/components/vehicle/VehicleFuelBatterySection";
import { VehicleSearchCatalogFooter } from "@/components/vehicle/VehicleSearchCatalogFooter";
import { SaveVehicleRegisterButton } from "@/components/vehicle/SaveVehicleRegisterButton";
import { resolveDefaultSelectedFuel } from "@/lib/vehicle-fuel-selection";
import { BUILD_STAMP } from "@/lib/build-stamp";
import { bm } from "@/lib/design-tokens";
import { getVehicleAsset } from "@/lib/car-assets";
import { carImageForPlatformVehicleId } from "@/lib/car-data";
import { customerFacingRepresentativeBattery } from "@/lib/vehicle-detail-recommendation";
import { getVehicleBatteryPageData } from "@/lib/vehicleBattery";
import { getVehicleDetail, getVehicleSlugSet, getVehicleSlugs } from "@/lib/vehicle-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export function generateStaticParams() {
  return getVehicleSlugs().map((slug) => ({ slug }));
}

function isResolvableVehicleSlug(slug: string): boolean {
  if (!slug?.trim()) return false;
  return Boolean(getVehicleAsset(slug)) || getVehicleSlugSet().has(slug);
}

export default async function VehicleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fuel?: string; year?: string; action?: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug).trim();
  const sp = await searchParams;

  if (!isResolvableVehicleSlug(slug)) {
    notFound();
  }

  let vehicle;
  let asset;
  let batteryPage;
  try {
    vehicle = getVehicleDetail(slug);
    asset = getVehicleAsset(slug);
    batteryPage = getVehicleBatteryPageData(slug);
  } catch (err) {
    console.error("[vehicle-detail] data load failed:", slug, err);
    notFound();
  }

  const heroImage = asset?.image || carImageForPlatformVehicleId(slug) || null;
  const displayTitle = batteryPage.profile?.title ?? asset?.displayName ?? vehicle.model;
  const highlightFuel = sp.fuel?.trim() || null;
  const yearChipId = sp.year?.trim() || null;
  const selectedFuel = resolveDefaultSelectedFuel(slug, batteryPage.fuelGroups, highlightFuel);
  const repBattery = customerFacingRepresentativeBattery(slug, batteryPage.fuelGroups);
  const batteryOptions = [
    ...new Set(
      batteryPage.fuelGroups.flatMap((g) =>
        [g.primaryBattery, ...g.batteryOptions].filter(Boolean),
      ),
    ),
  ];
  const autoSaveOnMount = sp.action === "saveVehicle";
  const manufacturer =
    batteryPage.profile?.brand ?? vehicle.manufacturer ?? (asset ? "확인" : "");
  const yearRange = batteryPage.profile?.yearRange ?? vehicle.year ?? asset?.yearRange ?? "";

  return (
    <main
      className={`${bm.pageBg} vehicle-detail-customer`}
      data-page="vehicle-detail"
      data-build-stamp={BUILD_STAMP}
      data-vehicle-slug={slug}
    >
      <VehicleActivityTracker vehicleId={slug} />
      <PortalHeader />

      <section className={`${bm.pageContainerWide} pt-4`}>
        <Breadcrumb
          items={[
            { label: "홈", href: "/" },
            { label: "차종검색", href: "/vehicles" },
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
                  ["제조사", manufacturer],
                  ["연식", yearRange || null],
                  ["대표 규격", repBattery || null],
                ]
                  .filter(([, value]) => Boolean(value))
                  .map(([label, value]) => (
                    <div className="flex gap-2" key={label}>
                      <dt className="font-bold text-slate-500">{label}</dt>
                      <dd className="font-black text-slate-900">{value}</dd>
                    </div>
                  ))}
              </dl>
              {selectedFuel || repBattery ? (
                <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {selectedFuel ? (
                    <div className="flex gap-1.5">
                      <dt className="font-bold text-slate-500">선택 연료</dt>
                      <dd className="font-black text-blue-800">{selectedFuel}</dd>
                    </div>
                  ) : null}
                  {repBattery ? (
                    <div className="flex gap-1.5">
                      <dt className="font-bold text-slate-500">추천 규격</dt>
                      <dd className="font-black text-blue-800">{repBattery}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}
              <div className="mt-4">
                <SaveVehicleRegisterButton
                  slug={slug}
                  displayName={displayTitle}
                  yearRange={yearRange}
                  fuelHint={selectedFuel}
                  recommendedBattery={repBattery}
                  batteryOptions={batteryOptions}
                  autoSaveOnMount={autoSaveOnMount}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4" id="fuel-batteries">
          <VehicleFuelBatterySection
            slug={slug}
            vehicleTitle={displayTitle}
            fuelGroups={batteryPage.fuelGroups}
            initialFuel={selectedFuel}
            yearRange={yearRange}
            yearChipId={yearChipId}
          />
          <VehicleSearchCatalogFooter />
        </div>
      </section>
    </main>
  );
}
