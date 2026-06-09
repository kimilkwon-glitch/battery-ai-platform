"use client";

import clsx from "clsx";
import { bm } from "@/lib/design-tokens";
import { FUEL_FILTER_HINT, FUEL_MISMATCH_HINT } from "@/lib/vehicle-fuel-selection";

type Props = {
  fuels: string[];
  selectedFuel: string;
  onSelect: (fuel: string) => void;
};

export function VehicleFuelTabBar({ fuels, selectedFuel, onSelect }: Props) {
  if (fuels.length <= 1) return null;

  return (
    <div className="vehicle-fuel-tab-bar space-y-2" data-vehicle-fuel-tabs>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {fuels.map((fuel) => (
          <button
            key={fuel}
            type="button"
            aria-pressed={selectedFuel === fuel}
            onClick={() => onSelect(fuel)}
            className={clsx(
              bm.filterChip,
              "shrink-0 whitespace-nowrap",
              selectedFuel === fuel ? bm.filterChipOn : bm.filterChipOff,
            )}
          >
            {fuel}
          </button>
        ))}
      </div>
      <p className="vehicle-fuel-tab-bar__hint text-xs font-medium leading-relaxed text-slate-500">
        {FUEL_MISMATCH_HINT} {FUEL_FILTER_HINT}
      </p>
    </div>
  );
}
