"use client";

import Link from "next/link";
import { useMemo } from "react";
import { HomeSpecExploreCard } from "@/components/home/HomeSpecExploreCard";
import {
  getCurrentLineup,
  sortLineupWithPinned,
  type HomeCatalogBrandId,
  type HomeCatalogProduct,
  type HomeProductTypeTag,
} from "@/lib/home-main-catalog-data";

/** 그룹당 메인 미리보기 카드 수 */
const PER_GROUP_PREVIEW = 4;

const TYPE_GROUPS: { typeTag: HomeProductTypeTag; label: string }[] = [
  { typeTag: "AGM", label: "AGM 타입" },
  { typeTag: "DIN", label: "DIN 타입" },
  { typeTag: "일반형", label: "일반형" },
];

type Props = {
  brand: HomeCatalogBrandId;
  title: string;
  description: string;
  label: string;
  sectionId: string;
  shopHref: string;
  shopLinkLabel: string;
  layout?: "column" | "stack";
};

function buildTypeGroups(products: HomeCatalogProduct[], brandLabel: string) {
  const sorted = sortLineupWithPinned(products);
  return TYPE_GROUPS.map((group) => ({
    ...group,
    heading: `${brandLabel} ${group.typeTag === "일반형" ? "일반형" : group.typeTag}`,
    products: sorted.filter((p) => p.typeTag === group.typeTag).slice(0, PER_GROUP_PREVIEW),
  })).filter((g) => g.products.length > 0);
}

export function HomeBrandLineupSection({
  brand,
  title,
  description,
  label,
  sectionId,
  shopHref,
  shopLinkLabel,
  layout = "column",
}: Props) {
  const brandLabel = brand === "rocket" ? "로케트" : "쏠라이트";

  const typeGroups = useMemo(
    () => buildTypeGroups(getCurrentLineup(brand), brandLabel),
    [brand, brandLabel],
  );

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
            <div className="home-catalog-products home-catalog-products--grouped">
              {typeGroups.length === 0 ? (
                <p className="home-catalog-empty rounded-xl px-4 py-6 text-center text-sm font-medium">
                  대표 규격을 준비 중입니다. 전체 보기에서 브랜드 상품을 확인해 주세요.
                </p>
              ) : (
                typeGroups.map((group) => (
                  <div
                    key={`${brand}-${group.typeTag}`}
                    className="home-catalog-type-group"
                    data-home-type-group={group.typeTag}
                  >
                    <div className="home-catalog-type-group__head">
                      <span className="home-catalog-type-group__chip">{group.label}</span>
                      <span className="home-catalog-type-group__meta sr-only">{group.heading}</span>
                    </div>
                    <div className="home-catalog-grid home-catalog-grid--brand-duo grid items-stretch gap-2.5 sm:gap-3">
                      {group.products.map((item) => (
                        <HomeSpecExploreCard
                          key={`${brand}-${group.typeTag}-${item.id}`}
                          brand={brand}
                          product={item}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
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
