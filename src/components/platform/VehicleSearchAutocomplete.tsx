"use client";

import { ChevronRight } from "lucide-react";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { vehicleAssetBrandLabel, type VehicleAsset } from "@/lib/car-assets";
import { cn } from "@/lib/utils";

type Props = {
  suggestions: VehicleAsset[];
  activeIndex: number;
  onPick: (asset: VehicleAsset) => void;
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
      aria-label="차량 검색 결과"
    >
      <div className="bm-search-autocomplete__head">
        <p className="bm-search-autocomplete__head-title">세대별 차량을 선택하세요</p>
        <span className="bm-search-autocomplete__head-count">{suggestions.length}건</span>
      </div>
      <ul className="bm-search-autocomplete__list">
        {suggestions.map((asset, index) => {
          const isActive = index === activeIndex;
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
                  onPick(asset);
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
                    <span className="bm-search-autocomplete__brand">{vehicleAssetBrandLabel(asset.brand)}</span>
                    {yearBadge ? (
                      <span className="bm-search-autocomplete__year-badge">{yearBadge}</span>
                    ) : null}
                  </span>
                  {asset.batteryNotes ? (
                    <span className="bm-search-autocomplete__hint">{asset.batteryNotes}</span>
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
