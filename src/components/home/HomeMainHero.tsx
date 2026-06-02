"use client";

import { useState } from "react";
import Link from "next/link";
import { HomeHeroSearch } from "@/components/home/HomeHeroSearch";
import { HOME_MAIN_SEARCH_EXAMPLES } from "@/lib/home-main-catalog-data";
import { cn } from "@/lib/utils";

/** 검색창 + 검색 예시 chips — 제목·미니 링크 없음 */
export function HomeMainHero() {
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);

  return (
    <section
      className={cn("home-main-hero", autocompleteOpen && "home-main-hero--autocomplete-open")}
      data-home-section="search-hero"
    >
      <div className="home-main-search-aura">
        <div className="home-main-search-shell">
          <HomeHeroSearch onAutocompleteOpenChange={setAutocompleteOpen} />
        </div>
      </div>

      <div
        className={cn("home-main-hero-chips", autocompleteOpen && "home-main-hero-chips--hidden")}
        aria-hidden={autocompleteOpen}
      >
        <p className="home-main-hero-chips__label">검색 예시</p>
        <div className="home-search-example-chips">
          {HOME_MAIN_SEARCH_EXAMPLES.map((ex) => (
            <Link
              key={ex.href}
              className="home-search-example-chip"
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
