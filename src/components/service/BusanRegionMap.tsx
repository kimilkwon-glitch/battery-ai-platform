"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Store, Truck } from "lucide-react";
import clsx from "clsx";
import { geoCentroid, geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import {
  assignBusanGeoRegion,
  guLabel,
  regionLabel,
  storeLabelForRegion,
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
  deokcheon: { rest: 0.62, hover: 0.78, active: 0.88 },
  hakjang: { rest: 0.6, hover: 0.76, active: 0.86 },
  neutral: { rest: 0.32, hover: 0.44, active: 0.5 },
} as const;

type EnrichedFeature = {
  adm_cd: string;
  adm_nm: string;
  gu: string;
  region: BusanGeoRegion;
  pathD: string;
  label: string;
};

type SelectedDistrict = {
  gu: string;
  dongLabel: string;
  region: BusanGeoRegion;
};

type MapTooltip = {
  x: number;
  y: number;
  gu: string;
  dongLabel: string;
  region: BusanGeoRegion;
};

function featureOpacity(
  district: EnrichedFeature,
  activeStore: BusanStoreId | null,
  hoveredStore: BusanStoreId | null,
  hoveredGu: string | null,
  searchHighlight: boolean,
  isPathHovered: boolean,
): number {
  const { region, gu } = district;
  const levels = FILL[region];
  const guHighlighted = hoveredGu === gu;
  const storeHighlighted =
    region !== "neutral" && (activeStore === region || hoveredStore === region);

  if (searchHighlight) return 0.22;

  if (region === "neutral") {
    if (guHighlighted || isPathHovered) return levels.hover;
    return levels.rest;
  }

  if (storeHighlighted || guHighlighted) return levels.active;
  if (isPathHovered) return levels.hover;
  if (activeStore && activeStore !== region) return 0.14;
  if (hoveredStore && hoveredStore !== region) return 0.18;
  return levels.rest;
}

function strokeForRegion(region: BusanGeoRegion, emphasized: boolean): string {
  if (region === "neutral") return BUSAN_MAP_PALETTE.neutral.stroke;
  return emphasized ? BUSAN_MAP_PALETTE[region].stroke : `${BUSAN_MAP_PALETTE[region].stroke}99`;
}

function normalizeSearch(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, "");
}

function matchesSearch(district: EnrichedFeature, searchQuery: string | null): boolean {
  if (!searchQuery) return false;
  const q = normalizeSearch(searchQuery);
  if (!q) return false;
  const gu = district.gu.toLowerCase();
  const dong = district.label.toLowerCase();
  const full = district.adm_nm.toLowerCase().replace(/\s+/g, "");
  return gu.includes(q) || dong.includes(q) || full.includes(q);
}

