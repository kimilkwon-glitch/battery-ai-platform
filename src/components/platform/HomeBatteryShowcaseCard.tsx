"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { productCardShell } from "@/components/car/car-card-styles";
import { BatteryHeightImage } from "@/components/media/BatteryProductImage";
import { getBatteryImageSet } from "@/lib/battery-alias-map";
import { findBatteryBrandImages } from "@/lib/batteryImages";
import {
  batteryImageCandidates,
  batteryImageSetForCode,
  type BatteryImageRole,
} from "@/lib/battery-image";
import { batteryImageStageImgMaxWidth } from "@/lib/battery-image-stage";
import { getBattery } from "@/lib/platform-data";

type BrandTab = "rocket" | "solite";

function imageSetForBrand(code: string, brand: BrandTab) {
  const set = getBatteryImageSet(code, brand);
  if (set?.main) return set;
  const url = findBatteryBrandImages(code)[brand];
  return url ? { main: url } : undefined;
}

function hasBrandImage(code: string, brand: BrandTab): boolean {
  const set = imageSetForBrand(code, brand);
  return Boolean(set?.main);
}

function ShowcaseImage({ code, brand }: { code: string; brand: BrandTab }) {
  const role: BatteryImageRole = "main";
  const imageSet = imageSetForBrand(code, brand) ?? batteryImageSetForCode(code);
  const candidates = useMemo(
    () => batteryImageCandidates(imageSet, code, role),
    [imageSet, code],
  );
  const [index, setIndex] = useState(0);
  const src = candidates[index];

  if (!src) {
    return (
      <div className="flex h-full items-center justify-center text-sm font-black text-slate-400">
        {code}
      </div>
    );
  }

  return (
    <BatteryHeightImage
      src={src}
      alt={`${code} ${brand}`}
      heightClass="h-[136px] min-h-[136px]"
      maxWidthClass={batteryImageStageImgMaxWidth}
      onError={() => setIndex((i) => (i + 1 < candidates.length ? i + 1 : i))}
    />
  );
}

export function HomeBatteryShowcaseCard({
  code,
  href,
  meta,
  onNavigate,
}: {
  code: string;
  href: string;
  meta?: string;
  onNavigate?: () => void;
}) {
  const bat = getBattery(code);
  const hasRocket = hasBrandImage(code, "rocket");
  const hasSolite = hasBrandImage(code, "solite");
  const defaultBrand: BrandTab = hasRocket ? "rocket" : hasSolite ? "solite" : "rocket";
  const [brand, setBrand] = useState<BrandTab>(defaultBrand);

  const terminalLabel =
    bat.terminal === "L" ? "L단자" : bat.terminal === "R" ? "R단자" : bat.terminal;

  return (
    <Link
      className={`group flex h-full flex-col overflow-hidden border border-blue-100 bg-white ${productCardShell} hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl`}
      href={href}
      onClick={onNavigate}
    >
      <div className="relative bg-gradient-to-b from-[#F8FBFF] to-white px-3 pt-3">
        {(hasRocket && hasSolite) ? (
          <div className="mb-2 flex gap-1">
            {(["rocket", "solite"] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setBrand(b);
                }}
                className={`rounded-full px-2 py-0.5 text-[9px] font-black ring-1 transition ${
                  brand === b
                    ? "bg-blue-600 text-white ring-blue-600"
                    : "bg-white text-slate-600 ring-slate-200 hover:ring-blue-200"
                }`}
              >
                {b === "rocket" ? "로케트" : "쏠라이트"}
              </button>
            ))}
          </div>
        ) : hasRocket ? (
          <span className="mb-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-600 ring-1 ring-slate-200">
            로케트
          </span>
        ) : hasSolite ? (
          <span className="mb-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-600 ring-1 ring-slate-200">
            쏠라이트
          </span>
        ) : null}

        <div className="flex h-[160px] min-h-[160px] items-center justify-center">
          <ShowcaseImage brand={brand} code={code} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 border-t border-blue-50 p-4">
        <p className="text-lg font-black tracking-tight text-slate-950 group-hover:text-blue-700">
          {code}
        </p>
        <p className="text-xs font-bold text-slate-600">
          {bat.capacity}
          {bat.cca ? ` · ${bat.cca}` : ""}
          {terminalLabel ? ` · ${terminalLabel}` : ""}
        </p>
        {bat.type ? (
          <span className="inline-flex w-fit rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700">
            {bat.type}
          </span>
        ) : null}
        {meta ? (
          <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-relaxed text-slate-500">
            {meta}
          </p>
        ) : null}
        <span className="mt-auto pt-2 text-[11px] font-black text-blue-600">상세 보기 →</span>
      </div>
    </Link>
  );
}
