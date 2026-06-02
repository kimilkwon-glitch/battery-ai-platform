"use client";

import Link from "next/link";
import { useState } from "react";
import type { CarGeneration } from "@/data/cars/types";
import { carGenerationImageSrc } from "@/lib/car-data";
import {
  compareHref,
  diagnosisHref,
  getBattery,
  searchHref,
  vehicleHref,
} from "@/lib/platform-data";
import { CarGenerationImage } from "./CarGenerationImage";
import { BatteryMiniThumb, hasRocketProductAssets } from "@/components/BatteryThumbnail";

export function GenerationDetailClient({ generation }: { generation: CarGeneration }) {
  const [fuelId, setFuelId] = useState(generation.fuels[0]?.id ?? "gasoline");
  const fuel = generation.fuels.find((f) => f.id === fuelId) ?? generation.fuels[0];
  const battery = fuel ? getBattery(fuel.batteryCode) : getBattery(generation.defaultBatteryCode);
  const searchQuery = `${generation.displayName} ${fuel?.label ?? ""} ${fuel?.batteryCode ?? generation.defaultBatteryCode}`;
  const imageSrc = carGenerationImageSrc(generation);

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bm-vehicle-card-media bm-vehicle-card-media--bleed min-h-[240px] rounded-none">
          <CarGenerationImage src={imageSrc} alt={generation.displayName} size="hero" />
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[10px] font-black text-blue-600">현대 · 그랜저 · {generation.yearRange}</p>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">{generation.displayName}</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-600">{generation.summary}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
            {[
              ["배터리 타입", generation.batteryType],
              ["AGM", generation.agm],
              ["DIN", generation.din],
              ["ISG", generation.isg ? "적용" : "미적용"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                <p className="text-[9px] font-black text-slate-400">{k}</p>
                <p className="text-xs font-black text-slate-900">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-black">연료 선택</h2>
        <p className="mt-1 text-[11px] font-semibold text-slate-500">트림에 맞는 배터리 규격을 확인한 뒤 검색·진단으로 이어가세요.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {generation.fuels.map((f) => (
            <button
              type="button"
              key={f.id}
              onClick={() => setFuelId(f.id)}
              className={`rounded-xl px-4 py-2.5 text-xs font-black ring-1 transition ${
                fuelId === f.id ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-slate-200 hover:ring-blue-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {fuel ? (
          <div className="mt-4 grid gap-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 lg:grid-cols-[auto_1fr]">
            {hasRocketProductAssets(fuel.batteryCode) ? (
              <BatteryMiniThumb code={fuel.batteryCode} imageSet={battery.images} role="main" className="h-24 w-24" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-blue-900 text-[10px] font-black text-white">
                {fuel.batteryCode}
              </div>
            )}
            <div>
              <p className="text-[10px] font-black text-blue-600">추천 규격 · {fuel.label}</p>
              <p className="mt-1 text-xl font-black text-slate-950">{fuel.batteryCode}</p>
              <p className="mt-1 text-xs font-bold text-slate-600">
                {fuel.batteryType} · {battery.capacity} · {battery.cca}
              </p>
              {fuel.note ? <p className="mt-2 text-[11px] font-semibold text-slate-500">{fuel.note}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={searchHref(searchQuery)} className="rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-black text-white hover:bg-blue-700">
                  규격 검색
                </Link>
                <Link href={compareHref(fuel.batteryCode, battery.compareWith[0])} className="rounded-lg bg-white px-3 py-2 text-[11px] font-black ring-1 ring-slate-200 hover:bg-blue-50">
                  배터리 비교
                </Link>
                <Link href={diagnosisHref("slow-engine-start")} className="rounded-lg bg-white px-3 py-2 text-[11px] font-black ring-1 ring-slate-200">
                  증상 진단
                </Link>
                <Link href={vehicleHref(generation.platformVehicleId)} className="rounded-lg bg-slate-950 px-3 py-2 text-[11px] font-black text-white">
                  차량 상세 보기
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
