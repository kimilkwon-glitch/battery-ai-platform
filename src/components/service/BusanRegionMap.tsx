"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Store, Truck } from "lucide-react";
import clsx from "clsx";
import {
  BUSAN_COASTLINE_PATH,
  BUSAN_MAP_DISTRICTS,
  BUSAN_MAP_PALETTE,
  BUSAN_MAP_VIEWBOX,
  BUSAN_STORE_PINS,
  BUSAN_WATER_PATH,
  type BusanDistrictId,
} from "@/lib/busan-map-districts";
import { BUSAN_REGION_DISPLAY, type BusanStoreId } from "@/lib/busan-store-matcher";
import { BUSAN_REGION_FOOTNOTE } from "@/lib/busan-service-hub-data";

const FILL = {
  deokcheon: { rest: 0.2, hover: 0.38, active: 0.5 },
  hakjang: { rest: 0.18, hover: 0.36, active: 0.48 },
} as const;

function districtOpacity(
  storeId: BusanStoreId,
  activeStore: BusanStoreId | null,
  hoveredStore: BusanStoreId | null,
  isHovered: boolean,
): number {
  const levels = FILL[storeId];
  const storeHighlighted =
    activeStore === storeId || hoveredStore === storeId;
  if (storeHighlighted) return levels.active;
  if (isHovered) return levels.hover;
  if (activeStore && activeStore !== storeId) return 0.1;
  return levels.rest;
}

