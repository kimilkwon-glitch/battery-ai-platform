"use client";

import Link from "next/link";
import { BatteryMiniThumb } from "@/components/BatteryThumbnail";
import { VehicleCard } from "@/components/portal";
import { productCardPadding, productCardShell } from "@/components/car/car-card-styles";
import { aiHref, getBattery, vehicles } from "@/lib/platform-data";

export function AiVehicleRecommendations() {
  const agm60 = getBattery("AGM60L");

  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
      {[...vehicles]
        .sort((a, b) => (a.batteryCode === "AGM60L" ? -1 : 0) - (b.batteryCode === "AGM60L" ? -1 : 0))
        .slice(0, 4)
        .map((v) => {
        const showThumb = v.batteryCode === "AGM60L";
        if (showThumb) {
          return (
            <Link
              className={`flex items-stretch ${productCardShell} ${productCardPadding}`}
              href={aiHref(`${v.displayName} ${v.batteryCode}`)}
              key={v.id}
            >
              <BatteryMiniThumb code="AGM60L" imageSet={agm60.images} role="main" className="h-24 w-[180px] min-w-[170px] shrink-0" />
              <span className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-950">{v.displayName}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{v.brand} · {v.yearRange}</p>
                <p className="mt-1 text-[15px] font-semibold tracking-tight text-slate-800">AGM60L</p>
                <p className="mt-1 text-[10px] text-slate-500">로케트 실사 · ISG 소형 SUV</p>
              </span>
            </Link>
          );
        }

        return (
          <VehicleCard
            key={v.id}
            title={v.displayName}
            meta={`${v.brand} · ${v.yearRange}`}
            href={aiHref(`${v.displayName} ${v.batteryCode}`)}
            vehicleId={v.id}
          />
        );
      })}
    </div>
  );
}
