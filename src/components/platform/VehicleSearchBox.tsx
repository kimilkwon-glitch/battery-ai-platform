"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { AppIcon } from "@/components/common/AppIcon";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { VehicleSearchAutocomplete } from "@/components/platform/VehicleSearchAutocomplete";
import { recordSearch, recordVehicleClick } from "@/lib/activity";
import {
  searchVehicleAssets,
  vehicleAssetHref,
  type VehicleAsset,
} from "@/lib/car-assets";
import { cn } from "@/lib/utils";

type Props = {
  defaultQuery?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showButton?: boolean;
  buttonLabel?: string;
  /** 히어로 검색 CTA — shimmer 1곳만 */
  shimmerSubmit?: boolean;
  /** /search?type= — all이면 생략 */
  searchType?: string;
  /** 메인 Hero 통합 검색바 — 타입 선택과 한 줄로 붙임 */
  compoundBar?: boolean;
  /** 메인 히어로 — 자동완성 패널을 검색바 전체 폭에 맞춤 */
  autocompleteLayout?: "default" | "hero-compound";
  /** 자동완성 패널 열림 상태 (추천 칩 숨김 등) */
  onAutocompleteOpenChange?: (open: boolean) => void;
};

export function VehicleSearchBox({
  defaultQuery = "",
  placeholder = "차량명, 연식, 배터리 규격 검색",
  className = "",
  inputClassName = "",
  showButton = false,
  buttonLabel = "검색",
  shimmerSubmit = false,
  searchType,
  compoundBar = false,
  autocompleteLayout = "default",
  onAutocompleteOpenChange,
}: Props) {
  const [query, setQuery] = useState(defaultQuery);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  const suggestions = useMemo(() => {
    if (query.trim().length < 1) return [];
    return searchVehicleAssets(query, 8);
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [suggestions.length, query]);

  const panelOpen = open && suggestions.length > 0;

  useEffect(() => {
    onAutocompleteOpenChange?.(panelOpen);
  }, [panelOpen, onAutocompleteOpenChange]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pick(asset: VehicleAsset) {
    recordSearch(asset.displayName, {
      matchedVehicle: asset.displayName,
      matchedBattery: asset.batteryNotes?.match(/AGM\d+[LR]|DIN\d+[LR]|\d+R/i)?.[0],
    });
    recordVehicleClick(asset.catalogId ?? asset.id);
    window.location.href = vehicleAssetHref(asset);
  }

  function onSearchSubmit() {
    const q = query.trim();
    if (q) recordSearch(q);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && suggestions[activeIndex]) {
      e.preventDefault();
      pick(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const defaultInputClass =
    "h-9 w-full rounded-lg bg-slate-50 px-3 text-xs font-bold outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-300";

  const autocompleteLayoutResolved: "default" | "hero-compound" =
    autocompleteLayout === "hero-compound" || compoundBar ? "hero-compound" : "default";

  const autocompletePanel = panelOpen ? (
    <VehicleSearchAutocomplete
      activeIndex={activeIndex}
      layout={autocompleteLayoutResolved}
      onHoverIndex={setActiveIndex}
      onPick={pick}
      suggestions={suggestions}
      className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[80]"
    />
  ) : null;

  const hasQuery = query.trim().length > 0;

  function clearQuery() {
    setQuery("");
    setOpen(false);
  }

  function renderClearButton(inputTall: boolean) {
    if (!hasQuery) return null;
    return (
      <button
        type="button"
        className={cn(
          "bm-search-input-clear absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60",
          inputTall ? "right-3 size-9" : "right-2 size-8",
        )}
        aria-label="검색어 지우기"
        onMouseDown={(e) => e.preventDefault()}
        onClick={clearQuery}
      >
        <X className={inputTall ? "size-4" : "size-3.5"} aria-hidden />
      </button>
    );
  }

  if (showButton) {
    const submitBtnClass = compoundBar
      ? "h-14 min-h-[44px] shrink-0 rounded-none rounded-br-2xl border-0 border-l border-slate-200/90 bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 sm:h-16 sm:rounded-br-2xl sm:px-6"
      : "h-11 shrink-0 rounded-lg bg-blue-600 px-6 text-sm font-black text-white hover:bg-blue-700 sm:h-16";

    return (
      <div
        className={`relative ${compoundBar ? "border-t border-slate-200/90 sm:border-t-0" : ""} ${className}`}
        ref={wrapRef}
      >
        <form
          action="/search"
          className={compoundBar ? "flex min-w-0 flex-1 items-stretch" : "flex min-w-0 flex-1 gap-2"}
          onSubmit={() => onSearchSubmit()}
        >
          {searchType && searchType !== "all" ? (
            <input type="hidden" name="type" value={searchType} />
          ) : null}
          <div className="relative min-w-0 flex-1">
            <input
              autoComplete="off"
              className={cn(
                inputClassName ||
                  "h-11 w-full rounded-lg bg-slate-50 px-4 text-sm font-bold outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-300",
                hasQuery && (compoundBar ? "pr-12 sm:pr-14" : "pr-10"),
              )}
              name="q"
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              type="search"
              value={query}
            />
            {renderClearButton(compoundBar)}
          </div>
          {shimmerSubmit ? (
            <ShimmerButton
              type="submit"
              background="rgb(37, 99, 235)"
              shimmerColor="#93c5fd"
              shimmerDuration="4s"
              borderRadius={compoundBar ? "0" : "10px"}
              className={
                compoundBar
                  ? "h-14 min-h-[44px] shrink-0 inline-flex items-center justify-center gap-1.5 rounded-none rounded-br-2xl border-0 border-l border-slate-200/90 px-5 text-sm font-black sm:h-16 sm:rounded-br-2xl sm:px-6"
                  : "h-11 min-h-[44px] shrink-0 inline-flex items-center justify-center gap-1.5 px-6 text-sm font-black sm:h-16"
              }
            >
              <AppIcon iconKey="search" size="sm" className="!text-white" />
              {buttonLabel}
            </ShimmerButton>
          ) : (
            <button className={submitBtnClass} type="submit">
              {buttonLabel}
            </button>
          )}
        </form>
        {autocompletePanel}
      </div>
    );
  }

  return (
    <div className={`relative min-w-0 flex-1 ${className}`} ref={wrapRef}>
      <form action="/search" className="relative" onSubmit={() => onSearchSubmit()}>
        <input
          autoComplete="off"
          className={cn(inputClassName || defaultInputClass, hasQuery && "pr-10")}
          name="q"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          type="search"
          value={query}
        />
        {renderClearButton(false)}
      </form>
      {autocompletePanel}
    </div>
  );
}
