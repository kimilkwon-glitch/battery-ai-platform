import Link from "next/link";
import type { CarGeneration } from "@/data/cars/types";
import { carGenerationHref, carGenerationImageSrc } from "@/lib/car-data";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { vehicleCardShell, vehicleCardTextCol } from "./car-card-styles";

export function GenerationCard({ generation }: { generation: CarGeneration }) {
  const href = carGenerationHref(generation.id);
  const imageSrc = carGenerationImageSrc(generation);

  return (
    <Link href={href} className={`flex items-stretch ${vehicleCardShell}`}>
      <span className="bm-vehicle-card-row-media">
        <VehicleCardMedia alt={generation.displayName} src={imageSrc} variant="thumb" />
      </span>
      <div className={vehicleCardTextCol}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-black tracking-[-0.03em] text-slate-950 group-hover:text-slate-900 sm:text-lg">
            {generation.displayName}
          </h3>
          {generation.shortName ? (
            <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-700 ring-1 ring-slate-200">
              {generation.shortName}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm font-bold text-slate-600">{generation.yearRange}</p>
        <p className="mt-3 text-sm font-black text-slate-700">배터리 찾기 →</p>
      </div>
    </Link>
  );
}
