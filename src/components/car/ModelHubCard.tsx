import Link from "next/link";
import type { CarModelHub } from "@/data/cars/types";
import { carAssetUrl } from "@/lib/car-data";
import { carHeroSurface, vehicleCardShell } from "./car-card-styles";
import { CarGenerationImage } from "./CarGenerationImage";

export function ModelHubCard({ model }: { model: CarModelHub }) {
  const cover = model.coverImageFile ? carAssetUrl(model.brandKey, model.coverImageFile) : null;

  return (
    <Link href={model.href} className={`group flex flex-col overflow-hidden ${vehicleCardShell}`}>
      {cover ? (
        <CarGenerationImage src={cover} alt={model.displayName} size="hero" />
      ) : (
        <div className={`flex h-[200px] w-full items-center justify-center ${carHeroSurface}`} />
      )}
      <div className="p-4">
        <p className="text-[10px] font-black text-blue-600">{model.generationCount}개 세대</p>
        <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950 group-hover:text-blue-700">
          {model.displayName}
        </h3>
        <p className="mt-1 text-xs font-semibold text-slate-600">{model.description}</p>
      </div>
    </Link>
  );
}
