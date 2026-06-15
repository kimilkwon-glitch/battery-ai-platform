"use client";

import clsx from "clsx";
import { ChevronRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MobileHorizontalScrollNav } from "@/components/common/MobileHorizontalScrollNav";
import { HomeSpecExploreCard } from "@/components/home/HomeSpecExploreCard";
import {
  filterCatalogProducts,
  getCurrentLineup,
  sortLineupWithPinned,
  type HomeCatalogBrandId,
  type HomeProductTypeTag,
} from "@/lib/home-main-catalog-data";

const BRAND_TYPE_TABS = ["AGM", "DIN", "일반형"] as const satisfies readonly HomeProductTypeTag[];
type BrandLineupTypeTab = (typeof BRAND_TYPE_TABS)[number];
const BRAND_TYPE_TAB_LABELS: Record<BrandLineupTypeTab, string> = {
  AGM: "AGM (스탑앤고 전용)",
  DIN: "DIN (함몰형 단자)",
  일반형: "일반형 (돌출형 단자)",
};
/** 기본 탭 우선순위 — 상품 있는 탭을 먼저 노출 */
const DEFAULT_TAB_PRIORITY = ["일반형", "DIN", "AGM"] as const satisfies readonly HomeProductTypeTag[];

function pickDefaultTypeTab(brand: HomeCatalogBrandId): BrandLineupTypeTab {
  const lineup = getCurrentLineup(brand);
  for (const tab of DEFAULT_TAB_PRIORITY) {
    if (filterCatalogProducts(lineup, tab).length > 0) return tab;
  }
  return "일반형";
}

type Props = {
  brand: HomeCatalogBrandId;
  title: string;
  shortDescription: string;
  badge: string;
  sectionId: string;
  shopHref: string;
  shopLinkLabel: string;
};

export function HomeBrandLineupSection({
  brand,
  title,
  shortDescription,
  badge,
  sectionId,
  shopHref,
  shopLinkLabel,
}: Props) {
  const [typeTab, setTypeTab] = useState<BrandLineupTypeTab>(() => pickDefaultTypeTab(brand));

  const products = useMemo(() => {
    const filtered = filterCatalogProducts(getCurrentLineup(brand), typeTab);
    return sortLineupWithPinned(filtered);
  }, [brand, typeTab]);

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
        <div className="home-brand-lineup__header-inner">
          <div className="home-brand-lineup__title-row">
            <h2 className="home-brand-lineup__title">{title}</h2>
            <span className="home-brand-lineup__genuine-badge" aria-label="정품 배터리 취급">
              <ShieldCheck className="home-brand-lineup__genuine-icon" strokeWidth={2.25} aria-hidden />
              정품 배터리
            </span>
            <span className="home-brand-lineup__label">{badge}</span>
          </div>
          <p className="home-brand-lineup__desc">{shortDescription}</p>
          <Link href={shopHref} className="home-brand-lineup__more-link">
            <span>{shopLinkLabel}</span>
            <ChevronRight className="home-brand-lineup__more-icon" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
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
              onClick={() => setTypeTab(tab)}
            >
              {BRAND_TYPE_TAB_LABELS[tab]}
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
            <MobileHorizontalScrollNav
              className="home-brand-lineup__nav-wrap"
              scrollClassName="home-brand-lineup__scroller"
              ariaLabel={`${title} ${typeTab} 상품`}
              resetKey={`${brand}-${typeTab}`}
            >
              <div className="home-brand-lineup__track">
                {products.map((item) => (
                  <div key={`${brand}-${typeTab}-${item.id}`} className="home-brand-lineup__slide">
                    <HomeSpecExploreCard brand={brand} product={item} />
                  </div>
                ))}
              </div>
            </MobileHorizontalScrollNav>
          )}
        </div>

      </div>
    </section>
  );
}
