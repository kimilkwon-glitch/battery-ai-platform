"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { VehicleSearchRailCard } from "@/components/platform/VehicleSearchRailCard";
import type { VehiclesBrowseItem } from "@/lib/vehicles-browse-data";

const SCROLL_STEP = 300;

export function ManufacturerVehicleRail({
  label,
  items,
}: {
  label: string;
  items: VehiclesBrowseItem[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, items.length]);

  const scrollBy = (dir: -1 | 1) => {
    scrollerRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: "smooth" });
  };

  const showNav = canScrollLeft || canScrollRight;

  return (
    <section className="vehicle-search-rail" aria-label={`${label} 차종`}>
      <div className="vehicle-search-rail__header">
        <div className="vehicle-search-rail__heading">
          <h2 className="vehicle-search-rail__title">{label}</h2>
          <div className="vehicle-search-rail__line" aria-hidden />
        </div>
        {showNav ? (
          <div className="vehicle-search-rail__nav">
            <button
              type="button"
              className="vehicle-search-rail__nav-btn"
              aria-label={`${label} 이전 차종`}
              disabled={!canScrollLeft}
              onClick={() => scrollBy(-1)}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              className="vehicle-search-rail__nav-btn"
              aria-label={`${label} 다음 차종`}
              disabled={!canScrollRight}
              onClick={() => scrollBy(1)}
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={scrollerRef}
        className={clsx("vehicle-search-rail__scroller", showNav && "vehicle-search-rail__scroller--scrollable")}
        tabIndex={0}
      >
        <div className="vehicle-search-rail__track">
          {items.map((item) => (
            <div key={item.key} className="vehicle-search-rail__slide">
              <VehicleSearchRailCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
