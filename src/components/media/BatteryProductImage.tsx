"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import {
  batteryImageCandidates,
  batteryImageSetForCode,
  type BatteryImageRole,
} from "@/lib/battery-image";
import {
  batteryImageCompactVariant,
  batteryImageProductFit,
  batteryImageStageInset,
  batteryImageStageProductSize,
  type BatteryImageCompactVariant,
  type BatteryImageStageVariant,
} from "@/lib/battery-image-stage";
import { SEARCH_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import type { BatteryImageSet } from "@/lib/battery-alias-map";
import { batteryThumbSurface } from "@/lib/design-tokens";

type CompactProps = {
  code: string;
  variant: BatteryImageCompactVariant;
  role?: BatteryImageRole;
  imageSet?: BatteryImageSet;
  className?: string;
};

function ProductFill({
  code,
  src,
  candidates,
  index,
  onFail,
  productClass,
  sizes,
}: {
  code: string;
  src: string;
  candidates: string[];
  index: number;
  onFail: () => void;
  productClass: string;
  sizes: string;
}) {
  return (
    <div className={`flex h-full w-full items-center justify-center`}>
      <div className={productClass}>
        <Image
          key={src}
          src={src}
          alt={`${code} 배터리`}
          fill
          className={batteryImageProductFit}
          sizes={sizes}
          loading="lazy"
          onError={() => {
            if (index < candidates.length - 1) onFail();
          }}
        />
      </div>
    </div>
  );
}

/** Q&A 칩 · mini 썸네일 · 가이드 커버 — 공통 contain 렌더 */
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
      className={`battery-product-image ${batteryThumbSurface} ${cfg.shell} ${className}`}
      data-battery-image-variant={variant}
      data-image-slot={`search.battery.product.${code}`}
      data-image-slot-state={hasPhoto ? "ready" : "placeholder"}
    >
      {hasPhoto ? (
        <div className={`h-full w-full ${cfg.inset} flex items-center justify-center`}>
          <ProductFill
            code={code}
            src={src}
            candidates={candidates}
            index={index}
            productClass={cfg.product}
            sizes={cfg.sizes}
            onFail={() => setIndex((i) => i + 1)}
          />
        </div>
      ) : (
        <MediaImageSlot
          slot={SEARCH_IMAGE_SLOTS.batteryProduct(code)}
          className="!h-full !w-full !min-h-0 !rounded-none !ring-0"
          fillContainer
          objectFit="contain"
        />
      )}
    </div>
  );
}

/** stage 내부 사진 영역 — BatteryImageStage 전용 */
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
    <div className={`flex h-full w-full items-center justify-center ${batteryImageStageInset}`}>
      <ProductFill
        code={code}
        src={src}
        candidates={candidates}
        index={index}
        productClass={batteryImageStageProductSize[variant]}
        sizes="(max-width:768px) 45vw, 280px"
        onFail={onFail}
      />
    </div>
  );
}
