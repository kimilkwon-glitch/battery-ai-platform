"use client";

import Link from "next/link";
import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";
import { PortalSiteNav, useNavViewport } from "@/components/platform/PortalHeaderNav";
import { BrandLogoLink } from "@/components/common/BrandLogoLink";
import { CartHeaderLink } from "@/components/cart/CartHeaderLink";
import { PortalHeaderAuth } from "@/components/platform/PortalHeaderAuth";

export function PortalHeaderClient({
  showSearch = false,
  searchPlaceholder = "차량명, 연식, 배터리 규격을 검색하세요",
  defaultQuery,
}: {
  showSearch?: boolean;
  searchPlaceholder?: string;
  defaultQuery?: string;
}) {
  const viewport = useNavViewport();

  return (
    <header className="portal-site-header sticky top-0 z-50 max-w-[100vw] overflow-x-clip border-b border-[var(--bm-border)] bg-white shadow-[var(--bm-shadow-sm)]">
      <div className="portal-header-inner relative mx-auto box-border w-full max-w-[1440px] px-6 py-3.5 lg:px-8 lg:py-4">
        <div className="portal-header-top-row flex min-h-[4.25rem] min-w-0 items-center gap-2 sm:gap-3 lg:min-h-20 lg:gap-4">
          <BrandLogoLink className="portal-header-brand max-w-[min(42vw,11.5rem)] shrink-0 sm:max-w-[13rem] lg:max-w-[15.5rem] xl:max-w-[17.5rem]" />

          {viewport === "desktop" ? (
            <div className="portal-header-nav-slot flex min-w-0 flex-1 justify-center overflow-hidden">
              <PortalSiteNav variant="desktop" />
            </div>
          ) : (
            <div className="min-w-0 flex-1" aria-hidden />
          )}

          <div className="portal-header-auth-row flex shrink-0 items-center gap-1 sm:gap-1.5">
            <PortalHeaderAuth />
            <CartHeaderLink />
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
        <div className="border-t border-slate-100 px-6 py-2 md:hidden">
          <VehicleSearchBox defaultQuery={defaultQuery} placeholder={searchPlaceholder} />
        </div>
      ) : null}

      {viewport === "mobile" ? <PortalSiteNav variant="mobile" /> : null}
    </header>
  );
}
