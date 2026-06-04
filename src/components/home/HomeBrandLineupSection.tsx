"use client";

import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { HomeSpecExploreCard } from "@/components/home/HomeSpecExploreCard";
import {
  filterCatalogProducts,
  getCurrentLineup,
  sortLineupWithPinned,
  type HomeCatalogBrandId,
  type HomeProductTypeTag,
} from "@/lib/home-main-catalog-data";

const BRAND_TYPE_TABS: HomeProductTypeTag[] = ["AGM", "DIN", "일반형"];

type Props = {
  brand: HomeCatalogBrandId;
  title: string;
  description: string;
  label: string;
  sectionId: string;
  shopHref: string;
  shopLinkLabel: string;
};

export function HomeBrandLineupSection({
  brand,
  title,
  description,
  label,
  sectionId,
  shopHref,
  shopLinkLabel,
}: Props) {
  const [typeTab, setTypeTab] = useState<HomeProductTypeTag>("AGM");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const products = useMemo(() => {
    const filtered = filterCatalogProducts(getCurrentLineup(brand), typeTab);
    return sortLineupWithPinned(filtered);
  }, [brand, typeTab]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [typeTab, brand]);

  const handleTabChange = (tab: HomeProductTypeTag) => {
    setTypeTab(tab);
  };

  const themeClass = brand === "rocket" ? "home-brand-lineup--rocket" : "home-brand-lineup--solite";

  return (
    <section
      className={clsx("home-brand-lineup", themeClass)}
      data-home-section={`catalog-${brand}`}
      data-home-lineup-brand={brand}
      data-home-type-tab={typeTab}
      id={sectionId}
    >
      <header className="home-brand-lineup__header">
        <div className="home-brand-lineup__title-row">
          <h2 className="home-brand-lineup__title">{title}</h2>
          <span className="home-brand-lineup__label">{label}</span>
        </div>
        <p className="home-brand-lineup__desc">{description}</p>
      </header>

      <div className="home-brand-lineup__body">
        <div className="home-brand-lineup__tabs" role="tablist" aria-label={`${title} 타입`}>
          {BRAND_TYPE_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={typeTab === tab}
              className={clsx(
                "home-brand-lineup__tab",
                typeTab === tab && "home-brand-lineup__tab--active",
              )}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div
          className="home-brand-lineup__panel"
          role="tabpanel"
          aria-label={`${title} ${typeTab}`}
        >
          {products.length === 0 ? (
            <p className="home-brand-lineup__empty">
              등록된 {typeTab} 상품이 없습니다. 다른 타입을 선택하거나 전체 보기에서 확인해 주세요.
            </p>
          ) : (
            <div
              ref={scrollerRef}
              className="home-brand-lineup__scroller"
              aria-label={`${title} ${typeTab} 상품`}
            >
              <div className="home-brand-lineup__track">
                {products.map((item) => (
                  <div key={`${brand}-${typeTab}-${item.id}`} className="home-brand-lineup__slide">
                    <HomeSpecExploreCard brand={brand} product={item} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="home-brand-lineup__footer">
          <Link href={shopHref} className="home-brand-lineup__cta">
            <span>{shopLinkLabel}</span>
            <ChevronRight className="home-brand-lineup__cta-icon" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
