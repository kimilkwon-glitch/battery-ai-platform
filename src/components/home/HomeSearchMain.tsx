import { PortalHeader } from "@/components/portal";
import { SiteFooter } from "@/components/common/SiteFooter";
import { HomeBenefitsCarousel } from "@/components/home/HomeBenefitsCarousel";
import { HomeCatalogSection } from "@/components/home/HomeCatalogSection";
import { HomeMainBanner } from "@/components/home/HomeMainBanner";
import { HomeMainHero } from "@/components/home/HomeMainHero";

/** 검색 Hero → 메인배너 → 혜택 → 배터리 라인업 */
export function HomeSearchMain() {
  return (
    <main className="min-h-screen bg-white text-[var(--bm-text)]" data-page="home-search-main">
      <PortalHeader showSearch={false} />

      <div className="home-main-content mx-auto max-w-[1100px] space-y-12 px-4 pb-16 pt-8 sm:space-y-14 sm:px-6 sm:pb-20 sm:pt-10 lg:space-y-16 lg:pb-24 lg:pt-12">
        <HomeMainHero />
        <HomeMainBanner />
        <HomeBenefitsCarousel />
        <HomeCatalogSection />
      </div>

      <div className="home-main-footer-wrap border-t border-slate-100 bg-[var(--bm-page-bg)]">
        <SiteFooter />
      </div>
    </main>
  );
}
