import { PortalHeader } from "@/components/portal";
import { SiteFooter } from "@/components/common/SiteFooter";
import { HomeCustomerFlow } from "@/components/home/HomeCustomerFlow";
import { HomeMainHero } from "@/components/home/HomeMainHero";

/** 검색 중심 메인 — hero → 핵심 CTA → 혜택·인기 규격·차량·Q&A */
export function HomeSearchMain() {
  return (
    <main className="min-h-screen bg-white text-[var(--bm-text)]" data-page="home-search-main">
      <PortalHeader showSearch={false} />

      <div className="home-main-content mx-auto max-w-[1100px] px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
        <HomeMainHero />
        <HomeCustomerFlow />
      </div>

      <div className="home-main-footer-wrap mt-12 border-t border-slate-100 bg-[var(--bm-page-bg)] sm:mt-16">
        <SiteFooter />
      </div>
    </main>
  );
}
