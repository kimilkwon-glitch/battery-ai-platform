import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { HomeHeroBackdrop } from "@/components/home/HomeHeroBackdrop";
import { HomeMainBanner } from "@/components/home/HomeMainBanner";
import { HomeMainHero } from "@/components/home/HomeMainHero";
import { BRAND_HERO_LABEL } from "@/lib/brand";
import { getSearchHref } from "@/lib/battery-search";
import { HOME_HERO } from "@/lib/home-upgrade-v2-data";

/** 메인 상단 — 프리미엄 다크 히어로 + 배너 + 검색 (흐름 유지) */
export function HomePremiumHero() {
  return (
    <section className="home-premium-hero" data-home-section="premium-hero">
      <HomeHeroBackdrop />

      <div className="home-premium-hero__inner home-main-hero-region mx-auto w-full max-w-[1320px] px-4 pb-4 pt-5 sm:px-6 sm:pb-6 sm:pt-6 lg:pb-10 lg:pt-8">
        <header className="home-premium-hero__header">
          <p className="home-premium-hero__eyebrow">{BRAND_HERO_LABEL}</p>
          <h1 className="home-premium-hero__title">{HOME_HERO.headline}</h1>
          <p className="home-premium-hero__lead">{HOME_HERO.subline}</p>
          <p className="home-premium-hero__tagline">{HOME_HERO.tagline}</p>

          <div className="home-premium-hero__ctas">
            <Link
              href="/vehicles"
              className="home-premium-hero__cta home-premium-hero__cta--primary"
            >
              <AppIcon iconKey="vehicle" size="sm" className="!text-sky-100" />
              내 차 배터리 찾기
            </Link>
            <Link
              href={getSearchHref("AGM80L")}
              className="home-premium-hero__cta home-premium-hero__cta--secondary"
            >
              <AppIcon iconKey="batterySpec" size="sm" className="!text-sky-200" />
              규격명으로 찾기
            </Link>
          </div>
        </header>

        <div className="home-hero-stack" data-home-section="hero-top">
          <div className="home-hero-stack__banner">
            <HomeMainBanner />
          </div>
          <div className="home-hero-stack__search">
            <HomeMainHero />
          </div>
        </div>
      </div>
    </section>
  );
}
