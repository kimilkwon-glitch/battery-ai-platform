"use client";

import { CarGenerationImage } from "@/components/car/CarGenerationImage";
import { bm } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export type VehicleCardMediaVariant = "card" | "thumb";

type Props = {
  src: string | null | undefined;
  alt: string;
  commercial?: boolean;
  className?: string;
  variant?: VehicleCardMediaVariant;
  /** analytics / slot registry */
  slug?: string;
  placeholderTitle?: string;
};

/**
 * 사이트 전역 차량 카드 이미지 — 가로 16:9, 통일 배경, contain 크게
 */
export function VehicleCardMedia({
  src,
  alt,
  commercial = false,
  className = "",
  variant = "card",
  slug,
  placeholderTitle,
}: Props) {
  const surfaceClass = variant === "thumb" ? bm.vehicleCardMediaThumb : bm.vehicleCardMedia;

  if (src?.trim()) {
    return (
      <div
        className={cn(surfaceClass, className)}
        data-image-slot={slug ? `vehicle.card.${slug}` : undefined}
        data-image-slot-state="ready"
      >
        <CarGenerationImage
          alt={alt}
          className="h-full w-full !max-h-[96%] !max-w-[96%]"
          commercial={commercial}
          size="compact"
          src={src}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(surfaceClass, "flex flex-col items-center justify-center gap-1 px-2", className)}
      data-image-slot={slug ? `vehicle.card.${slug}` : undefined}
      data-image-slot-state="placeholder"
    >
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">차량</span>
      {placeholderTitle ? (
        <span className="line-clamp-2 text-center text-xs font-bold leading-snug text-slate-600">
          {placeholderTitle}
        </span>
      ) : null}
    </div>
  );
}
