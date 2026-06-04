"use client";

import { HomeHeroSearch } from "@/components/home/HomeHeroSearch";

/** 메인 검색창 */
export function HomeMainHero() {
  return (
    <section className="home-main-hero" data-home-section="search-hero">
      <div className="home-main-search-aura">
        <div className="home-main-search-shell">
          <HomeHeroSearch />
        </div>
      </div>
    </section>
  );
}
