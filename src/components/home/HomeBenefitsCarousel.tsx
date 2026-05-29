"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import {
  HOME_BENEFIT_CARDS,
  HOME_BENEFITS_SUBTITLE,
  HOME_BENEFITS_TITLE,
  type HomeBenefitCard,
} from "@/lib/home-benefits-data";

function BenefitCard({ card }: { card: HomeBenefitCard }) {
  const active = card.status === "active";
  return (
    <article
      className={clsx(
        "home-benefit-card min-w-[calc(100%-0.5rem)] shrink-0 snap-center rounded-2xl border p-4 transition duration-[220ms] motion-safe:hover:-translate-y-0.5 sm:min-w-[calc(50%-0.375rem)] lg:min-w-[calc(33.333%-0.5rem)]",
        active
          ? "border-blue-100 bg-gradient-to-br from-white to-blue-50/40 shadow-sm hover:shadow-md"
          : "border-dashed border-slate-200 bg-slate-50/60",
      )}
    >
      <p className="text-sm font-black text-slate-900">{card.title}</p>
      {!active ? (
        <span className="mt-1 inline-block text-[9px] font-black uppercase text-slate-400">
          준비중
        </span>
      ) : null}
      <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">{card.description}</p>
      {card.footnote ? (
        <p className="mt-2 text-[10px] font-medium text-slate-400">{card.footnote}</p>
      ) : null}
    </article>
  );
}

export function HomeBenefitsCarousel() {
  const cards = HOME_BENEFIT_CARDS;
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const scrollToIndex = useCallback((next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[next] as HTMLElement | undefined;
    if (!child) return;
    const left = child.offsetLeft - track.offsetLeft;
    track.scrollTo({ left, behavior: "smooth" });
    setIndex(next);
  }, []);

  const go = useCallback(
    (delta: number) => {
      const next = (index + delta + cards.length) % cards.length;
      scrollToIndex(next);
    },
    [index, cards.length, scrollToIndex],
  );

  useEffect(() => {
    if (paused || cards.length <= 1) return;
    const t = window.setInterval(() => go(1), 6000);
    return () => window.clearInterval(t);
  }, [paused, go, cards.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const children = Array.from(track.children) as HTMLElement[];
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      children.forEach((el, i) => {
        const mid = el.offsetLeft + el.offsetWidth / 2;
        const d = Math.abs(mid - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setIndex(best);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      className="home-benefits-carousel mt-10 sm:mt-12"
      data-home-section="benefits-carousel"
      aria-label={HOME_BENEFITS_TITLE}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="text-center">
        <h2 className="text-[11px] font-black uppercase tracking-wide text-slate-500">
          {HOME_BENEFITS_TITLE}
        </h2>
        <p className="mt-1 text-[11px] font-medium text-slate-500">{HOME_BENEFITS_SUBTITLE}</p>
      </div>

      <div className="relative mt-4">
        <div
          ref={trackRef}
          className="home-benefits-track flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {cards.map((card) => (
            <BenefitCard key={card.id} card={card} />
          ))}
        </div>

        {cards.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute -left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-2 shadow-md hover:bg-white sm:flex"
              aria-label="이전 혜택"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute -right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-2 shadow-md hover:bg-white sm:flex"
              aria-label="다음 혜택"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="mt-3 flex justify-center gap-1.5">
              {cards.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToIndex(i)}
                  className={clsx(
                    "size-2 rounded-full transition",
                    i === index ? "bg-blue-600" : "bg-slate-300 hover:bg-slate-400",
                  )}
                  aria-label={`혜택 ${i + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
