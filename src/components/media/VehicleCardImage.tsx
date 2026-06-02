"use client";

import { CarGenerationImage } from "@/components/car/CarGenerationImage";
import { getVehicleImageUrlBySlug } from "@/lib/media/resolve-asset-image";

type Props = {
  slug: string;
  title: string;
  className?: string;
  heightClass?: string;
  layout?: "stack" | "row";
};

/** 차량 asset 있으면 실차 PNG, 없으면 심플 텍스트 플레이스홀더 */
export function VehicleCardImage({
  slug,
  title,
  className = "",
  heightClass,
  layout = "row",
}: Props) {
  const src = getVehicleImageUrlBySlug(slug);
  const commercial = /porter|봉고|마이티|스타리아/i.test(title);
  const stackHeight = heightClass ?? "h-[7.5rem] sm:h-[8.5rem]";
  const areaClass =
    layout === "row"
      ? "relative flex h-full min-h-[132px] w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-slate-200/80 md:min-h-[158px]"
      : `relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-white ring-1 ring-slate-200/80 ${stackHeight} w-full`;

  if (src) {
    return (
      <div
        className={`${areaClass} ${className}`}
        data-image-slot={`vehicle.card.${slug}`}
        data-image-slot-state="ready"
      >
        <CarGenerationImage
          alt={title}
          className="h-full w-full !max-h-full !max-w-[98%]"
          commercial={commercial}
          size="compact"
          src={src}
        />
      </div>
    );
  }

  return (
    <div
      className={`${areaClass} flex flex-col items-center justify-center gap-1 px-3 ${className}`}
      data-image-slot={`vehicle.card.${slug}`}
      data-image-slot-state="placeholder"
    >
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">차량</span>
      <span className="line-clamp-2 text-center text-xs font-bold leading-snug text-slate-600">{title}</span>
    </div>
  );
}
