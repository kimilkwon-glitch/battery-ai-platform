import { VehicleFuelBatterySection } from "@/components/vehicle/VehicleFuelBatterySection";
import { VehicleSearchCatalogFooter } from "@/components/vehicle/VehicleSearchCatalogFooter";
import { VehicleSearchCompactHeader } from "@/components/vehicle/VehicleSearchCompactHeader";
import { customerFacingRepresentativeBattery } from "@/lib/vehicle-detail-recommendation";
import { resolveDefaultSelectedFuel } from "@/lib/vehicle-fuel-selection";
import { resolveCustomerCatalogPrimaryBattery } from "@/lib/vehicle-battery-match";
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
  const selectedFuel = resolveDefaultSelectedFuel(slug, batteryPage.fuelGroups, activeFuel);
  const recommendedSpec =
    customerFacingRepresentativeBattery(slug, batteryPage.fuelGroups) ||
    (selectedFuel ? resolveCustomerCatalogPrimaryBattery(slug, selectedFuel) : null) ||
    resolveCustomerCatalogPrimaryBattery(slug) ||
    null;

  return (
    <div
      className="vehicle-search-catalog space-y-4 motion-safe:animate-[page-enter_0.35s_ease-out_forwards]"
      data-search-ux-mode="vehicle-catalog"
      id="fuel-batteries"
    >
      <VehicleSearchCompactHeader
        vehicleTitle={vehicleTitle}
        yearRange={yearRange}
        highlightFuel={selectedFuel}
        recommendedSpec={recommendedSpec}
        displayQuery={displayQuery}
        intentLabel={intentLabel}
      />
      <VehicleFuelBatterySection
        slug={slug}
        vehicleTitle={vehicleTitle}
        fuelGroups={batteryPage.fuelGroups}
        initialFuel={selectedFuel}
        yearRange={yearRange}
        yearChipId={yearChipId}
      />
      <VehicleSearchCatalogFooter />
    </div>
  );
}
