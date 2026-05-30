"use client";

import { useState } from "react";
import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";
import {
  HOME_SEARCH_PLACEHOLDERS,
  HOME_SEARCH_TYPE_OPTIONS,
  type HomeSearchType,
} from "@/lib/home-search-types";

type Props = {
  inputClassName?: string;
};

export function HomeHeroSearch({ inputClassName }: Props) {
  const [searchType, setSearchType] = useState<HomeSearchType>("all");
  const placeholder = HOME_SEARCH_PLACEHOLDERS[searchType];

  return (
    <div
      className="home-hero-search flex w-full flex-col gap-2 sm:flex-row sm:items-stretch"
      data-home-search-type={searchType}
    >
      <label className="sr-only" htmlFor="home-search-type">
        검색 유형
      </label>
      <select
        id="home-search-type"
        value={searchType}
        onChange={(e) => setSearchType(e.target.value as HomeSearchType)}
        className="h-14 shrink-0 rounded-2xl border-2 border-slate-300/95 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm outline-none transition hover:border-blue-300/90 focus:border-blue-500 focus:ring-0 sm:h-16 sm:min-w-[6.5rem] sm:px-4"
        aria-label="검색 유형 선택"
      >
        {HOME_SEARCH_TYPE_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <VehicleSearchBox
        className="min-w-0 flex-1"
        inputClassName={
          inputClassName ??
          "home-main-search-input h-14 w-full rounded-2xl border-2 border-slate-300/95 bg-white px-5 text-lg font-semibold text-slate-900 shadow-[0_8px_32px_rgba(37,99,235,0.1),0_4px_16px_rgba(15,23,42,0.06)] outline-none ring-0 transition placeholder:text-[15px] placeholder:font-medium placeholder:text-slate-500 hover:border-blue-300/90 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.18),0_10px_36px_rgba(37,99,235,0.12)] focus:ring-0 sm:h-16 sm:px-6 sm:text-xl sm:placeholder:text-base"
        }
        placeholder={placeholder}
        showButton
        buttonLabel="검색"
        searchType={searchType}
      />
    </div>
  );
}
