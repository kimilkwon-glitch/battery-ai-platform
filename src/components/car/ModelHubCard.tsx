import Link from "next/link";
import type { CarModelHub } from "@/data/cars/types";
import { carAssetUrl } from "@/lib/car-data";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { CardHorizontalLayout } from "@/components/cards/CardHorizontalLayout";
import { bm } from "@/lib/design-tokens";

export function ModelHubCard({ model }: { model: CarModelHub }) {
  const cover = model.coverImageFile ? carAssetUrl(model.brandKey, model.coverImageFile) : null;

  return (
    <CardHorizontalLayout
      as={Link}
      className={`${bm.cardVehicleMatch} group h-full`}
      href={model.href}
      mediaClassName="!p-0"
      imagePanel={
        cover ? (
          <VehicleCardMedia alt={model.displayName} src={cover} />
        ) : (
          <VehicleCardMedia alt={model.displayName} placeholderTitle={model.displayName} src={null} />
        )
      }
    >
      <div className="flex flex-col justify-center p-4 md:p-5">
        <p className="text-[10px] font-black text-blue-600">{model.generationCount}개 세대</p>
        <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950 group-hover:text-blue-700">
          {model.displayName}
        </h3>
        <p className="mt-1 text-xs font-semibold text-slate-600">{model.description}</p>
      </div>
    </CardHorizontalLayout>
  );
}
