"use client";

import Link from "next/link";
import { HomeHeroSearch } from "@/components/home/HomeHeroSearch";
import {
  HOME_MAIN_AUX_LINKS,
  HOME_MAIN_SEARCH_EXAMPLES,
} from "@/lib/home-main-catalog-data";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

const HERO_SECONDARY_CTAS = [
  { label: "사진으로 확인하기", href: "/photo-check" },
  { label: "주문 전 체크리스트", href: "/order-checklist" },
  { label: "매장·출장 안내", href: HUB_STORE_DETAIL },
] as const;

export function HomeMainHero() {
  return (
    <section className="home-main-hero" data-home-section="search-hero">
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-500 sm:justify-start">
        {HOME_MAIN_AUX_LINKS.map((link, i) => (
          <span key={link.href} className="inline-flex items-center">
            {i > 0 ? <span className="mx-1 text-slate-300" aria-hidden>·</span> : null}
            <Link className="text-slate-600 hover:text-blue-700 hover:underline" href={link.href}>
              {link.label}
            </Link>
          </span>
        ))}
      </p>

      <div className="mt-8 text-center sm:mt-10 sm:text-left">
        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          차량명·연식·배터리 규격으로 바로 확인
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:mx-0">
          내 차에 맞는 배터리 후보와 주문 전 확인 포인트를 빠르게 안내합니다.
        </p>
      </div>

      <div className="home-main-search-shell mx-auto mt-6 max-w-3xl sm:mt-8 sm:max-w-4xl lg:max-w-[1100px]">
        <HomeHeroSearch />
      </div>

      <div className="mx-auto mt-4 max-w-3xl sm:max-w-4xl">
        <p className="text-[11px] font-bold text-slate-400">검색 예시</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {HOME_MAIN_SEARCH_EXAMPLES.map((ex) => (
            <Link
              key={ex.href}
              className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200/90 transition hover:bg-white hover:text-blue-700 hover:ring-blue-200"
              href={ex.href}
            >
              {ex.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-500 sm:max-w-4xl sm:justify-start">
        {HERO_SECONDARY_CTAS.map((link) => (
          <Link
            key={link.href}
            className="text-slate-600 hover:text-blue-700 hover:underline"
            href={link.href}
          >
            {link.label}
          </Link>
        ))}
      </p>
    </section>
  );
}
