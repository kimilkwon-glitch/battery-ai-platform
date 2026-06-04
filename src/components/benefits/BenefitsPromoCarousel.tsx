"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { BenefitCardVisual } from "@/components/benefits/BenefitCardVisual";
import { BenefitsSectionHeader } from "@/components/benefits/BenefitsSectionHeader";
import type { BenefitCardConfig } from "@/lib/benefits-data";

const GAP_PX = 16;
const SWIPE_THRESHOLD_PX = 48;

/** 한 화면에 보이는 카드 수(다음 카드 살짝 노출) */
function useVisibleFraction() {
  const [fraction, setFraction] = useState(1.15);

  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const sm = window.matchMedia("(min-width: 640px)");
    const update = () => {
      if (lg.matches) setFraction(2.2);
      else if (sm.matches) setFraction(1.1);
      else setFraction(1.05);
    };
    update();
    lg.addEventListener("change", update);
    sm.addEventListener("change", update);
    return () => {
      lg.removeEventListener("change", update);
      sm.removeEventListener("change", update);
    };
  }, []);

  return fraction;
}

type Props = {
  cards: BenefitCardConfig[];
  showHeader?: boolean;
  ariaLabel?: string;
  variant?: "main" | "hub";
  className?: string;
  autoPlay?: boolean;
};

export function BenefitsPromoCarousel({
  cards,
  showHeader = true,
  ariaLabel = "배터리매니저 혜택",
  variant = "main",
  className,
  autoPlay = true,
}: Props) {
  const visibleFraction = useVisibleFraction();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pausedRef = useRef(false);
  const pointerRef = useRef({ startX: 0, active: false });

  const maxIndex = Math.max(0, cards.length - 1);
  const canScroll = cards.length > 1 && slideWidth > 0;
  const slideStep = slideWidth > 0 ? slideWidth + GAP_PX : 0;

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      const slide = (w - GAP_PX * (visibleFraction - 1)) / visibleFraction;
      setSlideWidth(Math.max(0, slide));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [visibleFraction]);

  const goTo = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(maxIndex, next)));
    },
    [maxIndex],
  );

  const go = useCallback(
    (delta: number) => {
      if (!canScroll) return;
      goTo(index + delta);
    },
    [canScroll, index, goTo],
  );

  useEffect(() => {
    if (!autoPlay || pausedRef.current || !canScroll) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 7000);
    return () => window.clearInterval(t);
  }, [autoPlay, canScroll, maxIndex]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a,button")) return;
    pointerRef.current = { startX: e.clientX, active: true };
    setDragging(true);
    pausedRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerRef.current.active) return;
    const dx = e.clientX - pointerRef.current.startX;
    pointerRef.current.active = false;
    setDragging(false);
    pausedRef.current = false;
    if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
      go(dx > 0 ? -1 : 1);
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerCancel = () => {
    pointerRef.current.active = false;
    setDragging(false);
    pausedRef.current = false;
  };

  if (cards.length === 0) return null;

  return (
    <section
      className={clsx(
        "home-benefits-carousel home-benefits-carousel--promo bm-zone bm-zone--benefit",
        variant === "main" && "home-benefits-carousel--main",
        variant === "hub" && "home-benefits-carousel--hub",
        className,
      )}
      data-home-section={variant === "main" ? "benefits-carousel" : undefined}
      data-benefits-carousel={variant}
      aria-label={ariaLabel}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      {showHeader ? <BenefitsSectionHeader className="mb-3 sm:mb-4" /> : null}

      <div className="home-benefits-carousel-shell relative mx-auto w-full max-w-full">
        <div
          ref={viewportRef}
          className={clsx(
            "home-benefits-viewport home-benefits-viewport--promo overflow-hidden rounded-2xl",
            dragging && "is-dragging",
          )}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          style={{ touchAction: "pan-y" }}
        >
          <div
            className={clsx(
              "home-benefits-track flex items-stretch",
              dragging ? "transition-none" : "transition-transform duration-300 ease-out",
            )}
            style={{
              gap: GAP_PX,
              transform: slideStep ? `translateX(-${index * slideStep}px)` : undefined,
            }}
          >
            {cards.map((card, i) => (
              <div
                key={card.id}
                className="home-benefit-slide flex shrink-0 self-stretch"
                style={{
                  width: slideWidth || undefined,
                  flexBasis: slideWidth || undefined,
                }}
              >
                <BenefitCardVisual card={card} priority={i === 0} />
              </div>
            ))}
          </div>
        </div>

        {canScroll ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              className="home-benefits-nav home-benefits-nav--prev"
              aria-label="이전 혜택"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={index >= maxIndex}
              className="home-benefits-nav home-benefits-nav--next"
              aria-label="다음 혜택"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        ) : null}

        {canScroll ? (
          <div className="home-benefits-carousel__indicators mt-3">
            <div className="home-benefits-carousel__dots" role="tablist" aria-label="혜택 슬라이드 위치">
              {cards.map((card, i) => (
                <button
                  key={card.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  onClick={() => goTo(i)}
                  className={clsx(
                    "home-benefits-carousel__dot",
                    i === index && "home-benefits-carousel__dot--active",
                  )}
                  aria-label={`혜택 ${i + 1}`}
                />
              ))}
            </div>
            <span className="home-benefits-carousel__counter" aria-live="polite">
              {index + 1}/{cards.length}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
