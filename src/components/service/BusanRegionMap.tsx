"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import {
  assignBusanGeoRegion,
  assignBusanGuRegion,
  BUSAN_GU_MAP_LABELS,
  guHasDongLevelExceptions,
  guLabel,
  guTooltipHint,
  regionLabel,
  resolveGuFromSearch,
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
} from "@/lib/busan-map-palette";
import type { BusanStoreId } from "@/lib/busan-store-matcher";

const GEOJSON_URL = "/assets/maps/busan-hangjeongdong.geojson";

const GU_BOUNDARY = "#f8fafc";

type DongPath = {
  adm_cd: string;
  adm_nm: string;
  gu: string;
  region: BusanGeoRegion;
  pathD: string;
  label: string;
};

type GuUnit = {
  gu: string;
  region: BusanGeoRegion;
  dongs: DongPath[];
  labelX: number;
  labelY: number;
  showLabel: boolean;
};

type SelectedGu = {
  gu: string;
  region: BusanGeoRegion;
  matchedDong?: string;
};

type MapTooltip = {
  x: number;
  y: number;
  gu: string;
  region: BusanGeoRegion;
  matchedDong?: string;
};

type ClickPopover = {
  gu: string;
  region: BusanGeoRegion;
  xPct: number;
  yPct: number;
  matchedDong?: string;
};

/** hover/click 시 stroke 두께를 바꾸지 않음 — 인접 path 경계가 흔들리지 않게 */
const PATH_STROKE = 1.5;

function regionLine(gu: string, region: BusanGeoRegion): string {
  const store = storeLabelForRegion(region);
  if (store) return `${store} 담당`;
  if (guHasDongLevelExceptions(gu)) {
    return "대저1동·대저2동 — 상담 시 지점 안내";
  }
  return "전화 상담 후 안내";
}

function normalizeSearch(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, "");
}

function dongMatchesSearch(dong: DongPath, searchQuery: string | null): boolean {
  if (!searchQuery) return false;
  const q = normalizeSearch(searchQuery);
  if (!q) return false;
  const gu = dong.gu.toLowerCase();
  const label = dong.label.toLowerCase();
  const full = dong.adm_nm.toLowerCase().replace(/\s+/g, "");
  return gu.includes(q) || label.includes(q) || full.includes(q);
}

function guSearchHit(gu: GuUnit, searchQuery: string | null, resolvedGu: string | null): boolean {
  if (resolvedGu && resolvedGu === gu.gu) return true;
  if (!searchQuery?.trim()) return false;
  return gu.dongs.some((d) => dongMatchesSearch(d, searchQuery));
}

/** 동별 색상 — 강서구 등은 행정동 단위로 덕천/학장 구분 */
function pathStyle(
  region: BusanGeoRegion,
  gu: GuUnit,
  opts: {
    activeStore: BusanStoreId | null;
    hoveredGu: string | null;
    selectedGu: string | null;
    searchHighlightGu: boolean;
    searchDim: boolean;
  },
): {
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeOpacity: number;
} {
  const palette =
    region === "neutral" ? BUSAN_MAP_PALETTE.neutral : BUSAN_MAP_PALETTE[region];
  const guActive =
    opts.hoveredGu === gu.gu ||
    opts.selectedGu === gu.gu ||
    opts.searchHighlightGu;

  let fill: string = palette.fill;
  let fillOpacity = 0.88;
  if (opts.searchDim) fillOpacity = 0.14;
  else if (guActive) {
    fill = palette.fillHover;
    fillOpacity = 0.98;
  } else if (opts.activeStore && region !== "neutral" && opts.activeStore !== region) {
    fillOpacity = 0.42;
  }

  const emphasized = guActive;
  return {
    fill,
    fillOpacity,
    stroke: emphasized ? "#ffffff" : GU_BOUNDARY,
    strokeWidth: PATH_STROKE,
    strokeOpacity: emphasized ? 1 : 0.9,
  };
}

