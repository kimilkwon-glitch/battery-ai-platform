"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AppIcon } from "@/components/common/AppIcon";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { VehicleSearchAutocomplete } from "@/components/platform/VehicleSearchAutocomplete";
import { recordSearch, recordVehicleClick } from "@/lib/activity";
import { vehicleAssetHref } from "@/lib/car-assets";
import {
  customerSuggestionHref,
  searchCustomerSuggestions,
  type CustomerSearchSuggestion,
} from "@/lib/search/customer-search-autocomplete";
import { getHomeSearchHref, type HomeSearchType } from "@/lib/home-search-types";
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
  autocompleteLayout?: "default" | "hero-compound" | "hero-flow";
  /** 메인 히어로 — document flow 호스트(검색바 아래, 혜택 섹션 밀림) */
  autocompleteHostEl?: HTMLDivElement | null;
  /** 자동완성 패널 열림 상태 (추천 칩 숨김 등) */
  onAutocompleteOpenChange?: (open: boolean) => void;
  /** 모바일 compact — 별도 아이콘 검색 버튼 열 (select | input | button) */
  iconSubmit?: boolean;
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
  autocompleteHostEl,
  onAutocompleteOpenChange,
  iconSubmit = false,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const queryTrimmed = query.trim();

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  const suggestions = useMemo(() => {
    if (queryTrimmed.length < 1) return [];
    return searchCustomerSuggestions(query, 8);
  }, [query, queryTrimmed]);

  /** 검색어가 바뀔 때만 하이라이트 초기화 — ArrowDown/Up 중 reset 금지 */
  useEffect(() => {
    setActiveIndex(0);
  }, [queryTrimmed]);

  useEffect(() => {
    if (suggestions.length === 0) return;
    setActiveIndex((i) => Math.min(Math.max(0, i), suggestions.length - 1));
  }, [suggestions.length]);

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

  function pick(item: CustomerSearchSuggestion) {
    if (item.kind === "vehicle") {
      const { asset } = item;
      recordSearch(asset.displayName, {
        matchedVehicle: asset.displayName,
        matchedBattery:
          asset.defaultBatteryCode ??
          item.batterySummary.match(/AGM\d+[LR]|DIN\d+[LR]|\d+[LR]/i)?.[0],
      });
      recordVehicleClick(asset.catalogId ?? asset.id);
      router.push(vehicleAssetHref(asset));
      return;
    }
    recordSearch(item.code, { matchedBattery: item.code });
    router.push(customerSuggestionHref(item));
  }

  function onSearchSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (q) {
      recordSearch(q);
      router.push(getHomeSearchHref(q, (searchType as HomeSearchType | undefined) ?? "all"));
    }
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const count = suggestions.length;

    if (e.key === "ArrowDown" && count > 0) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, count - 1));
      return;
    }

    if (e.key === "ArrowUp" && count > 0) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }

    if (e.key === "Enter") {
      if (open && count > 0 && activeIndex >= 0 && activeIndex < count) {
        e.preventDefault();
        pick(suggestions[activeIndex]);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(0);
    }
  }

  const listboxId = "bm-search-autocomplete-listbox";
  const activeOptionId =
    panelOpen && activeIndex >= 0 && activeIndex < suggestions.length
      ? `bm-search-option-${activeIndex}`
      : undefined;

  const defaultInputClass =
    "h-9 w-full rounded-lg bg-slate-50 px-3 text-xs font-bold outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-300";

  const useFlowHost = Boolean(autocompleteHostEl);
  const autocompleteLayoutResolved: "default" | "hero-compound" | "hero-flow" =
    autocompleteLayout === "hero-flow" || useFlowHost
      ? "hero-flow"
      : autocompleteLayout === "hero-compound" || compoundBar
        ? "hero-compound"
        : "default";

  const autocompletePanel = panelOpen ? (
    <VehicleSearchAutocomplete
      activeIndex={activeIndex}
      layout={autocompleteLayoutResolved}
      listboxId={listboxId}
      onHoverIndex={setActiveIndex}
      onPick={pick}
      suggestions={suggestions}
      className={
        useFlowHost
          ? "home-hero-autocomplete-panel mt-2 w-full"
          : "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[80]"
      }
    />
  ) : null;

  const autocompletePanelRendered =
    useFlowHost && autocompleteHostEl && autocompletePanel
      ? createPortal(autocompletePanel, autocompleteHostEl)
      : useFlowHost
        ? null
        : autocompletePanel;

  const hasQuery = query.trim().length > 0;

  function clearQuery() {
    setQuery("");
    setOpen(false);
  }

  function renderClearButton(inputTall: boolean, iconSubmitMode: boolean) {
    if (!hasQuery) return null;
    return (
      <button
        type="button"
        className={cn(
          "bm-search-input-clear absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60",
          iconSubmitMode ? "right-10 size-8" : inputTall ? "right-3 size-9" : "right-2 size-8",
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
      ? "home-hero-search-submit h-full min-h-0 shrink-0 border-0 border-l border-slate-200/90 bg-blue-600 text-sm font-black text-white hover:bg-blue-700"
      : "h-11 shrink-0 rounded-lg bg-blue-600 px-6 text-sm font-black text-white hover:bg-blue-700 sm:h-16";

    return (
      <div
        className={`relative ${compoundBar ? "home-hero-search-field-wrap" : ""} ${className}`}
        ref={wrapRef}
      >
        <form
          className={compoundBar ? "flex min-w-0 flex-1 items-stretch" : "flex min-w-0 flex-1 gap-2"}
          onSubmit={onSearchSubmit}
        >
          {searchType && searchType !== "all" ? (
            <input type="hidden" name="type" value={searchType} />
          ) : null}
          <div className="relative min-w-0 flex-1">
            <input
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={panelOpen}
              aria-controls={panelOpen ? listboxId : undefined}
              aria-activedescendant={activeOptionId}
              className={cn(
                inputClassName ||
                  "h-11 w-full rounded-lg bg-slate-50 px-4 text-sm font-bold outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-300",
                hasQuery && (iconSubmit && compoundBar ? "pr-10" : iconSubmit ? "pr-[4.25rem]" : compoundBar ? "pr-12 sm:pr-14" : "pr-10"),
                iconSubmit && !compoundBar && !hasQuery && "pr-11",
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
            {renderClearButton(compoundBar, iconSubmit && !compoundBar)}
            {iconSubmit && !compoundBar ? (
              <button
                type="submit"
                className="bm-search-icon-submit absolute right-2 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                aria-label="검색"
              >
                <AppIcon iconKey="search" size="sm" />
              </button>
            ) : null}
          </div>
          {iconSubmit && compoundBar ? (
            <button
              type="submit"
              className="home-hero-search-submit home-hero-search-submit--icon-only flex shrink-0 items-center justify-center border-0 border-l border-slate-200/90 bg-blue-600 text-white hover:bg-blue-700"
              aria-label="검색"
            >
              <AppIcon iconKey="search" size="sm" className="!text-white" />
            </button>
          ) : !iconSubmit && shimmerSubmit ? (
            <ShimmerButton
              type="submit"
              background="rgb(37, 99, 235)"
              shimmerColor="#93c5fd"
              shimmerDuration="4s"
              borderRadius={compoundBar ? "0" : "10px"}
              className={
                compoundBar
                  ? "home-hero-search-submit h-14 min-h-[44px] inline-flex shrink-0 items-center justify-center gap-1.5 border-0 border-l border-slate-200/90 text-sm font-black sm:h-16"
                  : "h-11 min-h-[44px] shrink-0 inline-flex items-center justify-center gap-1.5 px-6 text-sm font-black sm:h-16"
              }
            >
              <AppIcon iconKey="search" size="sm" className="!text-white" />
              {buttonLabel}
            </ShimmerButton>
          ) : !iconSubmit ? (
            <button className={submitBtnClass} type="submit">
              {buttonLabel}
            </button>
          ) : null}
        </form>
        {autocompletePanelRendered}
      </div>
    );
  }

  return (
    <div className={`relative min-w-0 flex-1 ${className}`} ref={wrapRef}>
      <form className="relative" onSubmit={onSearchSubmit}>
        <input
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={panelOpen}
          aria-controls={panelOpen ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
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
        {renderClearButton(false, false)}
      </form>
      {autocompletePanelRendered}
    </div>
  );
}
