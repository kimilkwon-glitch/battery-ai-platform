"use client";

import Link from "next/link";
import { HomeHeroSearch } from "@/components/home/HomeHeroSearch";
import { HOME_MAIN_SEARCH_EXAMPLES } from "@/lib/home-main-catalog-data";

/** 검색창 + 검색 예시 chips — 제목·미니 링크 없음 */
export function HomeMainHero() {
  return (
    <section className="home-main-hero" data-home-section="search-hero">
      <div className="home-main-search-shell">
        <HomeHeroSearch />
      </div>

      <div className="home-main-hero-chips">
        <p className="home-main-hero-chips__label">검색 예시</p>
        <div className="home-search-example-chips">
          {HOME_MAIN_SEARCH_EXAMPLES.map((ex) => (
            <Link
              key={ex.href}
              className="home-search-example-chip rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200/90 transition hover:bg-white hover:text-blue-700 hover:ring-blue-200"
              href={ex.href}
            >
              {ex.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
