"use client";

import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";
import { PortalSiteNav, useNavViewport } from "@/components/platform/PortalHeaderNav";
import { bm } from "@/lib/design-tokens";

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
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 lg:px-6">
        <a className="flex shrink-0 items-center whitespace-nowrap" href="/">
          <span className="text-[15px] font-extrabold tracking-[-0.04em] text-[var(--bm-navy)] sm:text-base">
            배터리매니저
          </span>
        </a>
        {title ? (
          <span className="hidden shrink-0 whitespace-nowrap text-xs font-black text-slate-400 md:block">
            {title}
          </span>
        ) : null}
        {showSearch ? (
          <VehicleSearchBox
            className="hidden min-w-0 flex-1 md:block md:max-w-xl lg:max-w-2xl"
            defaultQuery={defaultQuery}
            placeholder={searchPlaceholder}
          />
        ) : (
          <div className="hidden flex-1 md:block" />
        )}
        {viewport === "desktop" ? (
          <div className="shrink-0">
            <PortalSiteNav variant="desktop" />
          </div>
        ) : null}
        <a
          className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-800"
          href="/mypage"
        >
          MY
        </a>
      </div>
      {showSearch ? (
        <div className="border-t border-slate-100 px-4 py-2 lg:hidden">
          <VehicleSearchBox defaultQuery={defaultQuery} placeholder={searchPlaceholder} />
        </div>
      ) : null}
      {viewport === "mobile" ? <PortalSiteNav variant="mobile" /> : null}
    </header>
  );
}
