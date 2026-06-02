"use client";

import Link from "next/link";
import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";
import { PortalSiteNav, useNavViewport } from "@/components/platform/PortalHeaderNav";
import { BrandLogoLink } from "@/components/common/BrandLogoLink";
import { CartHeaderLink } from "@/components/cart/CartHeaderLink";
import { HUB_LOGIN, HUB_SIGNUP } from "@/lib/customer-hub-routes";

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

          <div className="portal-header-auth flex shrink-0 items-center gap-1 sm:gap-1.5">
            <Link
              href={HUB_LOGIN}
              aria-label="로그인"
              className="portal-header-auth-btn inline-flex cursor-pointer rounded-full px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 lg:px-2.5 lg:text-xs xl:px-3"
            >
              로그인
            </Link>
            <Link
              href={HUB_SIGNUP}
              aria-label="회원가입"
              className="portal-header-auth-btn inline-flex cursor-pointer rounded-full px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 sm:inline-flex lg:px-2.5 lg:text-xs xl:px-3"
            >
              회원가입
            </Link>
            <CartHeaderLink />
            <Link
              className="portal-header-my portal-header-auth-btn rounded-full px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 lg:px-3 lg:text-xs"
              href="/mypage"
            >
              MY
            </Link>
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
