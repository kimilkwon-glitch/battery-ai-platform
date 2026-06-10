"use client";

import { useEffect, useMemo, useState } from "react";
import { BatteryStagePhoto } from "@/components/media/BatteryProductImage";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import {
  batteryImageCandidates,
  batteryImageSetForCode,
  type BatteryImageRole,
} from "@/lib/battery-image";
import {
  batteryImageStageHeight,
  batteryImageStageInset,
  type BatteryImageStageVariant,
} from "@/lib/battery-image-stage";
import { SEARCH_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import type { BatteryBrandKey, BatteryImageSet } from "@/lib/battery-alias-map";
import { getBatteryImageSet } from "@/lib/battery-alias-map";
import { batteryThumbSurface } from "@/lib/design-tokens";

type Props = {
  code: string;
  variant?: BatteryImageStageVariant;
  role?: BatteryImageRole;
  imageSet?: BatteryImageSet;
  /** 메인 라인업 — 로케트/쏠라이트 탭별 이미지 */
  preferBrand?: BatteryBrandKey;
  displayLabel?: string;
  className?: string;
  flushTop?: boolean;
  layout?: "stack" | "row";
};

/** 카드·히어로·비교 공통 배터리 image stage */
export function BatteryImageStage({
  code,
  variant = "card",
  role = "main",
  imageSet,
  preferBrand,
  displayLabel,
  className = "",
  flushTop = false,
  layout = "stack",
}: Props) {
  const strictBrand = Boolean(preferBrand);
  const set =
    imageSet ??
    (strictBrand
      ? getBatteryImageSet(code, preferBrand, { strictBrand: true })
      : batteryImageSetForCode(code));
  const candidates = useMemo(
    () => batteryImageCandidates(set, code, role),
    [set, code, role],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [code, preferBrand, set?.main]);

  const src = candidates[index];
  const hasPhoto = Boolean(src) && candidates.length > 0;

  const radius =
    layout === "row" && flushTop
      ? "rounded-t-[16px] rounded-b-none md:rounded-l-[16px] md:rounded-tr-none md:rounded-b-none"
      : flushTop
        ? "rounded-t-[16px] rounded-b-none"
        : "rounded-xl";

  return (
    <div
      className={`battery-image-stage relative w-full overflow-hidden ${batteryThumbSurface} ring-1 ring-[var(--bm-border)]/80 ${batteryImageStageHeight[variant]} ${radius} ${className}`}
      data-flush-top={flushTop ? "true" : undefined}
      data-layout={layout}
      style={{ contain: "layout" }}
      data-battery-image-stage={variant}
      data-prefer-brand={preferBrand}
      data-image-slot={`search.battery.product.${code}`}
      data-image-slot-state={hasPhoto ? "ready" : "placeholder"}
    >
      {hasPhoto ? (
        <BatteryStagePhoto
          code={code}
          src={src}
          candidates={candidates}
          index={index}
          variant={variant}
          onFail={() => setIndex((i) => i + 1)}
        />
      ) : strictBrand ? (
        <div
          className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-slate-100 to-slate-50 ${batteryImageStageInset}`}
          data-home-brand-placeholder="true"
        >
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {preferBrand === "solite" ? "쏠라이트" : "로케트"}
          </span>
          <span className="spec-code text-lg font-black text-slate-500">{displayLabel ?? code}</span>
          <span className="text-[10px] font-medium text-slate-400">실물 기준 확인</span>
        </div>
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
      {variant !== "homeLineup" ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-[var(--bm-image-bg)]/90 to-transparent"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

export function batteryStageForCard(compact = false): BatteryImageStageVariant {
  return compact ? "compact" : "card";
}
