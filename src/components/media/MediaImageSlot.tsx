"use client";

import Image from "next/image";
import { useState } from "react";
import {
  imageSlotRatioClass,
  type ImageSlotDefinition,
} from "@/lib/media/image-slot-registry";

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
};

/**
 * 실사가 없거나 로드 실패 시 고급 placeholder — 점선·깨진 아이콘 없음
 */
export function MediaImageSlot({
  slot,
  src,
  className = "",
  tall = false,
  fillContainer = false,
  priority = false,
}: Props) {
  const resolvedSrc = src ?? slot.srcPath;
  const [showPlaceholder, setShowPlaceholder] = useState(!resolvedSrc);

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
          className="object-cover object-center"
          sizes="(max-width:768px) 100vw, 360px"
          priority={priority}
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(30,41,59,0.06),transparent_55%)]" />
      <div className="relative flex h-full flex-col items-center justify-center px-4 py-5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
          {slot.statusLabel}
        </p>
        <p className="mt-2 max-w-[240px] text-xs font-bold leading-snug text-slate-700">{slot.caption}</p>
        <p className="mt-1.5 max-w-[260px] text-[10px] font-medium leading-relaxed text-slate-500">
          {slot.hint}
        </p>
        <p className="mt-2 text-[9px] font-semibold text-slate-400">
          권장 비율 {slot.ratio.replace("/", ":")}
        </p>
      </div>
    </div>
  );
}
