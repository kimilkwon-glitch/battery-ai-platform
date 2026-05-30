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

      <div className="home-main-content mx-auto max-w-[1100px] space-y-10 px-4 pb-16 pt-6 sm:space-y-12 sm:px-6 sm:pb-20 sm:pt-8 lg:space-y-14 lg:pb-24 lg:pt-10">
        <div className="home-main-top space-y-5 sm:space-y-6" data-home-section="hero-top">
          <HomeMainBanner />
          <HomeMainHero />
        </div>
        <HomeBenefitsCarousel />
        <HomeCatalogSection />
      </div>

      <div className="home-main-footer-wrap border-t border-slate-100 bg-[var(--bm-page-bg)]">
        <SiteFooter />
      </div>
    </main>
  );
}
