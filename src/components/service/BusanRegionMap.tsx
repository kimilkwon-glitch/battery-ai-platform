"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Store, Truck } from "lucide-react";
import clsx from "clsx";
import { geoCentroid, geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import {
  assignBusanGeoRegion,
  regionLabel,
  type BusanGeoRegion,
  type BusanHangjeongProps,
} from "@/lib/busan-geo-region";
import {
  BUSAN_MAP_DISCLAIMER,
  BUSAN_MAP_HEIGHT,
  BUSAN_MAP_PALETTE,
  BUSAN_MAP_SOURCE_ATTRIBUTION,
  BUSAN_MAP_VIEWBOX,
  BUSAN_MAP_WIDTH,
  pinsForStores,
} from "@/lib/busan-map-palette";
import { BUSAN_REGION_DISPLAY, type BusanStoreId } from "@/lib/busan-store-matcher";
import { BUSAN_REGION_FOOTNOTE } from "@/lib/busan-service-hub-data";

const GEOJSON_URL = "/assets/maps/busan-hangjeongdong.geojson";

const FILL = {
  deokcheon: { rest: 0.55, hover: 0.72, active: 0.82 },
  hakjang: { rest: 0.52, hover: 0.7, active: 0.8 },
  neutral: { rest: 0.28, hover: 0.4, active: 0.45 },
} as const;

type EnrichedFeature = {
  adm_cd: string;
  adm_nm: string;
  region: BusanGeoRegion;
  pathD: string;
  label: string;
};

function featureOpacity(
  region: BusanGeoRegion,
  activeStore: BusanStoreId | null,
  hoveredStore: BusanStoreId | null,
  isHovered: boolean,
): number {
  const levels = FILL[region];
  if (region === "neutral") {
    if (activeStore || hoveredStore) return 0.18;
    return isHovered ? levels.hover : levels.rest;
  }
  const storeHighlighted = activeStore === region || hoveredStore === region;
  if (storeHighlighted) return levels.active;
  if (isHovered) return levels.hover;
  if (activeStore && activeStore !== region) return 0.12;
  if (hoveredStore && hoveredStore !== region) return 0.15;
  return levels.rest;
}

function strokeForRegion(region: BusanGeoRegion): string {
  if (region === "neutral") return BUSAN_MAP_PALETTE.neutral.stroke;
  return BUSAN_MAP_PALETTE[region].stroke;
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
  const [collection, setCollection] = useState<FeatureCollection<Geometry, BusanHangjeongProps> | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hoveredCd, setHoveredCd] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(GEOJSON_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as FeatureCollection<Geometry, BusanHangjeongProps>;
        if (!cancelled) setCollection(data);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "지도 데이터를 불러오지 못했습니다.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { paths, pins, hoveredStore } = useMemo(() => {
    if (!collection) {
      return { paths: [] as EnrichedFeature[], pins: pinsForStores({}), hoveredStore: null as BusanStoreId | null };
    }

    const projection = geoMercator();
    const pathGen = geoPath(projection);
    projection.fitSize([BUSAN_MAP_WIDTH, BUSAN_MAP_HEIGHT], collection);

    const enriched: EnrichedFeature[] = [];
    const centroidSum: Record<BusanStoreId, { x: number; y: number; n: number }> = {
      deokcheon: { x: 0, y: 0, n: 0 },
      hakjang: { x: 0, y: 0, n: 0 },
    };

    for (const feature of collection.features) {
      const props = feature.properties;
      if (!props?.adm_cd) continue;
      const region = assignBusanGeoRegion(props);
      const pathD = pathGen(feature as Feature<Geometry, BusanHangjeongProps>);
      if (!pathD) continue;

      enriched.push({
        adm_cd: props.adm_cd,
        adm_nm: props.adm_nm,
        region,
        pathD,
        label: regionLabel(props.adm_nm),
      });

      if (region === "deokcheon" || region === "hakjang") {
        const c = pathGen.centroid(feature as Feature<Geometry, BusanHangjeongProps>);
        centroidSum[region].x += c[0];
        centroidSum[region].y += c[1];
        centroidSum[region].n += 1;
      }
    }

    const storeCentroids: Partial<Record<BusanStoreId, { x: number; y: number }>> = {};
    (["deokcheon", "hakjang"] as const).forEach((id) => {
      const s = centroidSum[id];
      if (s.n > 0) {
        storeCentroids[id] = { x: s.x / s.n, y: s.y / s.n };
      } else {
        const feats = collection.features.filter(
          (f) => assignBusanGeoRegion(f.properties!) === id,
        );
        if (feats.length) {
          const c = geoCentroid({
            type: "FeatureCollection",
            features: feats,
          } as FeatureCollection);
          const projected = projection(c);
          if (projected) storeCentroids[id] = { x: projected[0], y: projected[1] };
        }
      }
    });

    const hovered = hoveredCd
      ? enriched.find((p) => p.adm_cd === hoveredCd)?.region ?? null
      : null;
    const hoveredStoreId =
      hovered === "deokcheon" || hovered === "hakjang" ? hovered : null;

    return {
      paths: enriched,
      pins: pinsForStores(storeCentroids),
      hoveredStore: hoveredStoreId,
    };
  }, [collection, hoveredCd]);

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
            행정동 경계 기준 안내 지도입니다. 구역을 선택하거나 동네명을 검색하면 가까운 직영점을 확인할 수
            있습니다.
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
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-slate-300" aria-hidden />
            기타
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,300px)] xl:items-start">
        <div className="busan-map-canvas relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-50/80 p-3 sm:p-4">
          {loadError ? (
            <p className="py-16 text-center text-sm font-semibold text-red-600">{loadError}</p>
          ) : !collection ? (
            <div
              className="mx-auto flex h-[280px] max-w-[520px] animate-pulse items-center justify-center rounded-xl bg-slate-100/80 text-sm font-bold text-slate-400"
              aria-busy
            >
              행정동 지도 불러오는 중…
            </div>
          ) : (
            <svg
              viewBox={BUSAN_MAP_VIEWBOX}
              className="busan-map-svg mx-auto h-auto w-full max-w-[520px]"
              role="img"
              aria-label="부산 행정동 권역 안내 지도"
            >
              <defs>
                <filter id="busan-geo-shadow" x="-4%" y="-4%" width="108%" height="108%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.15" />
                </filter>
              </defs>

              {paths.map((district) => {
                const palette =
                  district.region === "neutral"
                    ? BUSAN_MAP_PALETTE.neutral
                    : BUSAN_MAP_PALETTE[district.region];
                const isHovered = hoveredCd === district.adm_cd;
                const opacity = featureOpacity(
                  district.region,
                  activeStore,
                  hoveredStore,
                  isHovered,
                );
                const emphasized =
                  district.region !== "neutral" &&
                  (activeStore === district.region || hoveredStore === district.region);
                const clickable =
                  district.region === "deokcheon" || district.region === "hakjang";

                return (
                  <g key={district.adm_cd} filter={emphasized ? "url(#busan-geo-shadow)" : undefined}>
                    <motion.path
                      d={district.pathD}
                      fill={palette.fill}
                      stroke={strokeForRegion(district.region)}
                      strokeWidth={emphasized ? 1.2 : 0.35}
                      vectorEffect="non-scaling-stroke"
                      className={clsx(
                        "busan-map-district transition-[stroke-width]",
                        clickable ? "cursor-pointer" : "cursor-default",
                      )}
                      initial={false}
                      animate={{ fillOpacity: opacity }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      onClick={() => {
                        if (district.region === "deokcheon" || district.region === "hakjang") {
                          onSelect(district.region);
                        }
                      }}
                      onMouseEnter={() => {
                        setHoveredCd(district.adm_cd);
                        if (district.region === "deokcheon" || district.region === "hakjang") {
                          onHoverStore?.(district.region);
                        } else {
                          onHoverStore?.(null);
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredCd(null);
                        onHoverStore?.(null);
                      }}
                      onFocus={() => {
                        setHoveredCd(district.adm_cd);
                        if (district.region === "deokcheon" || district.region === "hakjang") {
                          onHoverStore?.(district.region);
                        }
                      }}
                      onBlur={() => {
                        setHoveredCd(null);
                        onHoverStore?.(null);
                      }}
                      tabIndex={clickable ? 0 : -1}
                      role={clickable ? "button" : undefined}
                      aria-label={
                        district.region === "deokcheon" || district.region === "hakjang"
                          ? `${district.label} — ${BUSAN_REGION_DISPLAY[district.region].label} 권역`
                          : `${district.label} — 기타 권역`
                      }
                    />
                  </g>
                );
              })}

              {(["deokcheon", "hakjang"] as const).map((storeId) => {
                const pin = pins[storeId];
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
                      r={pinActive ? 10 : 7}
                      fill={palette.fill}
                      stroke="#fff"
                      strokeWidth={2}
                      animate={{ scale: pinActive ? 1.06 : 1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <text
                      x={pin.x}
                      y={pin.y - 14}
                      textAnchor="middle"
                      className="pointer-events-none fill-slate-900 text-[10px] font-black"
                    >
                      {pin.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          <p className="mt-3 text-center text-[10px] font-medium leading-relaxed text-slate-500">
            {BUSAN_MAP_DISCLAIMER}
          </p>
          <p className="mt-1 text-center text-[9px] text-slate-400">{BUSAN_MAP_SOURCE_ATTRIBUTION}</p>
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
                  지도에서 권역을 클릭하거나 동네명을 검색하면 추천 지점이 표시됩니다.
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
