"use client";

import Link from "next/link";
import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";
import { HomeMainBanner } from "@/components/home/HomeMainBanner";
import {
  HOME_MAIN_AUX_LINKS,
  HOME_MAIN_SEARCH_EXAMPLES,
  HOME_MAIN_SEARCH_PLACEHOLDER,
} from "@/lib/home-main-catalog-data";

export function HomeMainHero() {
  return (
    <section className="home-main-hero text-center" data-home-section="search-hero">
      <HomeMainBanner />

      <div className="home-main-search-shell mx-auto mt-4 max-w-3xl text-left sm:mt-5 sm:max-w-4xl lg:max-w-[1100px]">
        <VehicleSearchBox
          className="w-full"
          inputClassName="home-main-search-input h-14 w-full rounded-2xl border-2 border-slate-300/95 bg-white px-5 text-lg font-semibold text-slate-900 shadow-[0_8px_32px_rgba(37,99,235,0.1),0_4px_16px_rgba(15,23,42,0.06)] outline-none ring-0 transition placeholder:text-[15px] placeholder:font-medium placeholder:text-slate-500 hover:border-blue-300/90 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.18),0_10px_36px_rgba(37,99,235,0.12)] focus:ring-0 sm:h-16 sm:px-6 sm:text-xl sm:placeholder:text-base"
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
