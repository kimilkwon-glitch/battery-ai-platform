"use client";

import { useState } from "react";
import { HomeSearchTypeDropdown } from "@/components/home/HomeSearchTypeDropdown";
import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";
import { HOME_SEARCH_PLACEHOLDERS, type HomeSearchType } from "@/lib/home-search-types";

type Props = {
  inputClassName?: string;
  onAutocompleteOpenChange?: (open: boolean) => void;
};

export function HomeHeroSearch({ inputClassName, onAutocompleteOpenChange }: Props) {
  const [searchType, setSearchType] = useState<HomeSearchType>("all");
  const placeholder = HOME_SEARCH_PLACEHOLDERS[searchType];

  const compoundInputClass =
    inputClassName ??
    "home-main-search-input h-14 w-full rounded-none border-0 bg-white px-4 text-lg font-semibold text-slate-900 shadow-none outline-none ring-0 transition placeholder:text-[15px] placeholder:font-medium placeholder:text-slate-500 hover:bg-white focus:border-0 focus:shadow-none focus:ring-0 sm:h-16 sm:px-5 sm:text-xl sm:placeholder:text-base";

  return (
    <div className="home-hero-search w-full" data-home-search-type={searchType}>
      <div className="home-hero-search-compound home-hero-search-compound--premium flex w-full flex-col overflow-visible sm:flex-row sm:items-stretch">
        <HomeSearchTypeDropdown value={searchType} onChange={setSearchType} />
        <div className="hidden w-px shrink-0 bg-slate-200/90 sm:block" aria-hidden />
        <VehicleSearchBox
          className="min-w-0 flex-1"
          inputClassName={compoundInputClass}
          placeholder={placeholder}
          showButton
          buttonLabel="검색"
          searchType={searchType}
          compoundBar
          autocompleteLayout="hero-compound"
          onAutocompleteOpenChange={onAutocompleteOpenChange}
        />
      </div>
    </div>
  );
}
