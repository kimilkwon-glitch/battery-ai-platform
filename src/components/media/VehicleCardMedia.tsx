"use client";

import { CarGenerationImage } from "@/components/car/CarGenerationImage";
import { Car } from "lucide-react";
import { bm, CAR_IMAGE_FALLBACK } from "@/lib/design-tokens";
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
      className={cn(surfaceClass, "relative flex flex-col items-center justify-center gap-1 overflow-hidden px-2", className)}
      data-image-slot={slug ? `vehicle.card.${slug}` : undefined}
      data-image-slot-state="placeholder"
    >
      <CarGenerationImage
        alt={alt}
        commercial={commercial}
        className="absolute inset-0 h-full w-full opacity-30"
        size="compact"
        src={CAR_IMAGE_FALLBACK}
      />
      <span className="relative flex size-10 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm ring-1 ring-slate-200">
        <Car className="size-5" aria-hidden />
      </span>
      {placeholderTitle ? (
        <span className="relative line-clamp-2 text-center text-xs font-bold leading-snug text-slate-700">
          {placeholderTitle}
        </span>
      ) : (
        <span className="relative text-[10px] font-bold uppercase tracking-wide text-slate-500">차량</span>
      )}
    </div>
  );
}
