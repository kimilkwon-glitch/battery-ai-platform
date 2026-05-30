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

const LINEUP_INITIAL_VISIBLE = 9;

export function HomeCatalogSection() {
  const [expanded, setExpanded] = useState(false);
  const [showAllLineup, setShowAllLineup] = useState(false);
  const [brand, setBrand] = useState<HomeCatalogBrandId>("rocket");
  const [typeFilter, setTypeFilter] = useState<HomeProductTypeFilter>("전체");

  const products = useMemo(
    () => filterCatalogProducts(getCurrentLineup(brand), typeFilter),
    [brand, typeFilter],
  );

  const visibleProducts = useMemo(
    () => (showAllLineup ? products : products.slice(0, LINEUP_INITIAL_VISIBLE)),
    [products, showAllLineup],
  );

  return (
    <section
      className="home-catalog-section mt-14 sm:mt-16"
      data-home-section="catalog"
      data-home-catalog-expanded={expanded ? "true" : "false"}
      id="home-catalog"
    >
      <div className="home-catalog-header rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-5 sm:px-5 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className={`${bm.sectionTitle} text-slate-900`}>배터리 라인업</h2>
              <span className="home-catalog-label rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
                Lineup
              </span>
            </div>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
              로케트·쏠라이트 대표 규격을 한눈에 확인할 수 있습니다.
            </p>
          </div>

          <button
            type="button"
            className="home-catalog-toggle mx-auto shrink-0 sm:mx-0"
            aria-expanded={expanded}
            aria-controls="home-catalog-panel"
            onClick={() => setExpanded((v) => !v)}
          >
            <span>{expanded ? "라인업 접기" : "라인업 펼쳐보기"}</span>
            <span className="home-catalog-toggle__chevron" aria-hidden>
              {expanded ? "▲" : "▼"}
            </span>
          </button>
        </div>
      </div>

      <div
        className={`home-catalog-panel ${expanded ? "home-catalog-panel--open" : ""}`}
        id="home-catalog-panel"
        aria-hidden={!expanded}
        inert={!expanded || undefined}
      >
        <div className="home-catalog-panel__inner">
          <div className="home-catalog-panel__content pt-5">
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
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
              className="home-catalog-grid mt-5 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3"
              data-home-lineup-brand={brand}
            >
              {visibleProducts.map((item) => (
                <HomeSpecExploreCard key={`${brand}-${item.id}`} brand={brand} product={item} />
              ))}
            </div>

            {products.length > LINEUP_INITIAL_VISIBLE && !showAllLineup ? (
              <button
                type="button"
                className="mx-auto mt-4 block rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-black text-slate-700 shadow-sm hover:border-slate-300"
                onClick={() => setShowAllLineup(true)}
              >
                대표 규격 더 보기 ({products.length - LINEUP_INITIAL_VISIBLE}개)
              </button>
            ) : null}

            {products.length === 0 ? (
              <p className="mt-6 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                선택한 타입에 해당하는 대표 규격이 없습니다. 필터를 바꿔 보세요.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
