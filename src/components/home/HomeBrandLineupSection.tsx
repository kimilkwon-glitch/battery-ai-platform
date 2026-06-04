"use client";

import Link from "next/link";
import { useMemo } from "react";
import { HomeSpecExploreCard } from "@/components/home/HomeSpecExploreCard";
import {
  filterCatalogProducts,
  getCurrentLineup,
  sortLineupWithPinned,
  type HomeCatalogBrandId,
} from "@/lib/home-main-catalog-data";

/** 메인 병렬 섹션 — 브랜드당 미리보기 카드 수 */
const LINEUP_PREVIEW_COUNT = 4;

type Props = {
  brand: HomeCatalogBrandId;
  title: string;
  description: string;
  label: string;
  sectionId: string;
  shopHref: string;
  shopLinkLabel: string;
  /** column: 메인 2컬럼 병렬 / stack: 단독 세로 (상세·기타) */
  layout?: "column" | "stack";
  maxProducts?: number;
};

export function HomeBrandLineupSection({
  brand,
  title,
  description,
  label,
  sectionId,
  shopHref,
  shopLinkLabel,
  layout = "column",
  maxProducts = LINEUP_PREVIEW_COUNT,
}: Props) {
  const products = useMemo(() => {
    const filtered = filterCatalogProducts(getCurrentLineup(brand), "전체");
    return sortLineupWithPinned(filtered).slice(0, maxProducts);
  }, [brand, maxProducts]);

  const isColumn = layout === "column";

  return (
    <section
      className={
        isColumn
          ? "home-catalog-section home-catalog-section--brand home-catalog-section--brand-column"
          : "home-catalog-section home-catalog-section--brand mt-10 rounded-2xl px-3 py-5 sm:mt-12 sm:px-4 sm:py-6"
      }
      data-home-section={`catalog-${brand}`}
      data-home-lineup-brand={brand}
      id={sectionId}
    >
      <div className="home-catalog-header rounded-2xl px-4 py-4 sm:px-4 sm:py-5">
        <div className={isColumn ? "text-left" : "text-center sm:text-left"}>
          <div
            className={
              isColumn
                ? "home-catalog-header__title-row flex flex-wrap items-center gap-2"
                : "home-catalog-header__title-row flex flex-wrap items-center justify-center gap-2 sm:justify-start"
            }
          >
            <h2 className="home-catalog-title">{title}</h2>
            <span className="home-catalog-label">{label}</span>
          </div>
          <p className="home-catalog-desc mt-1.5 text-sm leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="home-catalog-panel home-catalog-panel--open home-catalog-panel--compact">
        <div className="home-catalog-panel__inner">
          <div className="home-catalog-panel__content">
            <div className="home-catalog-products home-catalog-products--preview">
              <div
                className={
                  isColumn
                    ? "home-catalog-grid home-catalog-grid--column-preview grid items-stretch gap-3"
                    : "home-catalog-grid grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3"
                }
              >
                {products.map((item) => (
                  <HomeSpecExploreCard key={`${brand}-${item.id}`} brand={brand} product={item} />
                ))}
              </div>

              {products.length === 0 ? (
                <p className="home-catalog-empty mt-4 rounded-xl px-4 py-6 text-center text-sm font-medium">
                  대표 규격을 준비 중입니다. 전체 보기에서 브랜드 상품을 확인해 주세요.
                </p>
              ) : null}
            </div>

            <div className="home-catalog-section__footer">
              <Link className="home-catalog-more-btn home-catalog-more-btn--cta" href={shopHref}>
                {shopLinkLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
