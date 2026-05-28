"use client";

import { CarGenerationImage } from "@/components/car/CarGenerationImage";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { getVehicleImageUrlBySlug } from "@/lib/media/resolve-asset-image";
import { HOME_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";

type Props = {
  slug: string;
  title: string;
  className?: string;
  heightClass?: string;
  layout?: "stack" | "row";
};

/** 차량 asset 있으면 실차 PNG, 없으면 placeholder 슬롯 */
export function VehicleCardImage({
  slug,
  title,
  className = "",
  heightClass,
  layout = "row",
}: Props) {
  const src = getVehicleImageUrlBySlug(slug);
  const commercial = /porter|봉고|마이티/i.test(title);
  const stackHeight = heightClass ?? "h-[120px] sm:h-[128px]";
  const areaClass =
    layout === "row"
      ? "relative h-full min-h-[132px] w-full overflow-hidden rounded-xl bg-[var(--bm-image-bg)] ring-1 ring-[var(--bm-border)] md:min-h-[158px]"
      : `relative overflow-hidden rounded-xl bg-[var(--bm-image-bg)] ring-1 ring-[var(--bm-border)] ${stackHeight} w-full`;

  if (src) {
    return (
      <div
        className={`${areaClass} ${className}`}
        data-image-slot={`home.vehicle.quick.${slug}`}
        data-image-slot-state="ready"
      >
        <CarGenerationImage
          alt={title}
          className={
            layout === "row"
              ? commercial
                ? "!h-[86%] !w-[92%] !max-w-[95%]"
                : "!h-[90%] !w-[94%] !max-w-[95%]"
              : "h-full w-full"
          }
          commercial={commercial}
          size="compact"
          src={src}
        />
      </div>
    );
  }

  return (
    <MediaImageSlot
      slot={HOME_IMAGE_SLOTS.vehicleQuick(slug, title)}
      className={`${areaClass} ${className}`}
      compact={layout === "row"}
    />
  );
}
