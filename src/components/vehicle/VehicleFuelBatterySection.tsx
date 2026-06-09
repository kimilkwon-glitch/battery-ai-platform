"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildVehicleDetailHref } from "@/lib/battery-cta";
import { normalizeVehicleFuelParam } from "@/lib/vehicle-fuel-primary-battery";
import {
  resolveDefaultSelectedFuel,
  resolveVehicleFuelOptions,
} from "@/lib/vehicle-fuel-selection";
import type { FuelBatteryGroup } from "@/lib/vehicleBattery";
import { VehicleCustomerBatteryShop } from "@/components/vehicle/VehicleCustomerBatteryShop";
import { VehicleFuelTabBar } from "@/components/vehicle/VehicleFuelTabBar";

type Props = {
  slug: string;
  vehicleTitle: string;
  fuelGroups: FuelBatteryGroup[];
  initialFuel: string | null;
  yearRange?: string;
  yearChipId?: string | null;
};

export function VehicleFuelBatterySection({
  slug,
  vehicleTitle,
  fuelGroups,
  initialFuel,
  yearRange = "",
  yearChipId = null,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fuelOptions = useMemo(
    () => resolveVehicleFuelOptions(slug, fuelGroups),
    [slug, fuelGroups],
  );

  const urlFuel = normalizeVehicleFuelParam(searchParams.get("fuel"));
  const defaultFuel = initialFuel ?? resolveDefaultSelectedFuel(slug, fuelGroups, urlFuel);
  const [selectedFuel, setSelectedFuel] = useState<string>(defaultFuel ?? fuelOptions[0] ?? "");

  useEffect(() => {
    const next = resolveDefaultSelectedFuel(slug, fuelGroups, urlFuel);
    if (next) setSelectedFuel(next);
  }, [slug, fuelGroups, urlFuel]);

  const handleFuelSelect = useCallback(
    (fuel: string) => {
      setSelectedFuel(fuel);
      const href = buildVehicleDetailHref(slug, fuel, yearChipId);
      router.replace(href, { scroll: false });
    },
    [router, slug, yearChipId],
  );

  return (
    <div className="vehicle-fuel-battery-section space-y-3">
      <VehicleFuelTabBar
        fuels={fuelOptions}
        selectedFuel={selectedFuel}
        onSelect={handleFuelSelect}
      />
      <VehicleCustomerBatteryShop
        slug={slug}
        vehicleTitle={vehicleTitle}
        fuelGroups={fuelGroups}
        selectedFuel={selectedFuel || null}
        yearRange={yearRange}
      />
    </div>
  );
}
