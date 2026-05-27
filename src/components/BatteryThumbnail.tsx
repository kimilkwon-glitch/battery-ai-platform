"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { BatteryBrandBadges } from "@/components/BatteryBrandBadges";
import { hasRocketBatteryAssets, hasSoliteBatteryAssets, hasBatteryAssets, getCanonicalBatteryCode, type BatteryBrandKey } from "@/lib/battery-alias-map";
import { batteryThumbSurface, productCardShell } from "@/components/car/car-card-styles";
import {
  batteryImageCandidates,
  batteryImageSetForCode,
  batteryRatioClass,
  type BatteryImageRatio,
  type BatteryImageRole,
  type BatteryImageSet,
} from "@/lib/battery-image";

function BatteryGraphic({ code }: { code: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 p-3">
      <div className="relative h-[55%] w-[75%] rounded-md border border-slate-300/80 bg-gradient-to-b from-slate-700 to-slate-900 shadow-inner">
        <div className="absolute -right-1 top-1/2 h-3 w-2 -translate-y-1/2 rounded-sm bg-amber-400" />
        <div className="absolute left-2 top-2 h-1.5 w-8 rounded bg-cyan-300/80" />
      </div>
      <p className="mt-2 text-[10px] font-black text-slate-600">{code}</p>
    </div>
  );
}

