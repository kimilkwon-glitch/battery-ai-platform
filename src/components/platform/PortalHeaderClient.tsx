"use client";

import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";
import { PortalSiteNav } from "@/components/platform/PortalHeaderNav";
import { BrandLogoLink } from "@/components/common/BrandLogoLink";
import { CartHeaderLink } from "@/components/cart/CartHeaderLink";
import { PortalHeaderAuth } from "@/components/platform/PortalHeaderAuth";
import { PortalMobileMenu } from "@/components/platform/PortalMobileMenu";
import { FirstOrderMemberBanner } from "@/components/benefits/FirstOrderMemberBanner";

export function PortalHeaderClient({
  showSearch = false,
  searchPlaceholder = "차량명, 연식, 배터리 규격을 검색하세요",
  defaultQuery,
}: {
  showSearch?: boolean;
  searchPlaceholder?: string;
  defaultQuery?: string;
}) {
  return (
    <>
      <FirstOrderMemberBanner className="first-order-member-banner--site-top" />
      <header className="portal-site-header sticky top-0 z-50 w-full max-w-full overflow-x-clip border-b border-[var(--bm-border)] bg-white shadow-[var(--bm-shadow-sm)]">
      <div className="portal-header-inner relative mx-auto box-border w-full max-w-[1440px] px-4 py-2.5 sm:px-6 sm:py-3.5 lg:px-8 lg:py-4">
        <div className="portal-header-top-row flex min-h-[3.25rem] min-w-0 items-center gap-1.5 sm:min-h-[4.25rem] sm:gap-3 lg:min-h-20 lg:gap-4">
          <BrandLogoLink className="portal-header-brand min-w-0 max-w-[9.25rem] shrink-0 sm:max-w-[13rem] lg:max-w-[15.5rem] xl:max-w-[17.5rem]" />

          <div className="portal-header-nav-slot hidden min-w-0 flex-1 justify-center overflow-hidden lg:flex">
            <PortalSiteNav variant="desktop" />
          </div>

          <div className="min-w-0 flex-1 lg:hidden" aria-hidden />

          <div className="portal-header-actions flex shrink-0 items-center gap-1 sm:gap-1.5">
            <div className="hidden shrink-0 items-center gap-1 sm:gap-1.5 lg:flex">
              <PortalHeaderAuth />
            </div>
            <CartHeaderLink />
            <PortalMobileMenu />
          </div>
        </div>

        {showSearch ? (
          <div className="mt-2 hidden md:block">
            <VehicleSearchBox
              className="mx-auto max-w-2xl"
              defaultQuery={defaultQuery}
              placeholder={searchPlaceholder}
            />
          </div>
        ) : null}
      </div>

      {showSearch ? (
        <div className="border-t border-slate-100 px-4 py-2 md:hidden">
          <VehicleSearchBox defaultQuery={defaultQuery} placeholder={searchPlaceholder} />
        </div>
      ) : null}

      <div className="portal-header-mobile-nav-wrap lg:hidden">
        <PortalSiteNav variant="mobile" />
      </div>
    </header>
    </>
  );
}
