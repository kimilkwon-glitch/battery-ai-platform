"use client";

import { ChevronRight } from "lucide-react";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import {
  customerSuggestionBrandLabel,
  customerSuggestionTitle,
  type CustomerSearchSuggestion,
} from "@/lib/search/customer-search-autocomplete";
import { cn } from "@/lib/utils";

type Props = {
  suggestions: CustomerSearchSuggestion[];
  activeIndex: number;
  onPick: (item: CustomerSearchSuggestion) => void;
  onHoverIndex: (index: number) => void;
  /** 메인 통합 검색바 — 타입 선택 영역까지 패널 폭 확장 */
  layout?: "default" | "hero-compound" | "hero-flow";
  className?: string;
};

export function VehicleSearchAutocomplete({
  suggestions,
  activeIndex,
  onPick,
  onHoverIndex,
  layout = "default",
  className,
}: Props) {
  if (suggestions.length === 0) return null;

  return (
    <div
      className={cn(
        "bm-search-autocomplete",
        layout === "hero-compound" && "bm-search-autocomplete--hero-compound",
        layout === "hero-flow" && "bm-search-autocomplete--hero-flow",
        className,
      )}
      role="listbox"
      aria-label="검색 자동완성"
    >
      <div className="bm-search-autocomplete__head">
        <p className="bm-search-autocomplete__head-title">차종·배터리 규격</p>
        <span className="bm-search-autocomplete__head-count">{suggestions.length}건</span>
      </div>
      <ul className="bm-search-autocomplete__list">
        {suggestions.map((item, index) => {
          const isActive = index === activeIndex;
          const title = customerSuggestionTitle(item);
          const brand = customerSuggestionBrandLabel(item);

          if (item.kind === "battery") {
            return (
              <li key={item.id} className="bm-search-autocomplete__item">
                <button
                  type="button"
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
                    <span className="bm-search-autocomplete__hint">{item.subtitle}</span>
                  </span>
                  <ChevronRight className="bm-search-autocomplete__chevron" aria-hidden />
                </button>
              </li>
            );
          }

          const { asset, batterySummary } = item;
          const yearBadge = asset.yearRange?.trim();
          return (
            <li key={asset.id} className="bm-search-autocomplete__item">
              <button
                type="button"
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
                    src={asset.image}
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
                  {batterySummary ? (
                    <span className="bm-search-autocomplete__hint">{batterySummary}</span>
                  ) : null}
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
