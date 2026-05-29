"use client";

import Link from "next/link";
import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";
import {
  HOME_MAIN_AUX_LINKS,
  HOME_MAIN_SEARCH_EXAMPLES,
  HOME_MAIN_SEARCH_PLACEHOLDER,
} from "@/lib/home-main-catalog-data";

export function HomeMainHero() {
  return (
    <section className="home-main-hero text-center" data-home-section="search-hero">
      <h1 className="home-main-logo">배터리매니저</h1>
      <p className="home-main-logo-sub mt-2 text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase sm:text-[11px]">
        Battery Manager
      </p>
      <p className="mx-auto mt-5 max-w-md text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
        차량명, 연식, 배터리 규격을 검색하세요
      </p>

      <div className="home-main-search-shell mx-auto mt-6 max-w-3xl text-left sm:max-w-4xl">
        <VehicleSearchBox
          className="w-full"
          inputClassName="home-main-search-input h-14 w-full rounded-2xl border border-slate-300/90 bg-white px-5 text-lg font-semibold text-slate-900 shadow-[0_10px_36px_rgba(15,23,42,0.08)] outline-none ring-0 placeholder:text-base placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/90 sm:h-16 sm:px-6 sm:text-xl sm:placeholder:text-lg"
          placeholder={HOME_MAIN_SEARCH_PLACEHOLDER}
          showButton
          buttonLabel="검색"
        />
      </div>

      <div className="mx-auto mt-6 max-w-3xl text-left sm:max-w-4xl sm:text-center">
        <p className="text-[11px] font-bold text-slate-400">자주 검색하는 예시</p>
        <p className="home-main-search-examples mt-2 text-xs font-semibold text-slate-600 sm:justify-center">
          {HOME_MAIN_SEARCH_EXAMPLES.map((ex, i) => (
            <span key={ex.href} className="inline-flex items-center">
              {i > 0 ? <span className="mx-1 text-slate-300" aria-hidden>·</span> : null}
              <Link className="text-blue-700 hover:underline" href={ex.href}>
                {ex.label}
              </Link>
            </span>
          ))}
        </p>
      </div>

      <p className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-500 sm:max-w-4xl">
        {HOME_MAIN_AUX_LINKS.map((link, i) => (
          <span key={link.href} className="inline-flex items-center">
            {i > 0 ? <span className="mx-1 text-slate-300" aria-hidden>·</span> : null}
            <Link className="text-slate-600 hover:text-blue-700 hover:underline" href={link.href}>
              {link.label}
            </Link>
          </span>
        ))}
      </p>
    </section>
  );
}
