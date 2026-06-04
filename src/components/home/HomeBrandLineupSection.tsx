"use client";

import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState } from "react";
import { HomeSpecExploreCard } from "@/components/home/HomeSpecExploreCard";
import {
  HOME_CATALOG_TYPE_FILTERS,
  filterCatalogProducts,
  getCurrentLineup,
  sortLineupWithPinned,
  type HomeCatalogBrandId,
  type HomeProductTypeFilter,
} from "@/lib/home-main-catalog-data";

const LINEUP_INITIAL_VISIBLE = 9;

type Props = {
  brand: HomeCatalogBrandId;
  title: string;
  description: string;
  label: string;
  sectionId: string;
  shopLinkLabel?: string;
};

export function HomeBrandLineupSection({
  brand,
  title,
  description,
  label,
  sectionId,
  shopLinkLabel = "전체 규격 보기 →",
}: Props) {
  const [showAllLineup, setShowAllLineup] = useState(false);
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
      className="home-catalog-section home-catalog-section--brand mt-10 rounded-2xl px-3 py-5 sm:mt-12 sm:px-4 sm:py-6"
      data-home-section={`catalog-${brand}`}
      data-home-lineup-brand={brand}
      id={sectionId}
    >
      <div className="home-catalog-header rounded-2xl px-4 py-5 sm:px-5 sm:py-6">
        <div className="text-center sm:text-left">
          <div className="home-catalog-header__title-row flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h2 className="home-catalog-title">{title}</h2>
            <span className="home-catalog-label">{label}</span>
          </div>
          <p className="home-catalog-desc mt-1.5 text-sm leading-relaxed">{description}</p>
          <Link className="home-catalog-shop-link mt-3 inline-flex text-xs" href="/shop">
            {shopLinkLabel}
          </Link>
        </div>
      </div>

      <div className="home-catalog-panel home-catalog-panel--open pt-5">
        <div className="home-catalog-panel__inner">
          <div className="home-catalog-panel__content">
            <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
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
              <div className="home-catalog-grid grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