export function BatteryThumbnail({
  code,
  imageSet,
  image,
  role = "main",
  capacity,
  cca,
  ratio = "16/9",
  fit = "cover",
  overlayLabel,
  darkOverlay = true,
  className = "",
  tall = false,
  surface = "muted",
}: {
  code: string;
  imageSet?: BatteryImageSet;
  /** 단일 URL 오버라이드 */
  image?: string;
  role?: BatteryImageRole;
  capacity?: string;
  cca?: string;
  ratio?: BatteryImageRatio;
  fit?: "cover" | "contain";
  overlayLabel?: boolean;
  darkOverlay?: boolean;
  className?: string;
  /** 카드 상단 대표 이미지 — h-[180px] 통일 */
  tall?: boolean;
  /** muted: 연회색 면 / transparent: 배경 없음 */
  surface?: "muted" | "transparent";
}) {
  const candidates = useMemo(() => {
    const set = imageSet ?? batteryImageSetForCode(code);
    const list = batteryImageCandidates(set, code, role);
    if (image && !list.includes(image)) return [image, ...list];
    return list;
  }, [code, imageSet, image, role]);

  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const src = candidates[index];

  const showGraphic = failed || !src || candidates.length === 0;

  const areaClass = tall ? "h-[180px] w-full" : batteryRatioClass[ratio];
  const imgClass = tall
    ? "object-contain object-center p-3 scale-[1.08]"
    : fit === "contain"
      ? "object-contain object-center p-2"
      : "object-cover object-center";

  const surfaceClass = surface === "transparent" ? "bg-transparent" : batteryThumbSurface;

  return (
    <div
      className={`relative overflow-hidden rounded-t-2xl ${surfaceClass} ${areaClass} ${className}`}
    >
      {showGraphic ? (
        <BatteryGraphic code={code} />
      ) : (
        <>
          <Image
            key={src}
            src={src}
            alt={`${code} 배터리`}
            fill
            className={imgClass}
            sizes="(max-width:768px) 50vw, 320px"
            loading="lazy"
            onError={() => {
              if (index < candidates.length - 1) {
                setIndex((i) => i + 1);
              } else {
                setFailed(true);
              }
            }}
          />
          {darkOverlay ? (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
          ) : null}
        </>
      )}
      {overlayLabel !== false && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/75 to-transparent px-2 pb-1.5 pt-6">
          <p className="text-[10px] font-black text-white">{code}</p>
          {(capacity || cca) && (
            <p className="text-[9px] font-semibold text-slate-200">
              {[capacity, cca].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function BatteryImageCard({
  code,
  imageSet,
  image,
  role = "main",
  capacity,
  cca,
  type,
  terminal,
  meta,
  href,
  ratio = "16/9",
  fit,
  badge,
  showBrandBadges = true,
  brandBadgeMax,
  searchLayout = false,
  imageBrandKey,
  onNavigate,
}: {
  code: string;
  imageSet?: BatteryImageSet;
  image?: string;
  role?: BatteryImageRole;
  capacity?: string;
  cca?: string;
  type?: string;
  terminal?: string;
  meta?: string;
  href?: string;
  ratio?: BatteryImageRatio;
  fit?: "cover" | "contain";
  badge?: string;
  showBrandBadges?: boolean;
  brandBadgeMax?: number;
  searchLayout?: boolean;
  imageBrandKey?: BatteryBrandKey;
  onNavigate?: () => void;
}) {
  const titleCode = getCanonicalBatteryCode(code) ?? code;
  const specLine = [capacity, cca, terminal ? `${terminal}타입` : type].filter(Boolean).join(" · ");

  const inner = (
    <>
      <BatteryThumbnail
        code={code}
        imageSet={imageSet}
        image={image}
        role={role}
        capacity={capacity}
        cca={cca}
        ratio={ratio}
        fit={fit ?? batteryImageFit(code, imageBrandKey)}
        tall
        overlayLabel={false}
        darkOverlay={false}
      />
      <div className={`px-4 pb-4 ${searchLayout ? "pt-2" : "pt-3"}`}>
        <p className={`font-black text-slate-950 ${searchLayout ? "text-base leading-snug" : "text-sm"}`}>{titleCode}</p>
        {specLine ? (
          <p className={`mt-1 font-medium text-slate-500 ${searchLayout ? "text-xs" : "text-[11px] font-bold"}`}>{specLine}</p>
        ) : null}
        {showBrandBadges ? (
          <BatteryBrandBadges code={titleCode} className="mt-1.5" maxVisible={brandBadgeMax ?? 2} />
        ) : null}
        {meta && !searchLayout ? <p className="mt-1.5 text-[10px] font-black text-blue-600">{meta}</p> : null}
        {badge && !searchLayout ? (
          <p className="mt-1 text-[10px] font-semibold text-amber-700">{badge}</p>
        ) : null}
      </div>
    </>
  );

  if (href) return <a href={href} className={`block overflow-hidden ${productCardShell}`} onClick={onNavigate}>{inner}</a>;
  return <div className={`overflow-hidden ${productCardShell}`}>{inner}</div>;
}

export function hasRocketProductAssets(code: string): boolean {
  return hasRocketBatteryAssets(code);
}

export function hasSoliteProductAssets(code: string): boolean {
  return hasSoliteBatteryAssets(code);
}

export function batteryImageFit(code: string, brandKey: BatteryBrandKey = "rocket"): "cover" | "contain" {
  return hasBatteryAssets(code, brandKey) ? "contain" : "cover";
}

/** 최신 콘텐츠·리스트용 고정 비율 썸네일 */
export function BatteryContentThumb({
  code,
  imageSet,
  image,
  role = "main",
  fit,
}: {
  code: string;
  imageSet?: BatteryImageSet;
  image?: string;
  role?: BatteryImageRole;
  fit?: "cover" | "contain";
}) {
  return (
    <div
      className={`relative h-[160px] w-[120px] min-w-[120px] shrink-0 overflow-hidden rounded-xl ${batteryThumbSurface} ring-1 ring-slate-200/80`}
    >
      <BatteryThumbnail
        code={code}
        imageSet={imageSet}
        image={image}
        role={role}
        fit={fit ?? batteryImageFit(code)}
        ratio="16/9"
        surface="muted"
        overlayLabel={false}
        darkOverlay={false}
        className="!absolute !inset-0 !aspect-auto h-full w-full min-h-0 rounded-none rounded-t-xl"
      />
    </div>
  );
}

/** 리스트·검색·AI 추천 등 소형 보조 썸네일 */
export function BatteryMiniThumb({
  code,
  imageSet,
  role = "main",
  className = "h-14 w-14",
}: {
  code: string;
  imageSet?: BatteryImageSet;
  role?: BatteryImageRole;
  className?: string;
}) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-lg ${batteryThumbSurface} ring-1 ring-slate-200 ${className}`}>
      <BatteryThumbnail
        code={code}
        imageSet={imageSet}
        role={role}
        fit={batteryImageFit(code)}
        ratio="1/1"
        overlayLabel={false}
        darkOverlay={false}
        className="!aspect-square h-full min-h-0 w-full"
      />
    </div>
  );
}