export function BusanRegionMap({
  activeStore,
  searchQuery,
  onSelect,
  onHoverStore,
}: {
  activeStore: BusanStoreId | null;
  searchQuery?: string | null;
  onSelect: (id: BusanStoreId) => void;
  onHoverStore?: (id: BusanStoreId | null) => void;
}) {
  const mapCanvasRef = useRef<HTMLDivElement>(null);
  const [collection, setCollection] = useState<FeatureCollection<Geometry, BusanHangjeongProps> | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hoveredCd, setHoveredCd] = useState<string | null>(null);
  const [hoveredGu, setHoveredGu] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectedDistrict | null>(null);
  const [tooltip, setTooltip] = useState<MapTooltip | null>(null);

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
        gu: guLabel(props),
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

    const hovered = hoveredCd ? enriched.find((p) => p.adm_cd === hoveredCd) : null;
    const hoveredStoreId =
      hovered?.region === "deokcheon" || hovered?.region === "hakjang" ? hovered.region : null;

    return {
      paths: enriched,
      pins: pinsForStores(storeCentroids),
      hoveredStore: hoveredStoreId,
    };
  }, [collection, hoveredCd]);

  const displayStore = activeStore ?? hoveredStore;

  const showTooltip = (district: EnrichedFeature, clientX: number, clientY: number) => {
    const el = mapCanvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTooltip({
      x: clientX - rect.left + 12,
      y: clientY - rect.top - 8,
      gu: district.gu,
      dongLabel: district.label,
      region: district.region,
    });
  };

  const handleDistrictEnter = (district: EnrichedFeature, clientX: number, clientY: number) => {
    setHoveredCd(district.adm_cd);
    setHoveredGu(district.gu);
    showTooltip(district, clientX, clientY);
    if (district.region === "deokcheon" || district.region === "hakjang") {
      onHoverStore?.(district.region);
    } else {
      onHoverStore?.(null);
    }
  };

  const handleDistrictLeave = () => {
    setHoveredCd(null);
    setHoveredGu(null);
    setTooltip(null);
    onHoverStore?.(null);
  };

  const handleDistrictClick = (district: EnrichedFeature) => {
    setSelectedDistrict({
      gu: district.gu,
      dongLabel: district.label,
      region: district.region,
    });
    if (district.region === "deokcheon" || district.region === "hakjang") {
      onSelect(district.region);
    }
  };

  const panelDistrict = selectedDistrict;
  const panelStore = panelDistrict?.region === "deokcheon" || panelDistrict?.region === "hakjang"
    ? panelDistrict.region
    : displayStore;

  return (
    <section
      className="busan-region-map rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-6"
      id="store-map"
    >
      <div>
        <h3 className="text-xl font-black text-slate-950 sm:text-2xl">부산 권역 지도</h3>
        <p className="mt-2 text-base font-semibold text-slate-600">
          구 단위로 담당 지점을 확인할 수 있습니다. 구역에 마우스를 올리거나 클릭하고, 동네명 검색으로
          해당 영역을 강조할 수 있습니다.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,300px)] xl:items-start">
        <div
          ref={mapCanvasRef}
          className="busan-map-canvas relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-50/80 p-3 sm:p-4"
        >
          <div
            className="pointer-events-none absolute right-3 top-3 z-10 rounded-xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-md backdrop-blur-sm"
            aria-label="지도 범례"
          >
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">권역 범례</p>
            <ul className="mt-2.5 space-y-2 text-sm font-bold text-slate-800">
              <li className="flex items-center gap-2.5">
                <span className="size-3.5 shrink-0 rounded-sm bg-blue-500 shadow-sm" aria-hidden />
                덕천점 권역
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-3.5 shrink-0 rounded-sm bg-teal-600 shadow-sm" aria-hidden />
                학장점 권역
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-3.5 shrink-0 rounded-sm bg-slate-300 shadow-sm" aria-hidden />
                기타 · 상담 후 안내
              </li>
            </ul>
          </div>

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
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodOpacity="0.2" />
                </filter>
              </defs>

              {paths.map((district) => {
                const palette =
                  district.region === "neutral"
                    ? BUSAN_MAP_PALETTE.neutral
                    : BUSAN_MAP_PALETTE[district.region];
                const isPathHovered = hoveredCd === district.adm_cd;
                const guHover = hoveredGu === district.gu;
                const searchHit = matchesSearch(district, searchQuery ?? null);
                const searchDim = Boolean(searchQuery?.trim()) && !searchHit;
                const opacity = featureOpacity(
                  district,
                  activeStore,
                  hoveredStore,
                  hoveredGu,
                  searchDim,
                  isPathHovered || guHover,
                );
                const emphasized =
                  district.region !== "neutral" &&
                  (activeStore === district.region ||
                    hoveredStore === district.region ||
                    guHover ||
                    searchHit);
                const clickable = true;

                return (
                  <g
                    key={district.adm_cd}
                    filter={emphasized ? "url(#busan-geo-shadow)" : undefined}
                  >
                    <motion.path
                      d={district.pathD}
                      fill={palette.fill}
                      stroke={strokeForRegion(district.region, emphasized)}
                      strokeWidth={emphasized ? 1.4 : 0.5}
                      vectorEffect="non-scaling-stroke"
                      className={clsx(
                        "busan-map-district transition-[stroke-width]",
                        clickable ? "cursor-pointer" : "cursor-default",
                      )}
                      initial={false}
                      animate={{
                        fillOpacity: opacity,
                        scale: isPathHovered || guHover ? 1.012 : 1,
                      }}
                      style={{ transformOrigin: "center" }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      onClick={() => handleDistrictClick(district)}
                      onMouseEnter={(e) =>
                        handleDistrictEnter(district, e.clientX, e.clientY)
                      }
                      onMouseMove={(e) => showTooltip(district, e.clientX, e.clientY)}
                      onMouseLeave={handleDistrictLeave}
                      onFocus={(e) => {
                        const rect = (e.target as SVGPathElement).getBoundingClientRect();
                        handleDistrictEnter(
                          district,
                          rect.left + rect.width / 2,
                          rect.top + rect.height / 2,
                        );
                      }}
                      onBlur={handleDistrictLeave}
                      tabIndex={0}
                      role="button"
                      aria-label={`${district.gu} ${district.label} — ${
                        storeLabelForRegion(district.region) ?? "기타 권역"
                      }`}
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
                      r={pinActive ? 11 : 8}
                      fill={palette.fill}
                      stroke="#fff"
                      strokeWidth={2.5}
                      animate={{ scale: pinActive ? 1.08 : 1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <text
                      x={pin.x}
                      y={pin.y - 16}
                      textAnchor="middle"
                      className="pointer-events-none fill-slate-900 text-[11px] font-black"
                    >
                      {pin.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          <AnimatePresence>
            {tooltip ? (
              <motion.div
                key={`${tooltip.gu}-${tooltip.dongLabel}`}
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="pointer-events-none absolute z-20 max-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-lg"
                style={{ left: tooltip.x, top: tooltip.y }}
              >
                <p className="text-sm font-black text-slate-900">{tooltip.gu}</p>
                <p className="text-xs font-semibold text-slate-600">{tooltip.dongLabel}</p>
                <p className="mt-1 text-sm font-bold text-blue-800">
                  담당: {storeLabelForRegion(tooltip.region) ?? "전화 상담 후 안내"}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <p className="mt-3 text-center text-xs font-medium leading-relaxed text-slate-500 sm:text-sm">
            {BUSAN_MAP_DISCLAIMER}
          </p>
          <p className="mt-1 text-center text-[10px] text-slate-400 sm:text-xs">
            {BUSAN_MAP_SOURCE_ATTRIBUTION}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {panelDistrict ? (
              <motion.div
                key={`${panelDistrict.gu}-${panelDistrict.dongLabel}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className={clsx(
                  "rounded-xl border p-5",
                  panelDistrict.region === "deokcheon"
                    ? "border-blue-200 bg-blue-50/60"
                    : panelDistrict.region === "hakjang"
                      ? "border-teal-200 bg-teal-50/60"
                      : "border-slate-200 bg-slate-50/90",
                )}
              >
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">선택한 구</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{panelDistrict.gu}</p>
                {panelDistrict.dongLabel !== panelDistrict.gu ? (
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    참고 동: {panelDistrict.dongLabel}
                  </p>
                ) : null}
                <p className="mt-3 text-sm font-bold text-slate-700">
                  담당 지점:{" "}
                  <span className="text-base font-black text-slate-900">
                    {storeLabelForRegion(panelDistrict.region) ?? "전화 상담 후 배정"}
                  </span>
                </p>
                {panelStore && panelDistrict.region !== "neutral" ? (
                  <>
                    <p className="mt-2 text-sm font-bold text-slate-600">
                      {BUSAN_REGION_DISPLAY[panelStore].regions}
                    </p>
                    <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
                      {BUSAN_REGION_DISPLAY[panelStore].blurb}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
                    해당 구는 직영점 권역 밖일 수 있습니다. 전화로 위치를 알려주시면 가까운 지점을
                    안내드립니다.
                  </p>
                )}
              </motion.div>
            ) : panelStore ? (
              <motion.div
                key={panelStore}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className={clsx(
                  "rounded-xl border p-5",
                  panelStore === "deokcheon"
                    ? "border-blue-200 bg-blue-50/50"
                    : "border-teal-200 bg-teal-50/50",
                )}
              >
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">추천 지점</p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {BUSAN_REGION_DISPLAY[panelStore].label}
                </p>
                <p className="mt-2 text-sm font-bold text-slate-700">
                  {BUSAN_REGION_DISPLAY[panelStore].regions}
                </p>
                <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
                  {BUSAN_REGION_DISPLAY[panelStore].blurb}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="unknown"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-5"
              >
                <p className="text-base font-black text-slate-800">권역을 선택해 주세요</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
                  지도에서 구를 클릭하거나 동네명을 검색하면 담당 지점과 권역 안내가 표시됩니다.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {(["deokcheon", "hakjang"] as const).map((id) => {
            const active = panelStore === id;
            const meta = BUSAN_REGION_DISPLAY[id];
            const palette = BUSAN_MAP_PALETTE[id];
            return (
              <motion.button
                key={id}
                type="button"
                onClick={() => {
                  onSelect(id);
                  setSelectedDistrict(null);
                }}
                className={clsx(
                  "rounded-xl border p-4 text-left transition-shadow",
                  active
                    ? id === "deokcheon"
                      ? "border-blue-300 bg-blue-50/90 shadow-md shadow-blue-100/60"
                      : "border-teal-300 bg-teal-50/90 shadow-md shadow-teal-100/60"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
                )}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.18 }}
              >
                <div className="flex items-center gap-2">
                  <Store className="size-5" style={{ color: palette.stroke }} aria-hidden />
                  <span className="text-base font-black text-slate-900">{meta.label}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-600">{meta.regions}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Truck className="size-3.5" aria-hidden />
                  출장·내방 권역 기준
                </p>
              </motion.button>
            );
          })}

          <p className="text-sm font-medium leading-relaxed text-slate-500">{BUSAN_REGION_FOOTNOTE}</p>
        </div>
      </div>
    </section>
  );
}
