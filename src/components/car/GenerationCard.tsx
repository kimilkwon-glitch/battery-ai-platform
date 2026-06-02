import Link from "next/link";
import type { CarGeneration } from "@/data/cars/types";
import { carGenerationHref, carGenerationImageSrc } from "@/lib/car-data";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { vehicleCardShell, vehicleCardTextCol } from "./car-card-styles";

function SpecBadge({ children }: { children: string }) {
  return (
    <span className="rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-black text-blue-700 ring-1 ring-slate-200/80">
      {children}
    </span>
  );
}

export function GenerationCard({ generation }: { generation: CarGeneration }) {
  const href = carGenerationHref(generation.id);
  const imageSrc = carGenerationImageSrc(generation);
  const specLine = `${generation.yearRange} · ${generation.defaultBatteryCode}`;

  return (
    <Link href={href} className={`flex items-stretch ${vehicleCardShell}`}>
      <span className="bm-vehicle-card-row-media">
        <VehicleCardMedia alt={generation.displayName} src={imageSrc} variant="thumb" />
      </span>
      <div className={vehicleCardTextCol}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-black tracking-[-0.03em] text-slate-950 group-hover:text-blue-700">
            {generation.displayName}
          </h3>
          <span className="shrink-0 rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-black text-white">
            {generation.shortName}
          </span>
        </div>
        <p className="mt-1.5">
          <SpecBadge>{specLine}</SpecBadge>
        </p>
        <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-relaxed text-slate-600">{generation.summary}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded bg-white/70 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 ring-1 ring-slate-200/60">
            {generation.batteryType}
          </span>
          {generation.isg ? (
            <span className="rounded bg-emerald-50/90 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 ring-1 ring-emerald-100/80">
              ISG
            </span>
          ) : null}
          {generation.smartCharge ? (
            <span className="rounded bg-violet-50/90 px-1.5 py-0.5 text-[9px] font-bold text-violet-700 ring-1 ring-violet-100/80">
              스마트충전
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-[10px] font-black text-blue-600 opacity-0 transition group-hover:opacity-100">배터리 찾기 →</p>
      </div>
    </Link>
  );
}
