"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExploreVehicleCard } from "@/components/platform/ExploreVehicleCard";
import { getSearchHref } from "@/lib/battery-search";
import {
  VEHICLES_BRAND_FILTERS,
  filterBrowseItems,
  getAllBrowseItems,
  getFeaturedBrowseItems,
  getShowcaseBrowseItems,
  REXTON_SHOWCASE_ITEM,
  type VehiclesBrandFilter,
} from "@/lib/vehicles-browse-data";
import { bm } from "@/lib/design-tokens";

const DESKTOP_SHOWCASE = 10;
const MOBILE_SHOWCASE = 8;

const KG_SEARCH_PICKS = [
  { label: "렉스턴 스포츠", query: "렉스턴 스포츠 배터리" },
  { label: "티볼리", query: "티볼리 배터리" },
] as const;

export function VehiclesBrowseClient() {
  const searchParams = useSearchParams();
  const registerMode = searchParams.get("register") === "1";
  const [brand, setBrand] = useState<VehiclesBrandFilter>("전체");
  const [showAllVehicles, setShowAllVehicles] = useState(registerMode);
  const [showcaseLimit, setShowcaseLimit] = useState(DESKTOP_SHOWCASE);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setShowcaseLimit(mq.matches ? MOBILE_SHOWCASE : DESKTOP_SHOWCASE);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const allItems = useMemo(() => getAllBrowseItems(), []);
  const filtered = useMemo(() => filterBrowseItems(allItems, brand), [allItems, brand]);

  const showcaseItems = useMemo(() => {
    if (showAllVehicles || registerMode) return [];
    if (brand === "전체") return getShowcaseBrowseItems(showcaseLimit);
    const featured = getFeaturedBrowseItems(brand);
    if (featured.length > 0) return featured.slice(0, showcaseLimit);
    if (brand === "KG/쌍용") {
      return [
        REXTON_SHOWCASE_ITEM,
        ...KG_SEARCH_PICKS.map((p) => ({
          key: p.query,
          vehicleId: "rexton-sports-search",
          title: p.label,
          href: getSearchHref(p.query),
          brandLabel: "쌍용",
        })),
      ].slice(0, showcaseLimit);
    }
    return filtered.slice(0, showcaseLimit);
  }, [brand, filtered, showcaseLimit, showAllVehicles, registerMode]);

  const listItems = showAllVehicles || registerMode ? filtered : [];
  const hiddenVehicleCount = Math.max(0, filtered.length - showcaseItems.length);
  const cardGridClass = registerMode
    ? "grid gap-4"
    : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  const handleBrandChange = (b: VehiclesBrandFilter) => {
    setBrand(b);
    if (!registerMode) setShowAllVehicles(false);
  };

  return (
    <div className="space-y-4">
      {registerMode ? (
        <section className="vehicle-register-banner">
          <h2 className="text-lg font-black text-slate-950 sm:text-xl">차량정보 등록</h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
            브랜드와 차종을 선택한 뒤 「내 차량으로 등록」을 누르면 마이페이지에 저장됩니다. 등록 후
            규격 보기로 배터리를 확인할 수 있습니다.
          </p>
          <Link href="/mypage" className={`${bm.btnSecondary} mt-3 inline-flex text-sm font-black`}>
            마이페이지에서 확인
          </Link>
        </section>
      ) : null}

      <section className={`${bm.card} p-4 sm:p-5`}>
        <p className="text-sm font-black uppercase tracking-wide text-blue-600">제조사</p>
        <h2 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">
          {registerMode ? "차종 검색" : "브랜드별로 내 차 찾기"}
        </h2>
        <p className="mt-1 text-sm font-semibold text-slate-600">
          현대·기아·제네시스·상용·EV·수입차를 골고루 확인할 수 있습니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {VEHICLES_BRAND_FILTERS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => handleBrandChange(b)}
              className={`${bm.filterChip} ${brand === b ? bm.filterChipOn : bm.filterChipOff}`}
            >
              {b}
            </button>
          ))}
        </div>
      </section>

      {!showAllVehicles && !registerMode ? (
        <section className={`${bm.card} p-4 sm:p-5`}>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-sm font-black text-blue-600">대표 차량</p>
              <h2 className="text-base font-black text-slate-950 sm:text-lg">
                {brand === "전체" ? "자주 찾는 차종" : `${brand} 대표 차종`}
              </h2>
              <p className="mt-0.5 text-sm font-semibold text-slate-500">
                기본 {showcaseItems.length}개 · 더 많은 차종은 전체 차종 보기
              </p>
            </div>
            <Link className="text-sm font-black text-blue-600 hover:underline" href="/search">
              통합검색 →
            </Link>
          </div>

          {showcaseItems.length > 0 ? (
            <div className={cardGridClass}>
              {showcaseItems.map((item) => (
                <ExploreVehicleCard
                  href={item.href}
                  key={item.key}
                  title={item.title}
                  vehicleId={item.vehicleId}
                  registerMode={registerMode}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm font-semibold text-slate-500">통합검색으로 차종을 찾아 주세요.</p>
          )}

          {filtered.length > showcaseItems.length ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-500">
                전체 {filtered.length}개 차종 중 {showcaseItems.length}개만 표시 중
              </p>
              <button
                type="button"
                onClick={() => setShowAllVehicles(true)}
                className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-700"
              >
                전체 차종 보기 (+{filtered.length - showcaseItems.length})
              </button>
            </div>
          ) : null}
        </section>
      ) : (
        <section className={`${bm.card} p-4 sm:p-5`}>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-slate-950 sm:text-lg">
                {registerMode ? `등록할 차종 (${filtered.length})` : `전체 차종 (${filtered.length})`}
              </h2>
              <p className="mt-0.5 text-sm font-semibold text-slate-500">
                연료·연식별 규격은 상세에서 확인하세요.
              </p>
            </div>
            {!registerMode ? (
              <button
                type="button"
                onClick={() => setShowAllVehicles(false)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                대표 차종만 보기
              </button>
            ) : null}
          </div>
          <div className={`mt-4 ${cardGridClass}`}>
            {listItems.map((item) => (
              <ExploreVehicleCard
                href={item.href}
                key={`all-${item.key}`}
                title={item.title}
                vehicleId={item.vehicleId}
                registerMode={registerMode}
              />
            ))}
          </div>
        </section>
      )}

      {brand === "전체" && !showAllVehicles && !registerMode && hiddenVehicleCount > 0 ? (
        <p className="text-center text-sm font-semibold text-slate-500">
          현대 세대별 안내는{" "}
          <Link className="font-black text-blue-600 hover:underline" href="/vehicles/hyundai">
            현대 차종 페이지
          </Link>
          에서 확인할 수 있습니다.
        </p>
      ) : null}
    </div>
  );
}
