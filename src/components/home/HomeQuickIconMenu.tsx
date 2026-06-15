"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HOME_QUICK_ICON_ITEMS } from "@/lib/home-quick-icons-data";

function QuickIconTitle({ label, mobileLines }: { label: string; mobileLines?: [string, string] }) {
  if (!mobileLines) {
    return <span className="home-quick-icon-card__title quick-card__title">{label}</span>;
  }

  return (
    <span className="home-quick-icon-card__title quick-card__title">
      <span className="home-quick-icon-card__title-full">{label}</span>
      <span className="home-quick-icon-card__title-stacked">
        {mobileLines.map((line) => (
          <span key={line} className="home-quick-icon-card__title-line">
            {line}
          </span>
        ))}
      </span>
    </span>
  );
}

type ScrollMetrics = {
  thumbWidthPct: number;
  thumbLeftPct: number;
  show: boolean;
};

function readScrollMetrics(el: HTMLUListElement): ScrollMetrics {
  const maxScroll = el.scrollWidth - el.clientWidth;
  if (maxScroll <= 4) {
    return { thumbWidthPct: 100, thumbLeftPct: 0, show: false };
  }
  const thumbWidthPct = Math.max(22, (el.clientWidth / el.scrollWidth) * 100);
  const travelPct = 100 - thumbWidthPct;
  const thumbLeftPct = (el.scrollLeft / maxScroll) * travelPct;
  return { thumbWidthPct, thumbLeftPct, show: true };
}

/** 혜택 아래 — 퀵 카테고리 아이콘 (8개) */
export function HomeQuickIconMenu() {
  const gridRef = useRef<HTMLUListElement>(null);
  const [scrollMetrics, setScrollMetrics] = useState<ScrollMetrics>({
    thumbWidthPct: 100,
    thumbLeftPct: 0,
    show: false,
  });

  const syncScrollMetrics = useCallback(() => {
    const el = gridRef.current;
    if (!el) return;
    setScrollMetrics(readScrollMetrics(el));
  }, []);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    syncScrollMetrics();
    el.addEventListener("scroll", syncScrollMetrics, { passive: true });
    window.addEventListener("resize", syncScrollMetrics);

    const ro = new ResizeObserver(syncScrollMetrics);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", syncScrollMetrics);
      window.removeEventListener("resize", syncScrollMetrics);
      ro.disconnect();
    };
  }, [syncScrollMetrics]);

  return (
    <nav
      className="home-quick-icons"
      data-home-section="quick-icons"
      aria-label="주요 안내 바로가기"
    >
      <h2 className="home-quick-icons__heading">빠른메뉴</h2>
      <ul ref={gridRef} className="home-quick-icons__grid">
        {HOME_QUICK_ICON_ITEMS.map((item) => {
          const isVehicle = item.iconVariant === "vehicle";
          return (
            <li key={item.id} className="home-quick-icons__item">
              <Link
                href={item.href}
                className={`home-quick-icon-card quick-card quick-card--${item.accent}`}
                data-quick-accent={item.accent}
                data-quick-icon-variant={item.iconVariant ?? "default"}
                aria-label={`${item.label}, ${item.description}`}
              >
                <span className="home-quick-icon-card__icon-wrap" aria-hidden>
                  <span className="home-quick-icon-card__icon-bg quick-card__icon">
                    <Image
                      src={item.imageSrc}
                      alt=""
                      width={isVehicle ? 50 : 42}
                      height={isVehicle ? 50 : 42}
                      className="home-quick-icon-card__image"
                      sizes={isVehicle ? "(max-width: 639px) 32px, 50px" : "(max-width: 639px) 32px, 42px"}
                    />
                  </span>
                </span>
                <span className="home-quick-icon-card__text">
                  <span className="home-quick-icon-card__title-wrap home-quick-icon-card__title-wrap--desktop">
                    <QuickIconTitle label={item.label} mobileLines={item.titleMobileLines} />
                  </span>
                  <span className="home-quick-icon-card__title-wrap home-quick-icon-card__title-wrap--mobile">
                    <span className="home-quick-icon-card__title home-quick-icon-card__title--compact quick-card__title">
                      {item.mobileLabel}
                    </span>
                  </span>
                  <span className="home-quick-icon-card__title-accent" aria-hidden />
                  <span className="home-quick-icon-card__desc-wrap">
                    <span className="home-quick-icon-card__desc quick-card__desc">{item.description}</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {scrollMetrics.show ? (
        <div
          className="home-quick-icons__scroll-indicator"
          aria-hidden
          data-home-quick-scroll-indicator
        >
          <div
            className="home-quick-icons__scroll-thumb"
            style={{
              width: `${scrollMetrics.thumbWidthPct}%`,
              transform: `translateX(${scrollMetrics.thumbLeftPct}%)`,
            }}
          />
        </div>
      ) : null}
    </nav>
  );
}
