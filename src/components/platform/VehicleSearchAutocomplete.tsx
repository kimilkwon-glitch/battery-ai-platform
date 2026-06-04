"use client";

import { useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import {
  customerSuggestionBrandLabel,
  customerSuggestionTitle,
  type CustomerSearchSuggestion,
} from "@/lib/search/customer-search-autocomplete";
import { scrollAutocompleteOptionIntoList } from "@/lib/search/scroll-autocomplete-option";
import { cn } from "@/lib/utils";

type Props = {
  suggestions: CustomerSearchSuggestion[];
  activeIndex: number;
  onPick: (item: CustomerSearchSuggestion) => void;
  onHoverIndex: (index: number) => void;
  listboxId?: string;
  /** 메인 통합 검색바 — 타입 선택 영역까지 패널 폭 확장 */
  layout?: "default" | "hero-compound" | "hero-flow";
  className?: string;
};

export function VehicleSearchAutocomplete({
  suggestions,
  activeIndex,
  onPick,
  onHoverIndex,
  listboxId = "bm-search-autocomplete-listbox",
  layout = "default",
  className,
}: Props) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (activeIndex < 0 || activeIndex >= suggestions.length) return;
    const list = listRef.current;
    if (!list) return;

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const row = list.querySelector<HTMLElement>(`[data-option-index="${activeIndex}"]`);
        if (row) scrollAutocompleteOptionIntoList(list, row);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [activeIndex, suggestions.length]);

  if (suggestions.length === 0) return null;

  return (
    <div
      className={cn(
        "bm-search-autocomplete",
        layout === "hero-compound" && "bm-search-autocomplete--hero-compound",
        layout === "hero-flow" && "bm-search-autocomplete--hero-flow",
        className,
      )}
    >
      <div className="bm-search-autocomplete__head">
        <p className="bm-search-autocomplete__head-title">차종·배터리 규격</p>
        <span className="bm-search-autocomplete__head-count">{suggestions.length}건</span>
      </div>
      <ul
        id={listboxId}
        ref={listRef}
        className="bm-search-autocomplete__list"
        role="listbox"
        aria-label="검색 자동완성"
      >
        {suggestions.map((item, index) => {
          const isActive = index === activeIndex;
          const title = customerSuggestionTitle(item);
          const brand = customerSuggestionBrandLabel(item);
          const optionId = `bm-search-option-${index}`;

          if (item.kind === "battery") {
            return (
              <li key={`battery-${item.id}-${index}`} className="bm-search-autocomplete__item" role="presentation">
                <button
                  type="button"
                  id={optionId}
                  data-option-index={index}
                  role="option"
                  aria-selected={isActive}
                  className={cn("bm-search-autocomplete__row", isActive && "is-active")}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onPick(item);
                  }}
                  onMouseEnter={() => onHoverIndex(index)}
                >
                  <span className="bm-search-autocomplete__body">
                    <span className="bm-search-autocomplete__title-row">
                      <span className="bm-search-autocomplete__title">{title}</span>
                    </span>
                    <span className="bm-search-autocomplete__meta-row">
                      <span className="bm-search-autocomplete__brand">{brand}</span>
                    </span>
                  </span>
                  <ChevronRight className="bm-search-autocomplete__chevron" aria-hidden />
                </button>
              </li>
            );
          }

          const { asset } = item;
          const yearBadge = asset.yearRange?.trim();
          const imageSrc =
            asset.image?.includes("/assets/vehicles/cars-normalized/")
              ? asset.image.replace("/assets/vehicles/cars-normalized/", "/assets/cars-normalized/")
              : asset.image;
          return (
            <li key={`vehicle-${asset.id}-${index}`} className="bm-search-autocomplete__item" role="presentation">
              <button
                type="button"
                id={optionId}
                data-option-index={index}
                role="option"
                aria-selected={isActive}
                className={cn("bm-search-autocomplete__row", isActive && "is-active")}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onPick(item);
                }}
                onMouseEnter={() => onHoverIndex(index)}
              >
                <span className="bm-search-autocomplete__media">
                  <VehicleCardMedia
                    alt={asset.displayName}
                    className="bm-vehicle-card-media--autocomplete"
                    placeholderTitle={asset.displayName}
                    slug={asset.catalogId ?? asset.id}
                    src={imageSrc}
                    variant="thumb"
                  />
                </span>
                <span className="bm-search-autocomplete__body">
                  <span className="bm-search-autocomplete__title-row">
                    <span className="bm-search-autocomplete__title">{asset.displayName}</span>
                    {asset.generationName ? (
                      <span className="bm-search-autocomplete__gen-badge">{asset.generationName}</span>
                    ) : null}
                  </span>
                  <span className="bm-search-autocomplete__meta-row">
                    <span className="bm-search-autocomplete__brand">{brand}</span>
                    {yearBadge ? (
                      <span className="bm-search-autocomplete__year-badge">{yearBadge}</span>
                    ) : null}
                  </span>
                </span>
                <ChevronRight className="bm-search-autocomplete__chevron" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
