import Link from "next/link";
import { PortalHeader } from "@/components/portal";
import { SiteFooter } from "@/components/common/SiteFooter";
import { HomeBenefitsCarousel } from "@/components/home/HomeBenefitsCarousel";
import { HomeCatalogSection } from "@/components/home/HomeCatalogSection";
import { HomeMainHero } from "@/components/home/HomeMainHero";
import { bm } from "@/lib/design-tokens";
import { HUB_PHOTO, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { HUB_ORDER_CHECKLIST } from "@/lib/platform-hub-routes";

const BOTTOM_AUX = [
  { label: "사진으로 확인", href: HUB_PHOTO },
  { label: "주문 전 체크", href: HUB_ORDER_CHECKLIST },
  { label: "Q&A 보기", href: "/qa" },
  { label: "매장 안내", href: HUB_STORE_DETAIL },
] as const;

/** 검색 Hero → 혜택 → 배터리 라인업 → 하단 보조 안내 */
export function HomeSearchMain() {
  return (
    <main className="min-h-screen bg-white text-[var(--bm-text)]" data-page="home-search-main">
      <PortalHeader showSearch={false} />

      <div className="home-main-content mx-auto max-w-[1100px] space-y-12 px-4 pb-16 pt-8 sm:space-y-14 sm:px-6 sm:pb-20 sm:pt-10 lg:space-y-16 lg:pb-24 lg:pt-12">
        <HomeMainHero />
        <HomeBenefitsCarousel />
        <HomeCatalogSection />

        <section
          className="border-t border-slate-100 pt-8 text-center sm:text-left"
          data-home-section="bottom-aux"
        >
          <p className="text-[11px] font-bold text-slate-400">추가 안내</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            {BOTTOM_AUX.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  i === 0
                    ? `${bm.btnNavy} text-xs`
                    : i === 1
                      ? `${bm.btnSecondary} text-xs`
                      : `${bm.btnTertiary} text-xs`
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="home-main-footer-wrap border-t border-slate-100 bg-[var(--bm-page-bg)]">
        <SiteFooter />
      </div>
    </main>
  );
}
