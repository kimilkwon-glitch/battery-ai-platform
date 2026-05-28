"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  imageSlotRatioClass,
  type ImageSlotDefinition,
} from "@/lib/media/image-slot-registry";
import {
  isPhantomSlotPath,
  resolveImageSlotAssetUrl,
} from "@/lib/media/resolve-asset-image";

type Props = {
  slot: ImageSlotDefinition;
  /** 레지스트리 srcPath보다 우선 (실사 연결 시) */
  src?: string | null;
  className?: string;
  /** tall: 검색 배터리 카드 h-[180px] 고정 */
  tall?: boolean;
  /** 부모 높이에 맞춤 (차량 리스트 썸네일 등) */
  fillContainer?: boolean;
  priority?: boolean;
  objectFit?: "cover" | "contain";
};

function slotUsesContain(slot: ImageSlotDefinition): boolean {
  return (
    slot.purpose.includes("battery") ||
    slot.purpose.includes("product") ||
    slot.ratio === "4/3"
  );
}

/**
 * 실사 asset 우선 — 없거나 로드 실패 시 placeholder
 */
export function MediaImageSlot({
  slot,
  src,
  className = "",
  tall = false,
  fillContainer = false,
  priority = false,
  objectFit,
}: Props) {
  const assetSrc = useMemo(() => resolveImageSlotAssetUrl(slot), [slot]);
  const explicitSrc = src && !isPhantomSlotPath(src) ? src : null;
  const registrySrc =
    slot.srcPath && !isPhantomSlotPath(slot.srcPath) ? slot.srcPath : null;
  const resolvedSrc = explicitSrc ?? assetSrc ?? registrySrc;
  const [showPlaceholder, setShowPlaceholder] = useState(!resolvedSrc);

  const fit = objectFit ?? (slotUsesContain(slot) ? "contain" : "cover");
  const imgClass =
    fit === "contain"
      ? "object-contain object-center p-2"
      : "object-cover object-center";

  const areaClass = fillContainer
    ? "h-full min-h-0 w-full"
    : tall
      ? "h-[180px] w-full"
      : `${imageSlotRatioClass(slot.ratio)} w-full`;

  if (!showPlaceholder && resolvedSrc) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl bg-[var(--bm-image-bg)] ${areaClass} ${className}`}
        data-image-slot={slot.assetKey}
        data-image-slot-state="ready"
      >
        <Image
          src={resolvedSrc}
          alt={slot.caption}
          fill
          className={imgClass}
          sizes="(max-width:768px) 100vw, 360px"
          priority={priority}
          loading={priority ? undefined : "lazy"}
          onError={() => setShowPlaceholder(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200/90 ring-1 ring-slate-200/80 ${areaClass} ${className}`}
      data-image-slot={slot.assetKey}
      data-image-slot-state="pending"
      aria-label={slot.caption}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(30,41,59,0.04),transparent_55%)]" />
      <div className="relative flex h-full flex-col items-center justify-center px-4 py-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
          {slot.statusLabel}
        </p>
        <p className="mt-1.5 max-w-[240px] text-xs font-semibold leading-snug text-slate-600">{slot.caption}</p>
        <p className="mt-1 max-w-[260px] text-[10px] font-medium leading-relaxed text-slate-500">{slot.hint}</p>
      </div>
    </div>
  );
}
