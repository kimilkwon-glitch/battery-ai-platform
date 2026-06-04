"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import clsx from "clsx";
import { HERO_CAROUSEL_INTERVAL_MS, HERO_SLIDES, type HeroSlide } from "@/lib/hero-slides-data";

function HeroPlaceholderSlide({ slide }: { slide: Extract<HeroSlide, { type: "placeholder" }> }) {
  return (
    <div className="home-hero-slide home-hero-slide--placeholder relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-[#1e3a5f] to-slate-900 px-6 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/10 text-white/80 ring-1 ring-white/15 sm:size-16">
        <ImageIcon className="size-7 sm:size-8" aria-hidden />
      </span>
      <p className="text-base font-black text-white sm:text-lg">{slide.title}</p>
      <p className="mt-2 max-w-md text-sm font-medium text-slate-300 sm:text-base">{slide.subtitle}</p>
    </div>
  );
}

function HeroImageSlide({
  slide,
  priority,
  isActive,
}: {
  slide: Extract<HeroSlide, { type: "image" }>;
  priority?: boolean;
  isActive: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={slide.href}
      tabIndex={isActive ? 0 : -1}
      className="home-hero-slide__link block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      aria-label={`${slide.imageAlt} — 자세히 보기`}
      aria-hidden={!isActive}
    >
      <div className="home-hero-slide home-hero-slide--image relative h-full w-full overflow-hidden">
        {!imgError ? (
          <img
            src={slide.image}
            alt={slide.imageAlt}
            className="home-hero-slide__img absolute inset-0 h-full w-full"
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-xs font-semibold text-slate-300">
            배너 이미지를 불러올 수 없습니다
          </div>
        )}
        <div className="sr-only">
          <p>{slide.title}</p>
          <p>{slide.heading}</p>
          <p>{slide.description}</p>
        </div>
      </div>
    </Link>
  );
}

export function HomeMainBanner() {
  const slides = HERO_SLIDES;
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const activeSlide = slides[index]!;

  const goTo = useCallback(
    (next: number) => {
      setIndex((next + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = window.setInterval(() => {
      if (pausedRef.current) return;
      setIndex((i) => (i + 1) % slides.length);
    }, HERO_CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [slides.length]);

  return (
    <section
      className="home-hero-carousel w-full"
      aria-label="메인 프로모션"
      data-home-section="main-banner"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div className="home-hero-carousel__frame relative w-full overflow-hidden rounded-2xl border border-slate-200/80 shadow-[0_20px_56px_rgba(15,23,42,0.14)] sm:rounded-3xl">
        <div
          className="home-hero-carousel__viewport home-hero-carousel__viewport--unified relative w-full"
          data-hero-slide-id={activeSlide.type === "image" ? activeSlide.id : undefined}
        >
          {slides.map((s, i) => {
            const isActive = i === index;
            return (
              <div
                key={s.id}
                hidden={!isActive}
                className="home-hero-carousel__slide-layer absolute inset-0 h-full w-full"
              >
                {s.type === "image" ? (
                  <HeroImageSlide slide={s} priority={i === 0} isActive={isActive} />
                ) : (
                  <HeroPlaceholderSlide slide={s} />
                )}
              </div>
            );
          })}
        </div>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="home-hero-carousel__nav home-hero-carousel__nav--prev absolute left-2 top-1/2 z-[15] flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-900/60 text-white shadow-lg sm:left-3 sm:size-11"
              aria-label="이전 배너"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="home-hero-carousel__nav home-hero-carousel__nav--next absolute right-2 top-1/2 z-[15] flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-900/60 text-white shadow-lg sm:right-3 sm:size-11"
              aria-label="다음 배너"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-5">
              <div className="flex gap-1.5 rounded-full bg-slate-900/40 px-2 py-1">
                {slides.map((s, slideIndex) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goTo(slideIndex)}
                    className={clsx(
                      "h-2 rounded-full",
                      slideIndex === index ? "w-5 bg-white" : "w-2 bg-white/45",
                    )}
                    aria-label={`배너 ${slideIndex + 1}`}
                    aria-current={slideIndex === index}
                  />
                ))}
              </div>
              <span className="rounded-full bg-slate-900/40 px-2 py-0.5 text-[10px] font-bold text-white/90">
                {index + 1}/{slides.length}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