function MapLegend() {
  return (
    <aside
      className="busan-map-legend shrink-0 rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 sm:py-4 lg:w-[11.5rem] lg:bg-white"
      aria-label="지도 범례"
    >
      <p className="text-sm font-black text-slate-800 sm:text-base">권역 범례</p>
      <ul className="mt-2 space-y-2 text-sm font-bold text-slate-900 sm:mt-3 sm:space-y-2.5 sm:text-base">
        <li className="flex items-center gap-2.5 sm:gap-3">
          <span
            className="size-4 shrink-0 rounded-sm bg-blue-400 shadow-sm ring-1 ring-blue-600/30 sm:size-5"
            aria-hidden
          />
          덕천점 권역
        </li>
        <li className="flex items-center gap-2.5 sm:gap-3">
          <span
            className="size-4 shrink-0 rounded-sm bg-green-400 shadow-sm ring-1 ring-green-700/30 sm:size-5"
            aria-hidden
          />
          학장점 권역
        </li>
        <li className="flex items-center gap-2.5 sm:gap-3">
          <span className="size-4 shrink-0 rounded-sm bg-slate-300 shadow-sm sm:size-5" aria-hidden />
          기타 · 상담 후 안내
        </li>
      </ul>
      <p className="mt-2 text-[10px] font-medium leading-snug text-slate-500 sm:text-xs">
        강서구는 대저1동·대저2동 등 동별 담당이 다릅니다.
      </p>
    </aside>
  );
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
  const tooltipRafRef = useRef<number | null>(null);
  const pendingTooltipRef = useRef<MapTooltip | null>(null);
  const [collection, setCollection] = useState<FeatureCollection<Geometry, BusanHangjeongProps> | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hoveredGu, setHoveredGu] = useState<string | null>(null);
  const [selectedGu, setSelectedGu] = useState<SelectedGu | null>(null);
  const [tooltip, setTooltip] = useState<MapTooltip | null>(null);
  const [clickPopover, setClickPopover] = useState<ClickPopover | null>(null);

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

  const guUnits = useMemo(() => {
    if (!collection) {
      return [] as GuUnit[];
    }

    const projection = geoMercator();
    const pathGen = geoPath(projection);
    projection.fitSize([BUSAN_MAP_WIDTH, BUSAN_MAP_HEIGHT], collection);

    const dongs: DongPath[] = [];

    for (const feature of collection.features) {
      const props = feature.properties;
      if (!props?.adm_cd) continue;
      const region = assignBusanGeoRegion(props);
      const pathD = pathGen(feature as Feature<Geometry, BusanHangjeongProps>);
      if (!pathD) continue;

      const dong: DongPath = {
        adm_cd: props.adm_cd,
        adm_nm: props.adm_nm,
        gu: guLabel(props),
        region,
        pathD,
        label: regionLabel(props.adm_nm),
      };
      dongs.push(dong);
    }

    const byGu = new Map<string, DongPath[]>();
    for (const d of dongs) {
      const list = byGu.get(d.gu) ?? [];
      list.push(d);
      byGu.set(d.gu, list);
    }

    const guUnits: GuUnit[] = [];
    for (const [gu, guDongs] of byGu) {
      let sx = 0;
      let sy = 0;
      let sn = 0;
      for (const d of guDongs) {
        const feat = collection.features.find((f) => f.properties?.adm_cd === d.adm_cd);
        if (!feat) continue;
        const c = pathGen.centroid(feat as Feature<Geometry, BusanHangjeongProps>);
        sx += c[0];
        sy += c[1];
        sn += 1;
      }
      guUnits.push({
        gu,
        region: assignBusanGuRegion(gu),
        dongs: guDongs,
        labelX: sn ? sx / sn : 0,
        labelY: sn ? sy / sn : 0,
        showLabel: BUSAN_GU_MAP_LABELS.has(gu),
      });
    }

    guUnits.sort((a, b) => a.gu.localeCompare(b.gu, "ko"));

    return guUnits;
  }, [collection]);

  const knownGu = useMemo(() => guUnits.map((g) => g.gu), [guUnits]);
  const searchResolved = useMemo(
    () => (searchQuery?.trim() ? resolveGuFromSearch(searchQuery, knownGu) : null),
    [searchQuery, knownGu],
  );

  const searchHighlightGu = searchResolved?.gu ?? null;
  const hasSearch = Boolean(searchQuery?.trim());

  const showTooltip = (gu: GuUnit, clientX: number, clientY: number, matchedDong?: string) => {
    if (clickPopover?.gu === gu.gu) return;
    const el = mapCanvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    pendingTooltipRef.current = {
      x: Math.min(clientX - rect.left + 14, rect.width - 200),
      y: Math.max(clientY - rect.top - 12, 8),
      gu: gu.gu,
      region: gu.region,
      matchedDong,
    };
    if (tooltipRafRef.current != null) return;
    tooltipRafRef.current = requestAnimationFrame(() => {
      tooltipRafRef.current = null;
      if (pendingTooltipRef.current) setTooltip(pendingTooltipRef.current);
    });
  };

  useEffect(() => {
    return () => {
      if (tooltipRafRef.current != null) cancelAnimationFrame(tooltipRafRef.current);
    };
  }, []);

  const handleGuEnter = (gu: GuUnit, clientX: number, clientY: number) => {
    setHoveredGu(gu.gu);
    showTooltip(gu, clientX, clientY, searchResolved?.matchedDong);
    if (gu.region === "deokcheon" || gu.region === "hakjang") {
      onHoverStore?.(gu.region);
    } else {
      onHoverStore?.(null);
    }
  };

  const handleGuLeave = () => {
    setHoveredGu(null);
    setTooltip(null);
    onHoverStore?.(null);
  };

  const handleGuClick = (gu: GuUnit) => {
    const matchedDong = gu.dongs.find((d) => dongMatchesSearch(d, searchQuery ?? null))?.label;
    const selection: SelectedGu = {
      gu: gu.gu,
      region: gu.region,
      matchedDong: searchResolved?.matchedDong ?? matchedDong,
    };
    setSelectedGu(selection);
    setTooltip(null);
    setClickPopover({
      gu: gu.gu,
      region: gu.region,
      xPct: (gu.labelX / BUSAN_MAP_WIDTH) * 100,
      yPct: (gu.labelY / BUSAN_MAP_HEIGHT) * 100,
      matchedDong: selection.matchedDong,
    });
    if (gu.region === "deokcheon" || gu.region === "hakjang") {
      onSelect(gu.region);
    }
  };

  return (
    <section
      className="busan-region-map rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-6"
      id="store-map"
    >
      <div>
        <h3 className="text-xl font-black text-slate-950 sm:text-2xl">부산 권역 지도</h3>
        <p className="mt-2 text-base font-semibold text-slate-600">
          구에 마우스를 올리거나 클릭하면 담당 지점이 표시됩니다. 아래 매장 카드가 함께 강조됩니다.
          동네명 검색으로 해당 구를 찾을 수 있습니다.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
        <div
          ref={mapCanvasRef}
          className="busan-map-canvas relative h-[440px] min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-50/80 sm:h-[500px] lg:h-[560px]"
        >
          {loadError ? (
            <p className="py-16 text-center text-sm font-semibold text-red-600">{loadError}</p>
          ) : !collection ? (
            <div
              className="flex h-full min-h-[360px] animate-pulse items-center justify-center rounded-xl bg-slate-100/80 text-base font-bold text-slate-400"
              aria-busy
            >
              행정동 지도 불러오는 중…
            </div>
          ) : (
            <div className="busan-map-svg-stage absolute inset-3 sm:inset-4">
              <svg
                viewBox={BUSAN_MAP_VIEWBOX}
                className="busan-map-svg block h-full w-full max-w-none touch-manipulation"
                role="img"
                aria-label="부산 구별 권역 안내 지도"
                preserveAspectRatio="xMidYMid meet"
              >
              {guUnits.map((gu) => {
                const guHover = hoveredGu === gu.gu;
                const guSelected = selectedGu?.gu === gu.gu;
                const searchHit = guSearchHit(gu, searchQuery ?? null, searchHighlightGu);
                const searchDim = hasSearch && !searchHit;
                const guEmphasis = guHover || guSelected || searchHit;

                return (
                  <g
                    key={gu.gu}
                    className={clsx(
                      "busan-map-gu cursor-pointer",
                      guEmphasis && "busan-map-gu--active",
                    )}
                    onMouseEnter={(e) => handleGuEnter(gu, e.clientX, e.clientY)}
                    onMouseMove={(e) => showTooltip(gu, e.clientX, e.clientY, searchResolved?.matchedDong)}
                    onMouseLeave={handleGuLeave}
                    onClick={() => handleGuClick(gu)}
                    onFocus={(e) => {
                      const rect = (e.currentTarget as SVGGElement).getBoundingClientRect();
                      handleGuEnter(gu, rect.left + rect.width / 2, rect.top + rect.height / 2);
                    }}
                    onBlur={handleGuLeave}
                    tabIndex={0}
                    role="button"
                    aria-label={`${gu.gu} — ${storeLabelForRegion(gu.region) ?? "상담 후 안내"}`}
                  >
                    {gu.dongs.map((dong) => {
                      const style = pathStyle(dong.region, gu, {
                        activeStore,
                        hoveredGu,
                        selectedGu: selectedGu?.gu ?? null,
                        searchHighlightGu: searchHit,
                        searchDim,
                      });

                      return (
                        <path
                          key={dong.adm_cd}
                          d={dong.pathD}
                          fill={style.fill}
                          fillOpacity={style.fillOpacity}
                          stroke={style.stroke}
                          strokeWidth={style.strokeWidth}
                          strokeOpacity={style.strokeOpacity}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    })}

                    {gu.showLabel ? (
                      <text
                        x={gu.labelX}
                        y={gu.labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={clsx(
                          "pointer-events-none select-none font-black",
                          gu.gu.length > 4
                            ? guEmphasis
                              ? "fill-slate-900 text-[10px]"
                              : "fill-slate-800/90 text-[9px]"
                            : guEmphasis
                              ? "fill-slate-900 text-[13px]"
                              : "fill-slate-800/90 text-[11px]",
                        )}
                        style={{
                          paintOrder: "stroke fill",
                          stroke: "#fff",
                          strokeWidth: 3,
                        }}
                      >
                        {gu.gu}
                      </text>
                    ) : null}
                  </g>
                );
              })}
              </svg>
            </div>
          )}

          {tooltip ? (
            <div
              className="busan-map-hover-tip pointer-events-none absolute z-20 max-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg"
              style={{ transform: `translate(${tooltip.x}px, ${tooltip.y}px)` }}
            >
              <p className="text-sm font-black text-slate-900">{tooltip.gu}</p>
              <p
                className={clsx(
                  "mt-0.5 text-xs font-bold",
                  tooltip.region === "deokcheon"
                    ? "text-blue-700"
                    : tooltip.region === "hakjang"
                      ? "text-green-700"
                      : "text-slate-600",
                )}
              >
                {regionLine(tooltip.gu, tooltip.region)}
              </p>
            </div>
          ) : null}

          {clickPopover ? (
            <div
              className="busan-map-click-popover pointer-events-none absolute z-30 max-w-[min(220px,42vw)] rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg"
              style={{
                left: `${clickPopover.xPct}%`,
                top: `${clickPopover.yPct}%`,
                transform: "translate(-50%, calc(-100% - 12px))",
              }}
              role="status"
              aria-live="polite"
            >
              <p className="text-sm font-black text-slate-900">{clickPopover.gu}</p>
              <p
                className={clsx(
                  "mt-0.5 text-xs font-bold",
                  clickPopover.region === "deokcheon"
                    ? "text-blue-700"
                    : clickPopover.region === "hakjang"
                      ? "text-green-700"
                      : "text-slate-600",
                )}
              >
                {regionLine(clickPopover.gu, clickPopover.region)}
              </p>
              {guHasDongLevelExceptions(clickPopover.gu) ? (
                <p className="mt-1 text-[10px] font-medium leading-snug text-amber-800">
                  {guTooltipHint(clickPopover.gu, clickPopover.region)}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <MapLegend />
      </div>

      <div className="mt-4">
        <p
          className="busan-map-selection-bar mt-4 min-h-[5.25rem] rounded-xl border border-slate-100 bg-slate-50/90 px-4 py-3 text-sm font-semibold leading-relaxed text-slate-700"
          aria-live="polite"
        >
          {selectedGu ? (
            <>
              <span className="font-black text-slate-900">{selectedGu.gu}</span>
              {" · "}
              담당:{" "}
              <span
                className={clsx(
                  "font-black",
                  selectedGu.region === "deokcheon"
                    ? "text-blue-700"
                    : selectedGu.region === "hakjang"
                      ? "text-green-700"
                      : "text-slate-800",
                )}
              >
                {storeLabelForRegion(selectedGu.region) ?? "전화 상담 후 안내"}
              </span>
              {selectedGu.matchedDong ? (
                <span className="text-slate-600"> ({selectedGu.matchedDong} 검색)</span>
              ) : null}
              {guHasDongLevelExceptions(selectedGu.gu) ? (
                <span className="mt-1 block text-xs font-medium text-amber-800">
                  {guTooltipHint(selectedGu.gu, selectedGu.region)}
                </span>
              ) : null}
            </>
          ) : (
            "지도에서 구를 선택하면 아래 덕천점·학장점 카드가 강조됩니다."
          )}
        </p>

        <p className="mt-3 text-center text-xs font-medium leading-relaxed text-slate-500 sm:text-sm">
          {BUSAN_MAP_DISCLAIMER}
        </p>
        <p className="mt-1 text-center text-[10px] text-slate-400 sm:text-xs">
          {BUSAN_MAP_SOURCE_ATTRIBUTION}
        </p>
      </div>
    </section>
  );
}
