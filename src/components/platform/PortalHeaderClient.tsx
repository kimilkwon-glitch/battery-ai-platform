"use client";

import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";
import { PortalSiteNav, useNavViewport } from "@/components/platform/PortalHeaderNav";
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
        <div className="relative flex min-h-14 items-center justify-center lg:px-2">
          {title ? (
            <span className="absolute left-0 top-1/2 hidden max-w-[28%] -translate-y-1/2 truncate text-xs font-black text-slate-400 md:block">
              {title}
            </span>
          ) : null}
          {viewport === "desktop" ? <PortalSiteNav variant="desktop" /> : null}
          <a
            className="portal-header-my absolute right-0 top-1/2 -translate-y-1/2 rounded-full px-4 py-2 text-xs font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 lg:px-5 lg:py-2.5 lg:text-sm"
            href="/mypage"
          >
            MY
          </a>
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
