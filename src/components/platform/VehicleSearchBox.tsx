"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { CarGenerationImage } from "@/components/car/CarGenerationImage";
import { recordSearch, recordVehicleClick } from "@/lib/activity";
import {
  searchVehicleAssets,
  vehicleAssetBrandLabel,
  vehicleAssetHref,
  type VehicleAsset,
} from "@/lib/car-assets";

type Props = {
  defaultQuery?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showButton?: boolean;
  buttonLabel?: string;
  /** 히어로 검색 CTA — shimmer 1곳만 */
  shimmerSubmit?: boolean;
};

export function VehicleSearchBox({
  defaultQuery = "",
  placeholder = "차량명, 연식, 배터리 규격 검색",
  className = "",
  inputClassName = "",
  showButton = false,
  buttonLabel = "검색",
  shimmerSubmit = false,
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

  const dropdown =
    open && suggestions.length > 0 ? (
      <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
        {suggestions.map((asset, index) => (
          <li key={asset.id}>
            <button
              className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 ${
                index === activeIndex ? "bg-blue-50" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(asset);
              }}
              type="button"
            >
              <span className="h-12 w-[72px] shrink-0 overflow-hidden rounded-lg bg-slate-50">
                <CarGenerationImage
                  alt={asset.displayName}
                  className="!h-12 !w-[72px]"
                  size="compact"
                  src={asset.image}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-black text-slate-900">{asset.displayName}</span>
                {asset.generationName ? (
                  <span className="block truncate text-[10px] font-bold text-slate-500">{asset.generationName}</span>
                ) : null}
                <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-400">
                  {vehicleAssetBrandLabel(asset.brand)}
                  {asset.yearRange ? ` · ${asset.yearRange}` : ""}
                </span>
                {asset.batteryNotes ? (
                  <span className="mt-0.5 line-clamp-1 text-[10px] font-medium text-blue-600">{asset.batteryNotes}</span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ul>
    ) : null;

  if (showButton) {
    return (
      <div className={`relative ${className}`} ref={wrapRef}>
        <form
          action="/search"
          className="grid gap-2 md:grid-cols-[1fr_auto]"
          onSubmit={() => onSearchSubmit()}
        >
          <div className="relative min-w-0">
            <input
              autoComplete="off"
              className={inputClassName || "h-11 w-full rounded-lg bg-slate-50 px-4 text-sm font-bold outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-300"}
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
            {dropdown}
          </div>
          {shimmerSubmit ? (
            <ShimmerButton
              type="submit"
              background="rgb(37, 99, 235)"
              shimmerColor="#93c5fd"
              shimmerDuration="4s"
              borderRadius="10px"
              className="h-11 min-h-[44px] px-6 text-sm font-black"
            >
              {buttonLabel}
            </ShimmerButton>
          ) : (
            <button
              className="rounded-lg bg-blue-600 px-6 text-sm font-black text-white hover:bg-blue-700"
              type="submit"
            >
              {buttonLabel}
            </button>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className={`relative min-w-0 flex-1 ${className}`} ref={wrapRef}>
      <form action="/search" onSubmit={() => onSearchSubmit()}>
        <input
          autoComplete="off"
          className={inputClassName || defaultInputClass}
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
      </form>
      {dropdown}
    </div>
  );
}
