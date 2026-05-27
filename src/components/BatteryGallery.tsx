"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  BATTERY_IMAGE_SLOT_FILES,
  batteryImageSetForCode,
  type BatteryImageSet,
} from "@/lib/battery-image";

function BatteryGraphicSmall({ code }: { code: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 text-[10px] font-black text-slate-500">
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
}: {
  code: string;
  imageSet?: BatteryImageSet;
  selectedIndex?: number;
  onSelect?: (index: number) => void;
}) {
  const items = useMemo(() => batteryGalleryItems(imageSet, code), [imageSet, code]);
  const [active, setActive] = useState(selectedIndex);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  function select(i: number) {
    setActive(i);
    onSelect?.(i);
  }

  if (items.length === 0) {
    return (
      <div className="aspect-video rounded-xl bg-[#f1f5f9] ring-1 ring-slate-200">
        <BatteryGraphicSmall code={code} />
      </div>
    );
  }

  const safeActive = Math.min(active, items.length - 1);
  const current = items[safeActive];
  const showFallback = failed[safeActive];

  return (
    <div className="space-y-2">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#f1f5f9] ring-1 ring-slate-200">
        {showFallback ? (
          <BatteryGraphicSmall code={code} />
        ) : (
          <Image
            src={current.url}
            alt={`${code} ${current.label}`}
            fill
            className="object-contain p-2"
            sizes="(max-width:768px) 100vw, 640px"
            onError={() => setFailed((f) => ({ ...f, [safeActive]: true }))}
          />
        )}
        <span className="absolute left-2 top-2 rounded bg-slate-900/70 px-2 py-0.5 text-[10px] font-black text-white">
          {current.label}
        </span>
      </div>
      <div className={`grid gap-1.5 ${items.length <= 4 ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-7"}`}>
        {items.map((item, i) => (
          <button
            type="button"
            key={item.key}
            onClick={() => select(i)}
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
      <p className="text-[10px] font-semibold text-slate-400">{items.length}장 갤러리</p>
    </div>
  );
}
