"use client";

import Link from "next/link";
import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";
import { PortalSiteNav, useNavViewport } from "@/components/platform/PortalHeaderNav";
import { HUB_LOGIN, HUB_SIGNUP } from "@/lib/customer-hub-routes";
export function PortalHeaderClient({
  title,
  showSearch = true,
  searchPlaceholder = "차량명, 연식, 배터리 규격 검색",
  defaultQuery,
}: {
  title?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  defaultQuery?: string;
}) {
  const viewport = useNavViewport();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--bm-border)] bg-white shadow-[var(--bm-shadow-sm)]">
      <div className="relative mx-auto max-w-[1440px] px-4 py-2.5 lg:px-6 lg:py-3">
        <div className="relative flex min-h-14 items-center justify-center pr-[7.5rem] sm:pr-[10.5rem] lg:px-2 lg:pr-[11rem]">
          {title ? (
            <span className="absolute left-0 top-1/2 hidden max-w-[28%] -translate-y-1/2 truncate text-xs font-black text-slate-400 md:block">
              {title}
            </span>
          ) : null}
          {viewport === "desktop" ? <PortalSiteNav variant="desktop" /> : null}
          <div className="portal-header-auth absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1 sm:gap-1.5">
            <Link
              href={HUB_LOGIN}
              className="hidden rounded-full px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:inline-flex lg:px-3 lg:text-xs"
            >
              로그인
            </Link>
            <Link
              href={HUB_SIGNUP}
              className="hidden rounded-full px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 sm:inline-flex lg:px-3 lg:text-xs"
            >
              회원가입
            </Link>
            <Link
              className="portal-header-my rounded-full px-3 py-1.5 text-[11px] font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 lg:px-4 lg:py-2 lg:text-xs"
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
        <div className="border-t border-slate-100 px-4 py-2 md:hidden">
          <VehicleSearchBox defaultQuery={defaultQuery} placeholder={searchPlaceholder} />
        </div>
      ) : null}

      {viewport === "mobile" ? <PortalSiteNav variant="mobile" /> : null}
    </header>
  );
}
