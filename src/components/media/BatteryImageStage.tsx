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
  batteryImageProductFit,
  batteryImageStageHeight,
  batteryImageStageInset,
  type BatteryImageStageVariant,
} from "@/lib/battery-image-stage";
import { SEARCH_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import type { BatteryImageSet } from "@/lib/battery-alias-map";
import { batteryThumbSurface } from "@/lib/design-tokens";

type Props = {
  code: string;
  variant?: BatteryImageStageVariant;
  role?: BatteryImageRole;
  imageSet?: BatteryImageSet;
  className?: string;
  /** rank 카드 상단 — 하단 radius 제거 */
  flushTop?: boolean;
};

function StagePhoto({
  code,
  src,
  candidates,
  index,
  onFail,
}: {
  code: string;
  src: string;
  candidates: string[];
  index: number;
  onFail: () => void;
}) {
  return (
    <div className={`flex h-full w-full items-end justify-center ${batteryImageStageInset}`}>
      <div className="relative h-[88%] w-[92%] shrink-0">
        <Image
          key={src}
          src={src}
          alt={`${code} 배터리`}
          fill
          className={batteryImageProductFit}
          sizes="(max-width:768px) 45vw, 280px"
          loading="lazy"
          onError={() => {
            if (index < candidates.length - 1) onFail();
          }}
        />
      </div>
    </div>
  );
}

/** 카드·히어로·비교 공통 배터리 image stage */
export function BatteryImageStage({
  code,
  variant = "card",
  role = "main",
  imageSet,
  className = "",
  flushTop = false,
}: Props) {
  const set = imageSet ?? batteryImageSetForCode(code);
  const candidates = useMemo(
    () => batteryImageCandidates(set, code, role),
    [set, code, role],
  );
  const [index, setIndex] = useState(0);
  const src = candidates[index];
  const hasPhoto = Boolean(src) && candidates.length > 0;

  const radius = flushTop ? "rounded-t-[18px] rounded-b-none" : "rounded-xl";

  return (
    <div
      className={`battery-image-stage relative w-full overflow-hidden ${batteryThumbSurface} ring-1 ring-[var(--bm-border)]/80 ${batteryImageStageHeight[variant]} ${radius} ${className}`}
      data-battery-image-stage={variant}
      data-image-slot={`search.battery.product.${code}`}
      data-image-slot-state={hasPhoto ? "ready" : "placeholder"}
    >
      {hasPhoto ? (
        <StagePhoto
          code={code}
          src={src}
          candidates={candidates}
          index={index}
          onFail={() => setIndex((i) => i + 1)}
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center ${batteryImageStageInset}`}>
          <MediaImageSlot
            slot={SEARCH_IMAGE_SLOTS.batteryProduct(code)}
            className="h-full max-h-full w-full max-w-full !rounded-lg !ring-0"
            fillContainer
            objectFit="contain"
          />
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-[var(--bm-image-bg)] to-transparent"
        aria-hidden
      />
    </div>
  );
}

/** @deprecated BatteryCardImage — variant 래퍼 */
export function batteryStageForCard(compact = false): BatteryImageStageVariant {
  return compact ? "cardCompact" : "card";
}
