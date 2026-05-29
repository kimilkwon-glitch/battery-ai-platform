"use client";

import { useMemo, useState } from "react";
import { HomeSpecExploreCard } from "@/components/home/HomeSpecExploreCard";
import { bm } from "@/lib/design-tokens";
import {
  HOME_CATALOG_TYPE_FILTERS,
  filterCatalogProducts,
  getCurrentLineup,
  type HomeCatalogBrandId,
  type HomeProductTypeFilter,
} from "@/lib/home-main-catalog-data";

const BRAND_TABS: { id: HomeCatalogBrandId; label: string }[] = [
  { id: "rocket", label: "로케트" },
  { id: "solite", label: "쏠라이트" },
];

export function HomeCatalogSection() {
  const [brand, setBrand] = useState<HomeCatalogBrandId>("rocket");
  const [typeFilter, setTypeFilter] = useState<HomeProductTypeFilter>("전체");

  const products = useMemo(
    () => filterCatalogProducts(getCurrentLineup(brand), typeFilter),
    [brand, typeFilter],
  );

  return (
    <section className="mt-14 sm:mt-16" data-home-section="catalog" id="home-catalog">
      <div className="text-center sm:text-left">
        <h2 className={`${bm.sectionTitle} text-slate-900`}>배터리 라인업</h2>
        <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
          대표 규격을 브랜드별로 확인하세요. 자세한 제원과 비교는 검색·상세 페이지에서 볼 수 있습니다.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
        {BRAND_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={
              brand === tab.id
                ? "min-w-[7rem] rounded-full bg-[var(--bm-navy)] px-5 py-2.5 text-sm font-black text-white shadow-md ring-2 ring-blue-200/60"
                : `${bm.btnSecondary} min-w-[7rem] rounded-full px-5 py-2.5 text-sm font-bold`
            }
            onClick={() => setBrand(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:justify-start">
        {HOME_CATALOG_TYPE_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={
              typeFilter === f
                ? "rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-black text-white"
                : "rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-200"
            }
            onClick={() => setTypeFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div
        className="mt-5 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-home-lineup-brand={brand}
      >
        {products.map((item) => (
          <HomeSpecExploreCard key={`${brand}-${item.code}`} brand={brand} product={item} />
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-6 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
          선택한 타입에 해당하는 대표 규격이 없습니다. 필터를 바꿔 보세요.
        </p>
      ) : null}
    </section>
  );
}
