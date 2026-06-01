import { PortalHeader } from "@/components/portal";
import { SiteFooter } from "@/components/common/SiteFooter";
import { HomeBenefitsCarousel } from "@/components/home/HomeBenefitsCarousel";
import { HomeCatalogSection } from "@/components/home/HomeCatalogSection";
import { HomeMainBanner } from "@/components/home/HomeMainBanner";
import { HomeMainHero } from "@/components/home/HomeMainHero";

/** 메인배너 → 검색 Hero → 혜택 → 배터리 라인업 */
export function HomeSearchMain() {
  return (
    <main className="min-h-screen bg-white text-[var(--bm-text)]" data-page="home-search-main">
      <PortalHeader showSearch={false} />

      <div className="home-main-hero-region mx-auto w-full max-w-[1320px] px-4 pb-1 pt-5 sm:px-6 sm:pb-2 sm:pt-6 lg:pt-8">
        <div className="home-hero-stack" data-home-section="hero-top">
          <div className="home-hero-stack__banner">
            <HomeMainBanner />
          </div>
          <div className="home-hero-stack__search">
            <HomeMainHero />
          </div>
        </div>
      </div>

      <div className="home-main-content mx-auto max-w-[1100px] space-y-10 px-4 pb-16 sm:space-y-12 sm:px-6 sm:pb-20 lg:space-y-14 lg:pb-24">
        <HomeBenefitsCarousel />
        <HomeCatalogSection />
      </div>

      <div className="home-main-footer-wrap border-t border-slate-100 bg-[var(--bm-page-bg)]">
        <SiteFooter />
      </div>
    </main>
  );
}
