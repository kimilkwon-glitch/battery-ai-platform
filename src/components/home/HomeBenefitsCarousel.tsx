"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { BenefitCardVisual } from "@/components/benefits/BenefitCardVisual";
import {
  BENEFIT_CARDS,
  BENEFITS_HUB_SUBTITLE,
  BENEFITS_HUB_TITLE,
} from "@/lib/benefits-data";

function useVisibleCount() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const sm = window.matchMedia("(min-width: 640px)");
    const update = () => {
      if (lg.matches) setCount(3);
      else if (sm.matches) setCount(2);
      else setCount(1);
    };
    update();
    lg.addEventListener("change", update);
    sm.addEventListener("change", update);
    return () => {
      lg.removeEventListener("change", update);
      sm.removeEventListener("change", update);
    };
  }, []);

  return count;
}

export function HomeBenefitsCarousel() {
  const cards = BENEFIT_CARDS;
  const visibleCount = useVisibleCount();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [slideStep, setSlideStep] = useState(0);

  const maxIndex = Math.max(0, cards.length - visibleCount);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const measure = () => {
      const gap = 12;
      const w = el.clientWidth;
      const step = (w - gap * (visibleCount - 1)) / visibleCount + gap;
      setSlideStep(step);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [visibleCount]);

  const goTo = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(maxIndex, next)));
    },
    [maxIndex],
  );

  const go = useCallback(
    (delta: number) => {
      if (maxIndex === 0) return;
      goTo(index + delta);
    },
    [index, maxIndex, goTo],
  );

  useEffect(() => {
    if (paused || cards.length <= visibleCount) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 6500);
    return () => window.clearInterval(t);
  }, [paused, cards.length, visibleCount, maxIndex]);

  return (
    <section
      className="home-benefits-carousel bm-zone bm-zone--benefit mt-10 sm:mt-12"
      data-home-section="benefits-carousel"
      aria-label={BENEFITS_HUB_TITLE}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="text-center">
        <h2 className="bm-section-eyebrow bm-section-eyebrow--benefit home-benefits-section-title">
          {BENEFITS_HUB_TITLE}
        </h2>
        <p className="mt-1 text-[11px] font-medium text-slate-500">{BENEFITS_HUB_SUBTITLE}</p>
      </div>

      <div className="home-benefits-carousel-shell relative mx-auto mt-4 max-w-[1100px] px-10 sm:px-11">
        <div ref={viewportRef} className="home-benefits-viewport overflow-hidden rounded-2xl">
          <div
            className="home-benefits-track flex gap-3 transition-[transform,opacity] duration-[320ms] ease-out will-change-transform"
            style={{
              transform: slideStep ? `translateX(-${index * slideStep}px)` : undefined,
            }}
          >
            {cards.map((card, i) => (
              <div
                key={card.id}
                className="home-benefit-slide shrink-0"
                style={{
                  width: slideStep
                    ? slideStep - 12
                    : `calc((100% - ${(visibleCount - 1) * 12}px) / ${visibleCount})`,
                }}
              >
                <BenefitCardVisual card={card} emphasis={i >= index && i < index + visibleCount} />
              </div>
            ))}
          </div>
        </div>

        {cards.length > visibleCount ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              className="home-benefits-nav home-benefits-nav--prev absolute left-0 top-[calc(50%-1.25rem)] z-10 flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-35"
              aria-label="이전 혜택"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={index >= maxIndex}
              className="home-benefits-nav home-benefits-nav--next absolute right-0 top-[calc(50%-1.25rem)] z-10 flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-35"
              aria-label="다음 혜택"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        ) : null}

        {cards.length > 1 ? (
          <div className="mt-4 flex justify-center gap-1.5">
            {Array.from({ length: maxIndex + 1 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={clsx(
                  "h-2 rounded-full transition-all duration-300",
                  i === index ? "w-5 bg-amber-600" : "w-2 bg-slate-300 hover:bg-slate-400",
                )}
                aria-label={`혜택 ${i + 1}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
