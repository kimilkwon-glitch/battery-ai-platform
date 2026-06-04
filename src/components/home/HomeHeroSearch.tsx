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
    "home-main-search-input h-full min-h-0 w-full rounded-none border-0 bg-white shadow-none outline-none ring-0 transition placeholder:text-slate-500 hover:bg-white focus:border-0 focus:shadow-none focus:ring-0";

  const [autocompleteHost, setAutocompleteHost] = useState<HTMLDivElement | null>(null);

  return (
    <div className="home-hero-search w-full" data-home-search-type={searchType}>
      <div className="home-hero-search-stack flex w-full flex-col">
        <div className="home-hero-search-compound home-hero-search-compound--premium w-full">
          <HomeSearchTypeDropdown value={searchType} onChange={setSearchType} />
          <div className="home-hero-search-compound__divider hidden shrink-0 sm:block" aria-hidden />
          <VehicleSearchBox
            className="home-hero-search-field min-w-0 flex-1"
            inputClassName={compoundInputClass}
            placeholder={placeholder}
            showButton
            buttonLabel="검색"
            searchType={searchType}
            compoundBar
            autocompleteLayout="hero-flow"
            autocompleteHostEl={autocompleteHost}
            onAutocompleteOpenChange={onAutocompleteOpenChange}
          />
        </div>
        <div
          ref={setAutocompleteHost}
          className="home-hero-autocomplete-host w-full"
          aria-live="polite"
        />
      </div>
    </div>
  );
}