export function BusanRegionMap({
  activeStore,
  onSelect,
  onHoverStore,
}: {
  activeStore: BusanStoreId | null;
  onSelect: (id: BusanStoreId) => void;
  onHoverStore?: (id: BusanStoreId | null) => void;
}) {
  const [hoveredDistrict, setHoveredDistrict] = useState<BusanDistrictId | null>(null);

  const hoveredStore = useMemo(() => {
    if (!hoveredDistrict) return null;
    return BUSAN_MAP_DISTRICTS.find((d) => d.id === hoveredDistrict)?.storeId ?? null;
  }, [hoveredDistrict]);

  const displayStore = activeStore ?? hoveredStore;

  return (
    <section
      className="busan-region-map rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-6"
      id="store-map"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-950">부산 권역 지도</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            구역을 선택하거나 동네명을 검색하면 가까운 직영점을 확인할 수 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-blue-500/70" aria-hidden />
            덕천점 권역
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-teal-600/70" aria-hidden />
            학장점 권역
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,300px)] xl:items-start">
        <div className="busan-map-canvas relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-50/80 p-3 sm:p-4">
          <svg
            viewBox={BUSAN_MAP_VIEWBOX}
            className="busan-map-svg mx-auto h-auto w-full max-w-[520px]"
            role="img"
            aria-label="부산 권역 안내 지도"
          >
            <defs>
              <linearGradient id="busan-water" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.55" />
              </linearGradient>
              <filter id="busan-district-shadow" x="-8%" y="-8%" width="116%" height="116%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.12" />
              </filter>
            </defs>

            <path d={BUSAN_WATER_PATH} fill="url(#busan-water)" className="pointer-events-none" />
            <path
              d={BUSAN_COASTLINE_PATH}
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth="1.5"
              className="pointer-events-none"
            />

            {BUSAN_MAP_DISTRICTS.map((district) => {
              const palette = BUSAN_MAP_PALETTE[district.storeId];
              const isHovered = hoveredDistrict === district.id;
              const opacity = districtOpacity(
                district.storeId,
                activeStore,
                hoveredStore,
                isHovered,
              );
              const emphasized =
                activeStore === district.storeId || hoveredStore === district.storeId;

              return (
                <g key={district.id} filter={emphasized ? "url(#busan-district-shadow)" : undefined}>
                  <motion.path
                    d={district.path}
                    fill={palette.fill}
                    stroke={palette.stroke}
                    strokeWidth={emphasized ? 1.8 : 1}
                    className="busan-map-district cursor-pointer"
                    initial={false}
                    animate={{ fillOpacity: opacity }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    onClick={() => onSelect(district.storeId)}
                    onMouseEnter={() => {
                      setHoveredDistrict(district.id);
                      onHoverStore?.(district.storeId);
                    }}
                    onMouseLeave={() => {
                      setHoveredDistrict(null);
                      onHoverStore?.(null);
                    }}
                    onFocus={() => {
                      setHoveredDistrict(district.id);
                      onHoverStore?.(district.storeId);
                    }}
                    onBlur={() => {
                      setHoveredDistrict(null);
                      onHoverStore?.(null);
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${district.label} — ${BUSAN_REGION_DISPLAY[district.storeId].label} 권역`}
                  />
                  <text
                    x={district.labelX}
                    y={district.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none select-none fill-slate-800 text-[11px] font-bold"
                    style={{ fontSize: district.id === "daejeo1" || district.id === "daejeo2" ? 9 : 11 }}
                  >
                    {district.label}
                  </text>
                </g>
              );
            })}

            {(["deokcheon", "hakjang"] as const).map((storeId) => {
              const pin = BUSAN_STORE_PINS[storeId];
              const palette = BUSAN_MAP_PALETTE[storeId];
              const pinActive = displayStore === storeId;
              return (
                <g
                  key={storeId}
                  className="cursor-pointer"
                  onClick={() => onSelect(storeId)}
                  role="presentation"
                >
                  <motion.circle
                    cx={pin.x}
                    cy={pin.y}
                    r={pinActive ? 11 : 8}
                    fill={palette.fill}
                    stroke="#fff"
                    strokeWidth={2}
                    animate={{ scale: pinActive ? 1.08 : 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <text
                    x={pin.x}
                    y={pin.y - 16}
                    textAnchor="middle"
                    className="fill-slate-900 text-[10px] font-black"
                  >
                    {pin.label}
                  </text>
                </g>
              );
            })}
          </svg>

          <p className="mt-3 text-center text-[10px] font-medium leading-relaxed text-slate-400">
            안내용 권역 지도이며 실제 행정 경계와 다를 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <AnimatePresence mode="wait">
            {displayStore ? (
              <motion.div
                key={displayStore}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className={clsx(
                  "rounded-xl border p-4",
                  displayStore === "deokcheon"
                    ? "border-blue-200 bg-blue-50/50"
                    : "border-teal-200 bg-teal-50/50",
                )}
              >
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                  추천 지점
                </p>
                <p className="mt-1 text-xl font-black text-slate-900">
                  {BUSAN_REGION_DISPLAY[displayStore].label}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-700">
                  {BUSAN_REGION_DISPLAY[displayStore].regions}
                </p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
                  {BUSAN_REGION_DISPLAY[displayStore].blurb}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="unknown"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4"
              >
                <p className="text-sm font-black text-slate-800">권역을 선택해 주세요</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  지도에서 구역을 클릭하거나 동네명을 검색하면 추천 지점이 표시됩니다.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {(["deokcheon", "hakjang"] as const).map((id) => {
            const active = displayStore === id;
            const meta = BUSAN_REGION_DISPLAY[id];
            const palette = BUSAN_MAP_PALETTE[id];
            return (
              <motion.button
                key={id}
                type="button"
                onClick={() => onSelect(id)}
                className={clsx(
                  "rounded-xl border p-3 text-left transition-shadow",
                  active
                    ? id === "deokcheon"
                      ? "border-blue-300 bg-blue-50/90 shadow-md shadow-blue-100/60"
                      : "border-teal-300 bg-teal-50/90 shadow-md shadow-teal-100/60"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
                )}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.18 }}
              >
                <div className="flex items-center gap-2">
                  <Store className="size-4" style={{ color: palette.stroke }} aria-hidden />
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
