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
import { ImageSlotPurposeIcon } from "@/lib/media/image-slot-icons";

type Props = {
  slot: ImageSlotDefinition;
  src?: string | null;
  className?: string;
  tall?: boolean;
  /** 카드 내부 — 낮은 고정 높이 */
  compact?: boolean;
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

export function MediaImageSlot({
  slot,
  src,
  className = "",
  tall = false,
  compact = false,
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
    : compact
      ? "h-[100px] max-h-[112px] w-full"
      : tall
        ? "h-[160px] max-h-[180px] w-full"
        : `${imageSlotRatioClass(slot.ratio)} max-h-[132px] w-full`;

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
      className={`bm-image-slot-pending ${compact ? "bm-image-slot-pending--compact" : ""} ${areaClass} ${className}`}
      data-image-slot={slot.assetKey}
      data-image-slot-state="pending"
      aria-label={slot.caption}
    >
      <div className="flex h-full min-h-[72px] flex-row items-center gap-3 px-3 py-2.5 sm:px-4">
        <span className="bm-image-slot-pending__icon shrink-0" aria-hidden>
          <ImageSlotPurposeIcon purpose={slot.purpose} assetKey={slot.assetKey} />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="bm-image-slot-pending__label">{slot.statusLabel}</p>
          <p className="bm-image-slot-pending__caption mt-0.5 line-clamp-2">{slot.caption}</p>
          {!compact ? (
            <p className="bm-image-slot-pending__hint mt-0.5 line-clamp-2">{slot.hint}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
