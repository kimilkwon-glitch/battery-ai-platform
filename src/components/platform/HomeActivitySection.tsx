"use client";

import Link from "next/link";
import { useState } from "react";
import { HomeBatteryShowcaseCard } from "@/components/platform/HomeBatteryShowcaseCard";
import { HomeFeaturedVehicleCard } from "@/components/platform/HomeFeaturedVehicleCard";
import { FEATURED_BATTERY_CODES, FEATURED_VEHICLE_IDS, vehicleLinkForId } from "@/lib/home-page-data";
import { getBatteryHref } from "@/lib/content";
import { bm } from "@/lib/design-tokens";

const VEHICLE_LABELS: Record<string, string> = {
  "sorento-mq4": "쏘렌토 MQ4",
  "grandeur-ig": "그랜저 IG",
  "ioniq5-ne": "아이오닉5",
  "k8-gl3": "K8",
  "carnival-ka4": "카니발 KA4",
  "tucson-nx4": "투싼 NX4",
};

const INITIAL_VISIBLE = 4;

export function HomeActivitySection() {
  const [expanded, setExpanded] = useState(false);

  const vehicles = FEATURED_VEHICLE_IDS.slice(0, 6);
  const batteries = FEATURED_BATTERY_CODES.slice(0, 6);
  const visibleVehicles = expanded ? vehicles : vehicles.slice(0, INITIAL_VISIBLE);
  const visibleBatteries = expanded ? batteries : batteries.slice(0, INITIAL_VISIBLE);

  return (
    <section className={`${bm.card} p-5`}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#0F172A]">많이 찾는 차량 · 규격</h2>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">대표 4개 · 더보기로 확장</p>
        </div>
        <Link className={`${bm.btnTertiary} text-xs`} href="/vehicles">
          차종 더보기
        </Link>
      </div>

      <p className="mb-2 text-[11px] font-black text-slate-500">차량</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visibleVehicles.map((id) => (
          <HomeFeaturedVehicleCard
            href={vehicleLinkForId(id)}
            key={id}
            title={VEHICLE_LABELS[id] ?? id}
            vehicleId={id}
          />
        ))}
      </div>

      <p className="mb-2 mt-5 text-[11px] font-black text-slate-500">배터리 규격</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visibleBatteries.map((code) => (
          <HomeBatteryShowcaseCard code={code} href={getBatteryHref(code)} key={code} />
        ))}
      </div>

      {vehicles.length > INITIAL_VISIBLE || batteries.length > INITIAL_VISIBLE ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 w-full rounded-xl border border-blue-200 bg-[#F8FBFF] py-2.5 text-sm font-black text-blue-700 hover:bg-blue-50"
        >
          {expanded ? "접기" : "인기 차량·규격 더 보기"}
        </button>
      ) : null}
    </section>
  );
}
