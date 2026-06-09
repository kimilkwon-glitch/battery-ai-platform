"use client";

import { useMemo, useState } from "react";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import {
  batteryImageCandidates,
  batteryImageSetForCode,
  type BatteryImageRole,
} from "@/lib/battery-image";
import {
  batteryImageCompactVariant,
  batteryImageHeightFit,
  batteryImageStageImgHeight,
  batteryImageStageImgMaxWidth,
  batteryImageStageImgMaxWidthByVariant,
  batteryImageStageInset,
  batteryImageStagePhotoScale,
  type BatteryImageCompactVariant,
  type BatteryImageStageVariant,
} from "@/lib/battery-image-stage";
import { SEARCH_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import type { BatteryImageSet } from "@/lib/battery-alias-map";
import { batteryThumbSurface } from "@/lib/design-tokens";

/** height 기준 실사 — width auto, object-contain (AGM95L 등 배경 섞임은 asset 정규화 TODO) */
export function BatteryHeightImage({
  src,
  alt,
  heightClass,
  maxWidthClass = batteryImageStageImgMaxWidth,
  onError,
}: {
  src: string;
  alt: string;
  heightClass: string;
  maxWidthClass?: string;
  onError?: () => void;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`block ${heightClass} ${batteryImageHeightFit} ${maxWidthClass}`}
      loading="lazy"
      decoding="async"
      onError={onError}
    />
  );
}

type CompactProps = {
  code: string;
  variant: BatteryImageCompactVariant;
  role?: BatteryImageRole;
  imageSet?: BatteryImageSet;
  className?: string;
};

export function BatteryProductImage({
  code,
  variant,
  role = "main",
  imageSet,
  className = "",
}: CompactProps) {
  const cfg = batteryImageCompactVariant[variant];
  const set = imageSet ?? batteryImageSetForCode(code);
  const candidates = useMemo(
    () => batteryImageCandidates(set, code, role),
    [set, code, role],
  );
  const [index, setIndex] = useState(0);
  const src = candidates[index];
  const hasPhoto = Boolean(src) && candidates.length > 0;

  return (
    <div
      className={`battery-product-image ${className}`}
      data-battery-image-variant={variant}
      data-image-slot={`search.battery.product.${code}`}
      data-image-slot-state={hasPhoto ? "ready" : "placeholder"}
    >
      {hasPhoto ? (
        <div className={cfg.shell}>
          <BatteryHeightImage
            src={src}
            alt={`${code} 배터리`}
            heightClass={cfg.imgHeight}
            maxWidthClass={cfg.imgMaxWidth}
            onError={() => {
              if (index < candidates.length - 1) setIndex((i) => i + 1);
            }}
          />
        </div>
      ) : (
        <div className={cfg.shell}>
          <MediaImageSlot
            slot={SEARCH_IMAGE_SLOTS.batteryProduct(code)}
            className="!h-auto !max-h-full !w-auto !max-w-full !rounded-none !ring-0"
            fillContainer={false}
            objectFit="contain"
          />
        </div>
      )}
    </div>
  );
}

/** 카드 stage 내부 — height 120~128px */
export function BatteryStagePhoto({
  code,
  src,
  candidates,
  index,
  onFail,
  variant,
}: {
  code: string;
  src: string;
  candidates: string[];
  index: number;
  onFail: () => void;
  variant: BatteryImageStageVariant;
}) {
  return (
    <div className={batteryImageStageInset}>
      <div className={batteryImageStagePhotoScale[variant]}>
        <BatteryHeightImage
          src={src}
          alt={`${code} 배터리`}
          heightClass={batteryImageStageImgHeight[variant]}
          maxWidthClass={batteryImageStageImgMaxWidthByVariant[variant]}
          onError={() => {
            if (index < candidates.length - 1) onFail();
          }}
        />
      </div>
    </div>
  );
}
