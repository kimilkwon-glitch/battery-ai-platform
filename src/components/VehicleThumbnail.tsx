"use client";

import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { carThumbPlaceholderClass } from "@/components/car/car-card-styles";
import { cn } from "@/lib/utils";

export type VehicleBodyType = "sedan" | "suv" | "compactSuv" | "ev" | "van" | "truck";

function Silhouette({ type }: { type: VehicleBodyType }) {
  const stroke = "#94a3b8";
  const fill = "rgba(148,163,184,0.2)";
  if (type === "suv" || type === "compactSuv") {
    const h = type === "compactSuv" ? 28 : 32;
    return (
      <svg viewBox="0 0 120 56" className="h-full w-full" aria-hidden>
        <path d={`M18 ${h} Q22 18 38 16 L72 14 Q88 14 98 22 L104 ${h} Z`} fill={fill} stroke={stroke} strokeWidth="1.5" />
        <circle cx="34" cy={h + 2} r="9" fill="#e2e8f0" stroke={stroke} strokeWidth="1.2" />
        <circle cx="88" cy={h + 2} r="9" fill="#e2e8f0" stroke={stroke} strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 56" className="h-full w-full" aria-hidden>
      <path d="M16 38 Q20 22 36 20 L84 18 Q100 18 106 28 L110 38 Z" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <circle cx="32" cy="40" r="8" fill="#e2e8f0" stroke={stroke} strokeWidth="1.2" />
      <circle cx="88" cy="40" r="8" fill="#e2e8f0" stroke={stroke} strokeWidth="1.2" />
    </svg>
  );
}

/** platformVehicleId 매핑 시에만 실차 PNG — 없으면 화이트 surface + 실루엣 */
export function VehicleThumbnail({
  bodyType = "sedan",
  label,
  imageSrc,
  className = "",
  commercial = false,
}: {
  bodyType?: VehicleBodyType;
  label?: string;
  imageSrc?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  commercial?: boolean;
}) {
  if (imageSrc) {
    return (
      <span className={cn("bm-vehicle-card-row-media", className)}>
        <VehicleCardMedia
          alt={label ?? "차량"}
          commercial={commercial}
          placeholderTitle={label}
          src={imageSrc}
          variant="thumb"
        />
      </span>
    );
  }

  return (
    <span className={cn("bm-vehicle-card-row-media", className)} aria-hidden>
    <div className={carThumbPlaceholderClass}>
      <Silhouette type={bodyType} />
    </div>
    </span>
  );
}
