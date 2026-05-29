"use client";

import { motion } from "framer-motion";
import { MapPin, Store, Truck } from "lucide-react";
import clsx from "clsx";
import { BUSAN_REGION_DISPLAY, type BusanStoreId } from "@/lib/busan-store-matcher";
import { BUSAN_REGION_FOOTNOTE } from "@/lib/busan-service-hub-data";

type RegionId = BusanStoreId;

export function BusanRegionMap({
  activeStore,
  onSelect,
}: {
  activeStore: BusanStoreId | null;
  onSelect: (id: BusanStoreId) => void;
}) {
  const regions: { id: RegionId; color: string; path: string; labelX: number; labelY: number }[] = [
    {
      id: "deokcheon",
      color: "#3b82f6",
      path: "M 24 28 L 118 22 L 132 88 L 108 132 L 42 128 L 18 72 Z",
      labelX: 62,
      labelY: 78,
    },
    {
      id: "hakjang",
      color: "#10b981",
      path: "M 108 132 L 168 118 L 196 72 L 182 36 L 132 22 L 118 22 L 132 88 Z",
      labelX: 152,
      labelY: 88,
    },
  ];

  return (
    <section
      className="busan-region-map rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/80 to-white p-4 shadow-sm sm:p-5"
      id="store-map"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-950">부산 권역 안내</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            권역을 선택하면 가까운 직영점을 확인할 수 있습니다.
          </p>
        </div>
        <MapPin className="size-5 shrink-0 text-slate-400" aria-hidden />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)] lg:items-start">
        <div className="relative mx-auto w-full max-w-md">
          <svg
            viewBox="0 0 220 160"
            className="w-full text-slate-200"
            role="img"
            aria-label="부산 권역 단순 지도"
          >
            <rect x="8" y="12" width="204" height="136" rx="12" fill="currentColor" className="text-slate-100" />
            {regions.map((r) => {
              const active = activeStore === r.id;
              return (
                <motion.path
                  key={r.id}
                  d={r.path}
                  fill={r.color}
                  fillOpacity={active ? 0.42 : 0.18}
                  stroke={r.color}
                  strokeWidth={active ? 2.5 : 1.2}
                  className="cursor-pointer"
                  onClick={() => onSelect(r.id)}
                  whileHover={{ fillOpacity: 0.35 }}
                  animate={{ fillOpacity: active ? 0.42 : 0.18 }}
                  transition={{ duration: 0.2 }}
                />
              );
            })}
            {regions.map((r) => (
              <text
                key={`${r.id}-label`}
                x={r.labelX}
                y={r.labelY}
                textAnchor="middle"
                className="fill-slate-800 text-[9px] font-black"
                style={{ fontSize: 9 }}
              >
                {BUSAN_REGION_DISPLAY[r.id].label}
              </text>
            ))}
          </svg>
          <p className="mt-2 text-center text-[10px] font-medium text-slate-400">
            실제 행정 경계와 다를 수 있는 안내용 권역도입니다.
          </p>
        </div>

        <div className="grid gap-3">
          {(["deokcheon", "hakjang"] as const).map((id) => {
            const active = activeStore === id;
            const meta = BUSAN_REGION_DISPLAY[id];
            return (
              <motion.button
                key={id}
                type="button"
                onClick={() => onSelect(id)}
                className={clsx(
                  "rounded-xl border p-3 text-left transition",
                  active
                    ? id === "deokcheon"
                      ? "border-blue-300 bg-blue-50/80 shadow-sm"
                      : "border-emerald-300 bg-emerald-50/80 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300",
                )}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.18 }}
              >
                <div className="flex items-center gap-2">
                  <Store className={clsx("size-4", id === "deokcheon" ? "text-blue-600" : "text-emerald-600")} />
                  <span className="text-sm font-black text-slate-900">{meta.label}</span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-600">{meta.regions}</p>
                <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                  <Truck className="size-3" aria-hidden />
                  출장·내방 권역 기준
                </p>
              </motion.button>
            );
          })}
          <p className="text-[11px] font-medium leading-relaxed text-slate-500">{BUSAN_REGION_FOOTNOTE}</p>
        </div>
      </div>
    </section>
  );
}
