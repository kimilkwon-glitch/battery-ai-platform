"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getBatteryImageSet } from "@/lib/battery-alias-map";
import { findBatteryBrandImages } from "@/lib/batteryImages";
import {
  batteryImageCandidates,
  batteryImageSetForCode,
  type BatteryImageRole,
} from "@/lib/battery-image";

type BrandKey = "rocket" | "solite";

function imageSetForBrand(code: string, brand: BrandKey) {
  const set = getBatteryImageSet(code, brand);
  if (set?.main) return set;
  const url = findBatteryBrandImages(code)[brand];
  return url ? { main: url } : undefined;
}

export function BatteryBrandImage({
  code,
  brand,
  height = 200,
  className = "",
}: {
  code: string;
  brand: BrandKey;
  height?: number;
  className?: string;
}) {
  const role: BatteryImageRole = "main";
  const imageSet = imageSetForBrand(code, brand) ?? batteryImageSetForCode(code);
  const candidates = useMemo(
    () => batteryImageCandidates(imageSet, code, role),
    [imageSet, code],
  );
  const [index, setIndex] = useState(0);
  const src = candidates[index];

  return (
    <div
      className={`flex w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#F8FBFF] to-white px-3 py-2 ${className}`}
      style={{ height, minHeight: height }}
    >
      {src ? (
        <Image
          alt={`${code} ${brand === "rocket" ? "로케트" : "쏠라이트"}`}
          className="max-h-full max-w-full object-contain object-center"
          height={height - 16}
          onError={() => setIndex((i) => (i + 1 < candidates.length ? i + 1 : i))}
          src={src}
          unoptimized
          width={height}
        />
      ) : (
        <span className="text-xs font-black text-slate-400">{code}</span>
      )}
    </div>
  );
}
