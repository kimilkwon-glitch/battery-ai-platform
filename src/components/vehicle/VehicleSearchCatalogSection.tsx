import { SearchConditionChips } from "@/components/platform/search-ux/SearchConditionChips";
import { VehicleCustomerBatteryShop } from "@/components/vehicle/VehicleCustomerBatteryShop";
import { VehicleSearchCatalogFooter } from "@/components/vehicle/VehicleSearchCatalogFooter";
import { VehicleSearchCompactHeader } from "@/components/vehicle/VehicleSearchCompactHeader";
import { customerFacingRepresentativeBattery } from "@/lib/vehicle-detail-recommendation";
import { buildVehicleFuelChips } from "@/lib/vehicle-fuel-chips";
import { resolveVehicleFuelPrimaryBattery } from "@/lib/vehicle-fuel-primary-battery";
import type { SearchUxChip } from "@/lib/search/search-ux-presentation";
import { getVehicleBatteryPageData } from "@/lib/vehicleBattery";

type Props = {
  slug: string;
  highlightFuel?: string | null;
  yearChipId?: string | null;
  displayQuery?: string | null;
  intentLabel?: string | null;
  /** 검색 페이지 — 연식 분기 등 추가 칩 */
  extraChips?: SearchUxChip[];
};

export function VehicleSearchCatalogSection({
  slug,
  highlightFuel,
  yearChipId,
  displayQuery,
  intentLabel,
  extraChips = [],
}: Props) {
  const batteryPage = getVehicleBatteryPageData(slug);
  const vehicleTitle =
    batteryPage.profile?.title ?? batteryPage.profile?.subtitle ?? slug;
  const yearRange = batteryPage.profile?.yearRange ?? "";
  const activeFuel = highlightFuel?.trim() || null;
  const recommendedSpec =
    (activeFuel
      ? resolveVehicleFuelPrimaryBattery(slug, activeFuel, { yearChipId })
      : null) ||
    customerFacingRepresentativeBattery(
      slug,
      batteryPage.fuelGroups,
      batteryPage.summary?.representativeBattery,
    ) ||
    null;

  const fuelChips = buildVehicleFuelChips(slug, batteryPage.fuelGroups, activeFuel, yearChipId);
  const chips = [...extraChips.filter((c) => c.variant === "year"), ...fuelChips];

  return (
    <div
      className="vehicle-search-catalog space-y-4 motion-safe:animate-[page-enter_0.35s_ease-out_forwards]"
      data-search-ux-mode="vehicle-catalog"
      id="fuel-batteries"
    >
      <VehicleSearchCompactHeader
        vehicleTitle={vehicleTitle}
        yearRange={yearRange}
        highlightFuel={activeFuel}
        recommendedSpec={recommendedSpec}
        displayQuery={displayQuery}
        intentLabel={intentLabel}
      />
      {chips.length > 0 ? <SearchConditionChips chips={chips} /> : null}
      <VehicleCustomerBatteryShop
        slug={slug}
        vehicleTitle={vehicleTitle}
        fuelGroups={batteryPage.fuelGroups}
        highlightFuel={activeFuel}
        yearRange={yearRange}
      />
      <VehicleSearchCatalogFooter />
    </div>
  );
}
