"use client";



import Link from "next/link";

import { BatteryMiniThumb } from "@/components/BatteryThumbnail";

import { getBattery, getBatteryImageSet } from "@/lib/platform-data";

import { hasRocketBatteryAssets, hasSoliteBatteryAssets } from "@/lib/battery-alias-map";



export function TrendingBatteryRankList({

  items,

}: {

  items: { name: string; hint: string; href: string; reason?: string }[];

}) {

  const thumbFor = (name: string) => {

    if (hasSoliteBatteryAssets(name)) return getBattery(name, "solite");

    if (hasRocketBatteryAssets(name)) return getBattery(name, "rocket");

    return getBattery(name);

  };



  return (

    <div className="space-y-0">

      {items.map(({ name, hint, href, reason }, index) => {

        const bat = thumbFor(name);

        const showThumb = Boolean(bat.images?.main);

        return (

        <Link

          className="group mb-2 grid grid-cols-[28px_1fr_auto] items-center gap-2 rounded-lg bg-slate-50 px-2 py-2 ring-1 ring-slate-200 hover:bg-blue-50"

          href={href}

          key={name}

        >

          <span className="text-xs font-black text-slate-400">{index + 1}</span>

          <span className="flex min-w-0 items-center gap-2">

            {showThumb ? (

              <span className="hidden shrink-0 group-hover:block sm:block">

                <BatteryMiniThumb code={name} imageSet={bat.images} role="main" className="h-10 w-10" />

              </span>

            ) : null}

            <span className="min-w-0">

              <span className="block text-xs font-black">{name}</span>

              <span className="text-[10px] font-semibold text-slate-500">{reason ?? "비교·호환 확인"}</span>

            </span>

          </span>

          <span className="max-w-[72px] truncate text-right text-[10px] font-black text-blue-600">{hint}</span>

        </Link>

      );})}

    </div>

  );

}

