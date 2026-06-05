"use client";

import { useCallback, useRef, useState } from "react";
import { HomeTrustStoryCard } from "@/components/home/HomeTrustStoryCard";
import type { HomeReplacementStoryCard } from "@/lib/home-replacement-stories-data";

const SWIPE_THRESHOLD_PX = 48;

export function HomeReplacementStoriesMobileCarousel({
  cards,
}: {
  cards: HomeReplacementStoryCard[];
}) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const last = cards.length - 1;

  const goTo = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(last, next)));
    },
    [last],
  );

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
      if (dx < 0) goTo(index + 1);
      else goTo(index - 1);
    }
    touchStart.current = null;
  };

  if (cards.length === 0) return null;

  return (
    <div
      className="home-replacement-stories__mobile-carousel"
      aria-roledescription="carousel"
      aria-label="교체 후기"
    >
      <div
        className="home-replacement-stories__mobile-carousel-viewport"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <ul
          className="home-replacement-stories__mobile-carousel-track"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
          aria-live="polite"
        >
          {cards.map((card) => (
            <li
              key={card.id}
              className="home-replacement-stories__mobile-carousel-slide"
              aria-roledescription="slide"
            >
              <div className="home-trust-story-card home-trust-story-card--mobile-slide">
                <HomeTrustStoryCard card={card} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="home-replacement-stories__mobile-carousel-footer">
        <p className="home-replacement-stories__mobile-carousel-count" aria-live="polite">
          <span className="sr-only">현재 후기</span>
          {index + 1} / {cards.length}
        </p>
        <div className="home-replacement-stories__mobile-carousel-dots" role="tablist" aria-label="후기 선택">
          {cards.map((card, i) => (
            <button
              key={card.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`후기 ${i + 1}`}
              className={
                i === index
                  ? "home-replacement-stories__mobile-carousel-dot home-replacement-stories__mobile-carousel-dot--active"
                  : "home-replacement-stories__mobile-carousel-dot"
              }
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
