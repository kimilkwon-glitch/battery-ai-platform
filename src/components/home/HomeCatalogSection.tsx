"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";
import { HomeSpecExploreCard } from "@/components/home/HomeSpecExploreCard";
import { bm } from "@/lib/design-tokens";
import Link from "next/link";
import {
  HOME_CATALOG_TYPE_FILTERS,
  filterCatalogProducts,
  getCurrentLineup,
  sortLineupWithPinned,
  type HomeCatalogBrandId,
  type HomeProductTypeFilter,
} from "@/lib/home-main-catalog-data";

const BRAND_TABS: { id: HomeCatalogBrandId; label: string }[] = [
  { id: "rocket", label: "로케트" },
  { id: "solite", label: "쏠라이트" },
];

const LINEUP_INITIAL_VISIBLE = 9;

export function HomeCatalogSection() {
  const [expanded, setExpanded] = useState(true);
  const [showAllLineup, setShowAllLineup] = useState(false);
  const [brand, setBrand] = useState<HomeCatalogBrandId>("rocket");
  const [typeFilter, setTypeFilter] = useState<HomeProductTypeFilter>("전체");

  const products = useMemo(() => {
    const filtered = filterCatalogProducts(getCurrentLineup(brand), typeFilter);
    return sortLineupWithPinned(filtered);
  }, [brand, typeFilter]);

  const visibleProducts = useMemo(
    () => (showAllLineup ? products : products.slice(0, LINEUP_INITIAL_VISIBLE)),
    [products, showAllLineup],
  );

  return (
    <section
      className="home-catalog-section mt-14 rounded-2xl px-3 py-5 sm:mt-16 sm:px-4 sm:py-6"
      data-home-section="catalog"
      data-home-catalog-expanded={expanded ? "true" : "false"}
      id="home-catalog"
    >
      <div className="home-catalog-header rounded-2xl px-4 py-5 sm:px-5 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <div className="home-catalog-header__title-row flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="home-catalog-title">배터리 라인업</h2>
              <span className="home-catalog-label">Lineup</span>
            </div>
            <p className="home-catalog-desc mt-1.5 text-sm leading-relaxed">
              AGM·DIN·상용 R타입 등 대표 규격을 바로 확인할 수 있습니다.
            </p>
            <Link className={`${bm.btnTertiary} mt-3 inline-flex text-xs`} href="/shop">
              전체 규격 보기 →
            </Link>
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
                  className={clsx(
                    "home-catalog-brand-tab",
                    brand === tab.id && "home-catalog-brand-tab--active",
                  )}
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
                  className={clsx(
                    "home-catalog-filter-chip",
                    typeFilter === f && "home-catalog-filter-chip--active",
                  )}
                  onClick={() => setTypeFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="home-catalog-products mt-5">
              <div
                className="home-catalog-grid grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3"
                data-home-lineup-brand={brand}
              >
                {visibleProducts.map((item) => (
                  <HomeSpecExploreCard key={`${brand}-${item.id}`} brand={brand} product={item} />
                ))}
              </div>

              {products.length > LINEUP_INITIAL_VISIBLE && !showAllLineup ? (
                <button
                  type="button"
                  className="home-catalog-more-btn mx-auto mt-4 block rounded-full px-5 py-2 text-sm font-black text-slate-700"
                  onClick={() => setShowAllLineup(true)}
                >
                  대표 규격 더 보기 ({products.length - LINEUP_INITIAL_VISIBLE}개)
                </button>
              ) : null}

              {products.length === 0 ? (
                <p className="home-catalog-empty mt-6 rounded-xl px-4 py-8 text-center text-sm font-medium">
                  선택한 타입에 해당하는 대표 규격이 없습니다. 필터를 바꿔 보세요.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
