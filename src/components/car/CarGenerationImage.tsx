"use client";

import { useEffect, useState } from "react";
import { carOriginalFromDisplayUrl } from "@/lib/car-image-url";
import {
  CAR_IMAGE_FALLBACK,
  carHeroSurface,
  vehicleImageBoxClass,
  vehicleImageBoxCommercialClass,
  vehicleImageImgClass,
  vehicleImageImgCommercialClass,
} from "./car-card-styles";

type Props = {
  src: string;
  alt: string;
  size?: "compact" | "hero";
  className?: string;
  /** 차량 카드 — 포터/봉고 등 가로형 상용차 확대 */
  commercial?: boolean;
};

export function CarGenerationImage({ src, alt, size = "compact", className = "", commercial = false }: Props) {
  const safeSrc = src?.trim() ? src : CAR_IMAGE_FALLBACK;
  const [imgSrc, setImgSrc] = useState(safeSrc);
  const [triedOriginal, setTriedOriginal] = useState(false);

  useEffect(() => {
    setImgSrc(src?.trim() ? src : CAR_IMAGE_FALLBACK);
    setTriedOriginal(false);
  }, [src]);

  const handleError = () => {
    const original = carOriginalFromDisplayUrl(imgSrc);
    if (original && !triedOriginal) {
      setTriedOriginal(true);
      setImgSrc(original);
      return;
    }
    if (imgSrc !== CAR_IMAGE_FALLBACK) {
      setImgSrc(CAR_IMAGE_FALLBACK);
    }
  };

  if (size === "hero") {
    return (
      <div
        className={`flex w-full items-center justify-center ${carHeroSurface} ${className}`}
        style={{ minHeight: "240px" }}
      >
        <img
          src={imgSrc}
          alt={alt}
          loading="lazy"
          className="max-h-[220px] w-full max-w-full object-contain object-center px-6 py-4 opacity-100 select-none"
          draggable={false}
          onError={handleError}
        />
      </div>
    );
  }

  const fillParent = /\bh-full\b/.test(className) || /\bw-full\b/.test(className);
  const imgClass = fillParent
    ? "max-h-[94%] max-w-[94%] object-contain object-center"
    : commercial
      ? vehicleImageImgCommercialClass
      : vehicleImageImgClass;
  const boxClass = fillParent
    ? `flex h-full w-full items-center justify-center overflow-hidden ${className}`
    : `${commercial ? vehicleImageBoxCommercialClass : vehicleImageBoxClass} ${className}`;

  return (
    <div className={boxClass}>
      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        className={imgClass}
        draggable={false}
        onError={handleError}
      />
    </div>
  );
}

export default CarGenerationImage;
