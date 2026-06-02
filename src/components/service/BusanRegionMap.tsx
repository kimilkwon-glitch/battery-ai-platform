"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Store, Truck } from "lucide-react";
import clsx from "clsx";
import { geoCentroid, geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import {
  assignBusanGeoRegion,
  assignBusanGuRegion,
  BUSAN_GU_MAP_LABELS,
  guHasDongLevelExceptions,
  guLabel,
  guPanelCoverage,
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
  pinsForStores,
} from "@/lib/busan-map-palette";
import { BUSAN_REGION_DISPLAY, type BusanStoreId } from "@/lib/busan-store-matcher";
import { BUSAN_REGION_FOOTNOTE } from "@/lib/busan-service-hub-data";

const GEOJSON_URL = "/assets/maps/busan-hangjeongdong.geojson";

const FILL = {
  deokcheon: { rest: 0.7, hover: 0.88, active: 0.95, dim: 0.12 },
  hakjang: { rest: 0.68, hover: 0.86, active: 0.93, dim: 0.12 },
  neutral: { rest: 0.38, hover: 0.52, active: 0.58, dim: 0.1 },
} as const;

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

function pathStyle(
  dong: DongPath,
  gu: GuUnit,
  opts: {
    activeStore: BusanStoreId | null;
    hoveredGu: string | null;
    selectedGu: string | null;
    searchHighlightGu: boolean;
    searchDim: boolean;
    guHover: boolean;
  },
): { fillOpacity: number; stroke: string; strokeWidth: number } {
  const { region } = dong;
  const palette =
    region === "neutral" ? BUSAN_MAP_PALETTE.neutral : BUSAN_MAP_PALETTE[region];
  const levels = FILL[region];
  const guActive =
    opts.hoveredGu === gu.gu || opts.selectedGu === gu.gu || opts.searchHighlightGu;

  let fillOpacity: number = levels.rest;
  if (opts.searchDim) fillOpacity = levels.dim;
  else if (guActive || opts.guHover) fillOpacity = levels.active;
  else if (opts.activeStore && region !== "neutral" && opts.activeStore !== region) {
    fillOpacity = levels.dim + 0.06;
  }

  const emphasized = guActive || opts.guHover;
  const stroke = emphasized
    ? "#ffffff"
    : region === "neutral"
      ? palette.stroke
      : palette.fill;

  return { fillOpacity, stroke, strokeWidth: 1.1 };
}

const PANEL_SHELL =
  "min-h-[272px] rounded-xl border p-5 transition-[box-shadow,background-color,border-color] duration-200";

function panelShellClass(region: BusanGeoRegion | null, dashed = false): string {
  if (dashed) return clsx(PANEL_SHELL, "border-dashed border-slate-200 bg-slate-50/80");
  if (region === "deokcheon") return clsx(PANEL_SHELL, "border-blue-200 bg-blue-50/60");
  if (region === "hakjang") return clsx(PANEL_SHELL, "border-teal-200 bg-teal-50/60");
  return clsx(PANEL_SHELL, "border-slate-200 bg-slate-50/90");
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
  const [hoveredGu, setHoveredGu] = useState<string | null>(null);
  const [selectedGu, setSelectedGu] = useState<SelectedGu | null>(null);
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

  const { guUnits, pins } = useMemo(() => {
    if (!collection) {
      return { guUnits: [] as GuUnit[], pins: pinsForStores({}) };
    }

    const projection = geoMercator();
    const pathGen = geoPath(projection);
    projection.fitSize([BUSAN_MAP_WIDTH, BUSAN_MAP_HEIGHT], collection);

    const dongs: DongPath[] = [];
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

      const dong: DongPath = {
        adm_cd: props.adm_cd,
        adm_nm: props.adm_nm,
        gu: guLabel(props),
        region,
        pathD,
        label: regionLabel(props.adm_nm),
      };
      dongs.push(dong);

      if (region === "deokcheon" || region === "hakjang") {
        const c = pathGen.centroid(feature as Feature<Geometry, BusanHangjeongProps>);
        centroidSum[region].x += c[0];
        centroidSum[region].y += c[1];
        centroidSum[region].n += 1;
      }
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

    return { guUnits, pins: pinsForStores(storeCentroids) };
  }, [collection]);

  const knownGu = useMemo(() => guUnits.map((g) => g.gu), [guUnits]);
  const searchResolved = useMemo(
    () => (searchQuery?.trim() ? resolveGuFromSearch(searchQuery, knownGu) : null),
    [searchQuery, knownGu],
  );

  const searchHighlightGu = searchResolved?.gu ?? null;
  const hasSearch = Boolean(searchQuery?.trim());

  /** 클릭·선택만 반영 (hover는 패널 미리보기만, 레이아웃·핀 점프 방지) */
  const displayStore = useMemo(() => {
    if (selectedGu?.region === "deokcheon" || selectedGu?.region === "hakjang") {
      return selectedGu.region;
    }
    if (activeStore) return activeStore;
    return null;
  }, [selectedGu, activeStore]);

  const panelPreview = useMemo((): SelectedGu | null => {
    if (selectedGu) return selectedGu;
    if (!hoveredGu) return null;
    const g = guUnits.find((u) => u.gu === hoveredGu);
    if (!g) return null;
    return {
      gu: g.gu,
      region: g.region,
      matchedDong: searchResolved?.matchedDong,
    };
  }, [selectedGu, hoveredGu, guUnits, searchResolved?.matchedDong]);

  const showTooltip = (gu: GuUnit, clientX: number, clientY: number, matchedDong?: string) => {
    const el = mapCanvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTooltip({
      x: Math.min(clientX - rect.left + 14, rect.width - 200),
      y: Math.max(clientY - rect.top - 12, 8),
      gu: gu.gu,
      region: gu.region,
      matchedDong,
    });
  };

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
    setSelectedGu({
      gu: gu.gu,
      region: gu.region,
      matchedDong: searchResolved?.matchedDong ?? matchedDong,
    });
    if (gu.region === "deokcheon" || gu.region === "hakjang") {
      onSelect(gu.region);
    }
  };

  const panelIsHoverOnly = Boolean(hoveredGu && !selectedGu);

  return (
    <section
      className="busan-region-map rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-6"
      id="store-map"
    >
      <div>
        <h3 className="text-xl font-black text-slate-950 sm:text-2xl">부산 권역 지도</h3>
        <p className="mt-2 text-base font-semibold text-slate-600">
          구 단위로 담당 지점을 확인할 수 있습니다. 구에 마우스를 올리거나 클릭하고, 동네명 검색으로
          해당 구를 강조할 수 있습니다.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,300px)] xl:items-start">
        <div
          ref={mapCanvasRef}
          className="busan-map-canvas relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-50/80 p-3 sm:p-4"
        >
          <div
            className="pointer-events-none absolute right-3 top-3 z-10 min-w-[148px] rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-lg ring-1 ring-slate-100/80"
            aria-label="지도 범례"
          >
            <p className="text-sm font-black text-slate-700">권역 범례</p>
            <ul className="mt-3 space-y-2.5 text-base font-bold text-slate-900">
              <li className="flex items-center gap-3">
                <span className="size-4 shrink-0 rounded-sm bg-blue-500 shadow-sm" aria-hidden />
                덕천점 권역
              </li>
              <li className="flex items-center gap-3">
                <span className="size-4 shrink-0 rounded-sm bg-teal-600 shadow-sm" aria-hidden />
                학장점 권역
              </li>
              <li className="flex items-center gap-3">
                <span className="size-4 shrink-0 rounded-sm bg-slate-300 shadow-sm" aria-hidden />
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
              className="busan-map-svg mx-auto h-auto w-full max-w-[520px] touch-manipulation"
              role="img"
              aria-label="부산 구별 권역 안내 지도"
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
                    className="busan-map-gu cursor-pointer"
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
                      const palette =
                        dong.region === "neutral"
                          ? BUSAN_MAP_PALETTE.neutral
                          : BUSAN_MAP_PALETTE[dong.region];
                      const style = pathStyle(dong, gu, {
                        activeStore,
                        hoveredGu,
                        selectedGu: selectedGu?.gu ?? null,
                        searchHighlightGu: searchHit,
                        searchDim,
                        guHover,
                      });

                      return (
                        <path
                          key={dong.adm_cd}
                          d={dong.pathD}
                          fill={palette.fill}
                          fillOpacity={style.fillOpacity}
                          stroke={style.stroke}
                          strokeWidth={style.strokeWidth}
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                          className="pointer-events-none"
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
                          guEmphasis ? "fill-slate-900 text-[13px]" : "fill-slate-800/90 text-[11px]",
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

              {(["deokcheon", "hakjang"] as const).map((storeId) => {
                const pin = pins[storeId];
                const palette = BUSAN_MAP_PALETTE[storeId];
                const pinActive = displayStore === storeId;
                return (
                  <g
                    key={storeId}
                    className="cursor-pointer"
                    onClick={() => {
                      onSelect(storeId);
                      setSelectedGu(null);
                    }}
                    role="presentation"
                  >
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r={10}
                      fill={palette.fill}
                      fillOpacity={pinActive ? 1 : 0.85}
                      stroke="#fff"
                      strokeWidth={2.5}
                    />
                    <text
                      x={pin.x}
                      y={pin.y - 18}
                      textAnchor="middle"
                      className="pointer-events-none fill-slate-900 text-[12px] font-black"
                      style={{ stroke: "#fff", strokeWidth: 3, paintOrder: "stroke fill" }}
                    >
                      {pin.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {tooltip ? (
            <div
              className="pointer-events-none absolute z-20 max-w-[240px] rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <p className="text-base font-black text-slate-900">{tooltip.gu}</p>
              <p className="mt-1 text-sm font-bold text-blue-800">
                담당: {storeLabelForRegion(tooltip.region) ?? "전화 상담 후 안내"}
              </p>
              <p className="mt-1.5 text-sm font-medium leading-snug text-slate-600">
                {guTooltipHint(tooltip.gu, tooltip.region)}
              </p>
              {tooltip.matchedDong ? (
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  검색: {tooltip.matchedDong}
                </p>
              ) : null}
            </div>
          ) : null}

          <p className="mt-3 text-center text-xs font-medium leading-relaxed text-slate-500 sm:text-sm">
            {BUSAN_MAP_DISCLAIMER}
          </p>
          <p className="mt-1 text-center text-[10px] text-slate-400 sm:text-xs">
            {BUSAN_MAP_SOURCE_ATTRIBUTION}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div
            className={panelShellClass(
              panelPreview?.region ?? (displayStore && !panelPreview ? displayStore : null),
              !panelPreview && !displayStore,
            )}
            aria-live="polite"
          >
            {panelPreview ? (
              <>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  {panelIsHoverOnly ? "미리보기" : "선택한 구"}
                </p>
                <p className="mt-1 min-h-[2rem] text-2xl font-black text-slate-900">{panelPreview.gu}</p>
                <p className="mt-1 min-h-[1.25rem] text-sm font-semibold text-slate-600">
                  {panelPreview.matchedDong ? `검색 참고: ${panelPreview.matchedDong}` : "\u00a0"}
                </p>
                <div className="mt-3 min-h-[9.5rem] space-y-2">
                  <p className="text-base font-bold text-slate-800">
                    담당 지점:{" "}
                    <span className="text-lg font-black text-slate-900">
                      {storeLabelForRegion(panelPreview.region) ?? "전화 상담 후 배정"}
                    </span>
                  </p>
                  <p className="text-sm font-bold leading-relaxed text-slate-700">
                    {guPanelCoverage(panelPreview.gu, panelPreview.region)}
                  </p>
                  {guHasDongLevelExceptions(panelPreview.gu) ? (
                    <p className="text-sm font-medium text-amber-800/90">
                      강서구 내 대저1동·명지 등은 동별 담당이 다를 수 있습니다. 동네명 검색 또는 전화로
                      확인해 주세요.
                    </p>
                  ) : (
                    <p className="min-h-[2.5rem] text-sm font-medium leading-relaxed text-slate-600">
                      {panelPreview.region === "deokcheon" || panelPreview.region === "hakjang"
                        ? BUSAN_REGION_DISPLAY[panelPreview.region].blurb
                        : "해당 구는 직영점 권역 밖일 수 있습니다. 전화로 위치를 알려주시면 가까운 지점을 안내드립니다."}
                    </p>
                  )}
                </div>
              </>
            ) : displayStore ? (
              <>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">추천 지점</p>
                <p className="mt-1 min-h-[2rem] text-2xl font-black text-slate-900">
                  {BUSAN_REGION_DISPLAY[displayStore].label}
                </p>
                <p className="mt-1 min-h-[1.25rem] text-sm font-semibold text-slate-600">&nbsp;</p>
                <div className="mt-3 min-h-[9.5rem] space-y-2">
                  <p className="text-sm font-bold text-slate-700">
                    {BUSAN_REGION_DISPLAY[displayStore].regions}
                  </p>
                  <p className="text-sm font-medium leading-relaxed text-slate-600">
                    {BUSAN_REGION_DISPLAY[displayStore].blurb}
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-base font-black text-slate-800">권역을 선택해 주세요</p>
                <p className="mt-2 min-h-[2rem] text-sm font-semibold leading-relaxed text-slate-600">
                  지도에서 구를 클릭하거나 동네명을 검색하면 담당 지점과 권역 안내가 표시됩니다.
                </p>
                <div className="mt-3 min-h-[9.5rem]" aria-hidden />
              </>
            )}
          </div>

          {(["deokcheon", "hakjang"] as const).map((id) => {
            const active = displayStore === id;
            const meta = BUSAN_REGION_DISPLAY[id];
            const palette = BUSAN_MAP_PALETTE[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onSelect(id);
                  setSelectedGu(null);
                }}
                className={clsx(
                  "rounded-xl border p-4 text-left transition-[box-shadow,background-color,border-color]",
                  active
                    ? id === "deokcheon"
                      ? "border-blue-300 bg-blue-50/90 shadow-md shadow-blue-100/60"
                      : "border-teal-300 bg-teal-50/90 shadow-md shadow-teal-100/60"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
                )}
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
              </button>
            );
          })}

          <p className="text-sm font-medium leading-relaxed text-slate-500">{BUSAN_REGION_FOOTNOTE}</p>
        </div>
      </div>
    </section>
  );
}
