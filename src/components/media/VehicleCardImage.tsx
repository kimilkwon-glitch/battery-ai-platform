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
};

/** 차량 asset 있으면 실차 PNG, 없으면 placeholder 슬롯 */
export function VehicleCardImage({
  slug,
  title,
  className = "",
  heightClass = "h-[100px] sm:h-[110px]",
}: Props) {
  const src = getVehicleImageUrlBySlug(slug);

  if (src) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl bg-[var(--bm-image-bg)] ${heightClass} w-full ${className}`}
        data-image-slot={`home.vehicle.quick.${slug}`}
        data-image-slot-state="ready"
      >
        <CarGenerationImage
          alt={title}
          className="h-full w-full"
          commercial={/porter|봉고|마이티/i.test(title)}
          size="compact"
          src={src}
        />
      </div>
    );
  }

  return (
    <MediaImageSlot
      slot={HOME_IMAGE_SLOTS.vehicleQuick(slug, title)}
      className={`${heightClass} ${className}`}
    />
  );
}
