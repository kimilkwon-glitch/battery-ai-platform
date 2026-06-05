import { buildVehicleDetailHref } from "@/lib/battery-cta";
import type { SearchUxChip } from "@/lib/search/search-ux-presentation";
import {
  isVehicleFuelSalesExcluded,
  shouldRenderFuelGroupInShop,
} from "@/lib/vehicle-battery-customer-policy";
import type { FuelBatteryGroup } from "@/lib/vehicleBattery";

const FUEL_CHIP_ORDER = ["가솔린", "디젤", "LPG", "하이브리드", "전기"] as const;

export function buildVehicleFuelChips(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
  activeFuel: string | null,
  yearChipId?: string | null,
): SearchUxChip[] {
  const availableFuels = new Set<string>();
  for (const group of fuelGroups) {
    if (
      shouldRenderFuelGroupInShop(slug, group.fuelLabel) ||
      isVehicleFuelSalesExcluded(slug, group.fuelLabel)
    ) {
      availableFuels.add(group.fuelLabel);
    }
  }

  const chips: SearchUxChip[] = [];
  for (const fuel of FUEL_CHIP_ORDER) {
    if (!availableFuels.has(fuel)) continue;
    chips.push({
      label: fuel,
      href: buildVehicleDetailHref(slug, fuel, yearChipId),
      active: activeFuel === fuel,
      variant: "fuel",
    });
  }

  for (const group of fuelGroups) {
    if (FUEL_CHIP_ORDER.includes(group.fuelLabel as (typeof FUEL_CHIP_ORDER)[number])) continue;
    if (!shouldRenderFuelGroupInShop(slug, group.fuelLabel) && !isVehicleFuelSalesExcluded(slug, group.fuelLabel)) {
      continue;
    }
    chips.push({
      label: group.fuelLabel,
      href: buildVehicleDetailHref(slug, group.fuelLabel, yearChipId),
      active: activeFuel === group.fuelLabel,
      variant: "fuel",
    });
  }

  return chips;
}
