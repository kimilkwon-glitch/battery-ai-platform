"use client";

import { useMemo, useState } from "react";
import {
  batteryImageCandidates,
  batteryImageSetForCode,
  type BatteryImageRole,
} from "@/lib/battery-image";
import { QNA_CHIP_IMG_HEIGHT, QNA_CHIP_IMG_MAX_W } from "@/lib/battery-image-stage";
import { BatteryHeightImage } from "@/components/media/BatteryProductImage";
import type { BatteryImageSet } from "@/lib/battery-alias-map";

/**
 * Q&A 관련 배터리 칩 전용 — BatteryMiniSpecLink에서만 사용.
 * h-7(28px) height 기준, 점처럼 보이지 않게 고정.
 */
export function QnaChipBatteryImage({
  code,
  imageSet,
  role = "main",
}: {
  code: string;
  imageSet?: BatteryImageSet;
  role?: BatteryImageRole;
}) {
  const set = imageSet ?? batteryImageSetForCode(code);
  const candidates = useMemo(
    () => batteryImageCandidates(set, code, role),
    [set, code, role],
  );
  const [index, setIndex] = useState(0);
  const src = candidates[index];

  if (!src || candidates.length === 0) {
    return (
      <span
        className={`inline-block ${QNA_CHIP_IMG_HEIGHT} w-6 rounded bg-slate-200/90`}
        aria-hidden
      />
    );
  }

  return (
    <BatteryHeightImage
      src={src}
      alt={code}
      heightClass={QNA_CHIP_IMG_HEIGHT}
      maxWidthClass={QNA_CHIP_IMG_MAX_W}
      onError={() => {
        if (index < candidates.length - 1) setIndex((i) => i + 1);
      }}
    />
  );
}
