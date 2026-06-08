"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import clsx from "clsx";
import { apiFetchPublicBanners } from "@/lib/cms/cms-client";
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
          <picture className="absolute inset-0 block h-full w-full">
            {slide.imageMobile ? (
              <source media="(max-width: 767px)" srcSet={slide.imageMobile} />
            ) : null}
            <img
              src={slide.image}
              alt={slide.imageAlt}
              className="home-hero-slide__img h-full w-full object-cover"
              decoding="async"
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              onError={() => setImgError(true)}
            />
          </picture>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 px-6 text-center text-white">
            <ImageIcon className="mb-3 size-8 opacity-70" aria-hidden />
            <p className="text-sm font-black">{slide.title}</p>
            <p className="mt-1 text-xs font-medium text-slate-300">{slide.heading}</p>
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
  const [slides, setSlides] = useState<HeroSlide[]>(HERO_SLIDES);
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const activeSlide = slides[index];

  useEffect(() => {
    void (async () => {
      const res = await apiFetchPublicBanners();
      if (res.ok && res.slides.length > 0) {
        setSlides(res.slides);
        setIndex(0);
      }
    })();
  }, []);

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

  if (!activeSlide) {
    return (
      <section className="home-hero-carousel w-full" aria-label="메인 프로모션" data-home-section="main-banner">
        <div className="home-hero-carousel__shell rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
          <p className="text-sm font-bold text-slate-500">등록된 메인 배너가 없습니다.</p>
        </div>
      </section>
    );
  }

  const activePromoLabel = activeSlide.type === "image" ? activeSlide.promoLabel : undefined;
  const showDots = slides.length > 1 && slides.length <= 12;

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
      <div className="home-hero-carousel__shell">
        <div className="home-hero-carousel__glow" aria-hidden />

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="home-hero-carousel__nav home-hero-carousel__nav--prev"
              aria-label="이전 배너"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="home-hero-carousel__nav home-hero-carousel__nav--next"
              aria-label="다음 배너"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        ) : null}

        <div className="home-hero-carousel__frame">
          {activePromoLabel ? (
            <span className="home-hero-carousel__promo-label">{activePromoLabel}</span>
          ) : null}

          <div className="home-hero-carousel__inner">
            <div
              className="home-hero-carousel__viewport home-hero-carousel__viewport--unified relative w-full"
              data-hero-slide-id={activeSlide.type === "image" ? activeSlide.id : undefined}
            >
              {activeSlide.type === "image" ? (
                <HeroImageSlide slide={activeSlide} priority={index === 0} isActive />
              ) : (
                <HeroPlaceholderSlide slide={activeSlide} />
              )}
            </div>
          </div>

          {slides.length > 1 ? (
            <div className="home-hero-carousel__indicators">
              {showDots ? (
                <div className="home-hero-carousel__dots" role="tablist" aria-label="배너 슬라이드">
                  {slides.map((s, slideIndex) => (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      onClick={() => goTo(slideIndex)}
                      className={clsx(
                        "home-hero-carousel__dot",
                        slideIndex === index && "home-hero-carousel__dot--active",
                      )}
                      aria-label={`배너 ${slideIndex + 1}`}
                      aria-selected={slideIndex === index}
                    />
                  ))}
                </div>
              ) : null}
              <span className="home-hero-carousel__counter" aria-live="polite">
                {index + 1}/{slides.length}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
