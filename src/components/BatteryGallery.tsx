"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BATTERY_IMAGE_SLOT_FILES,
  batteryImageSetForCode,
  type BatteryImageSet,
} from "@/lib/battery-image";

function BatteryGraphicSmall({ code }: { code: string }) {
  return (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 text-[10px] font-black text-slate-500">
      {code}
    </div>
  );
}

export function batteryGalleryItems(imageSet: BatteryImageSet | undefined, code: string) {
  const set = imageSet ?? batteryImageSetForCode(code);
  return BATTERY_IMAGE_SLOT_FILES.flatMap((slot) => {
    const url = set[slot.key];
    if (!url) return [];
    return [{ url, label: slot.label, key: slot.key }];
  });
}

export function BatteryGallery({
  code,
  imageSet,
  selectedIndex = 0,
  onSelect,
  className = "",
  /** 단일 이미지일 때도 영역을 넉넉히 */
  minHeightClass = "min-h-[220px] sm:min-h-[260px]",
}: {
  code: string;
  imageSet?: BatteryImageSet;
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  className?: string;
  minHeightClass?: string;
}) {
  const items = useMemo(() => batteryGalleryItems(imageSet, code), [imageSet, code]);
  const [active, setActive] = useState(selectedIndex);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setActive(selectedIndex);
  }, [selectedIndex, code]);

  const select = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(i, items.length - 1));
      setActive(clamped);
      onSelect?.(clamped);
    },
    [items.length, onSelect],
  );

  const goPrev = () => select(active - 1);
  const goNext = () => select(active + 1);

  if (items.length === 0) {
    return (
      <div className={`overflow-hidden rounded-xl bg-[#f1f5f9] ring-1 ring-slate-200 ${className}`}>
        <BatteryGraphicSmall code={code} />
      </div>
    );
  }

  const safeActive = Math.min(active, items.length - 1);
  const current = items[safeActive];
  const showFallback = failed[safeActive];
  const hasNav = items.length > 1;

  return (
    <div className={`space-y-2 ${className}`} data-battery-gallery={code}>
      <div
        className={`relative overflow-hidden rounded-xl bg-[#f1f5f9] ring-1 ring-slate-200 ${minHeightClass}`}
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null || !hasNav) return;
          const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          if (Math.abs(dx) < 40) return;
          if (dx < 0) goNext();
          else goPrev();
          touchStartX.current = null;
        }}
      >
        {showFallback ? (
          <BatteryGraphicSmall code={code} />
        ) : (
          <Image
            src={current.url}
            alt={`${code} ${current.label}`}
            fill
            className="object-contain p-0.5 sm:p-1"
            sizes="(max-width:768px) 100vw, 480px"
            priority={safeActive === 0}
            onError={() => setFailed((f) => ({ ...f, [safeActive]: true }))}
          />
        )}
        <span className="absolute left-2 top-2 rounded bg-slate-900/70 px-2 py-0.5 text-[10px] font-black text-white">
          {current.label}
        </span>
        {hasNav ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={safeActive <= 0}
              aria-label="이전 사진"
              className="absolute left-1 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow ring-1 ring-slate-200/80 transition hover:bg-white disabled:opacity-30"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={safeActive >= items.length - 1}
              aria-label="다음 사진"
              className="absolute right-1 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow ring-1 ring-slate-200/80 transition hover:bg-white disabled:opacity-30"
            >
              ›
            </button>
            <span className="absolute bottom-2 right-2 rounded bg-slate-900/60 px-2 py-0.5 text-[10px] font-bold text-white">
              {safeActive + 1} / {items.length}
            </span>
          </>
        ) : null}
      </div>
      {hasNav ? (
        <div className={`grid gap-1.5 ${items.length <= 4 ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-7"}`}>
          {items.map((item, i) => (
            <button
              type="button"
              key={item.key}
              onClick={() => select(i)}
              aria-label={`${item.label} 보기`}
              aria-current={safeActive === i ? "true" : undefined}
              className={`relative aspect-square overflow-hidden rounded-lg ring-2 ${safeActive === i ? "ring-blue-600" : "ring-slate-200"}`}
            >
              {failed[i] ? (
                <BatteryGraphicSmall code={code} />
              ) : (
                <Image
                  src={item.url}
                  alt={item.label}
                  fill
                  className="object-cover object-center"
                  sizes="80px"
                  onError={() => setFailed((f) => ({ ...f, [i]: true }))}
                />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
