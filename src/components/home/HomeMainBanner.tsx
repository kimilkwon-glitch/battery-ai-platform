"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
  isActive,
}: {
  slide: Extract<HeroSlide, { type: "image" }>;
  isActive: boolean;
}) {
  const [desktopError, setDesktopError] = useState(false);
  const [mobileError, setMobileError] = useState(false);

  const inner = (
    <div className="home-hero-slide home-hero-slide--image relative h-full w-full bg-slate-100">
      {!desktopError ? (
        <Image
          src={slide.imageDesktop}
          alt=""
          fill
          className="home-hero-slide__img home-hero-slide__img--desktop hidden object-contain object-center sm:block"
          sizes="(max-width: 639px) 0px, min(100vw, 1240px)"
          priority={isActive}
          unoptimized
          onError={() => setDesktopError(true)}
        />
      ) : null}
      {!mobileError ? (
        <Image
          src={slide.imageMobile}
          alt=""
          fill
          className={clsx(
            "home-hero-slide__img home-hero-slide__img--mobile object-contain object-center",
            !desktopError && "sm:hidden",
          )}
          sizes="100vw"
          priority={isActive}
          unoptimized
          onError={() => setMobileError(true)}
        />
      ) : null}
      {desktopError && !mobileError ? (
        <Image
          src={slide.imageMobile}
          alt=""
          fill
          className="home-hero-slide__img hidden object-contain object-center sm:block"
          sizes="min(100vw, 1240px)"
          unoptimized
          onError={() => setMobileError(true)}
        />
      ) : null}
      {!(desktopError && mobileError) ? null : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-xs font-semibold text-slate-300">
          배너 이미지를 불러올 수 없습니다
        </div>
      )}
      <div className="sr-only">
        <p>{slide.title}</p>
        <p>{slide.subtitle}</p>
      </div>
    </div>
  );

  return (
    <Link
      href={slide.href}
      className="block h-full w-full outline-none ring-blue-300 focus-visible:ring-2"
      aria-label={`${slide.title} — 자세히 보기`}
    >
      {inner}
    </Link>
  );
}

export function HomeMainBanner() {
  const slides = HERO_SLIDES;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fade, setFade] = useState(true);

  const goTo = useCallback((next: number) => {
    const i = (next + slides.length) % slides.length;
    setFade(false);
    window.setTimeout(() => {
      setIndex(i);
      setFade(true);
    }, 120);
  }, [slides.length]);

  const go = useCallback((delta: number) => goTo(index + delta), [goTo, index]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = window.setInterval(() => go(1), HERO_CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [paused, slides.length, go]);

  const slide = slides[index]!;

  return (
    <section
      className="home-hero-carousel w-full"
      aria-label="메인 프로모션"
      data-home-section="main-banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="home-hero-carousel__frame relative overflow-hidden rounded-2xl border border-slate-200/90 shadow-[0_20px_56px_rgba(15,23,42,0.14)] sm:rounded-3xl">
        <div
          className={clsx(
            "home-hero-carousel__viewport relative h-[240px] transition-opacity duration-[400ms] ease-out sm:h-[300px] md:h-[340px] lg:h-[360px] xl:h-[380px]",
            fade ? "opacity-100" : "opacity-0",
          )}
        >
          {slide.type === "image" ? (
            <HeroImageSlide slide={slide} isActive={index === 0} />
          ) : (
            <HeroPlaceholderSlide slide={slide} />
          )}
        </div>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="home-hero-carousel__nav home-hero-carousel__nav--prev absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-900/40 text-white backdrop-blur-sm transition hover:bg-slate-900/60 sm:left-4 sm:size-11"
              aria-label="이전 배너"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="home-hero-carousel__nav home-hero-carousel__nav--next absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-900/40 text-white backdrop-blur-sm transition hover:bg-slate-900/60 sm:right-4 sm:size-11"
              aria-label="다음 배너"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-5">
              <div className="flex gap-1.5 rounded-full bg-slate-900/30 px-2 py-1 backdrop-blur-sm">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goTo(i)}
                    className={clsx(
                      "h-2 rounded-full transition-all duration-300",
                      i === index ? "w-5 bg-white" : "w-2 bg-white/45 hover:bg-white/70",
                    )}
                    aria-label={`배너 ${i + 1}`}
                    aria-current={i === index}
                  />
                ))}
              </div>
              <span className="rounded-full bg-slate-900/35 px-2 py-0.5 text-[10px] font-bold text-white/90 backdrop-blur-sm">
                {index + 1}/{slides.length}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
