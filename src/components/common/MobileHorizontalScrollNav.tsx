"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";

type Props = {
  children: ReactNode;
  className?: string;
  scrollClassName?: string;
  ariaLabel?: string;
  /** 탭 전환 등 스크롤 초기화 트리거 */
  resetKey?: string;
};

/** 모바일 가로 스크롤 레일 — 우측(·좌측) 화살표 네비게이션 */
export function MobileHorizontalScrollNav({
  children,
  className,
  scrollClassName,
  ariaLabel = "가로 목록",
  resetKey,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(maxScroll > 8 && el.scrollLeft < maxScroll - 8);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
    updateButtons();
  }, [resetKey, updateButtons]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    const ro = new ResizeObserver(updateButtons);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
      ro.disconnect();
    };
  }, [updateButtons, children]);

  const scrollByDir = (dir: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const delta = el.clientWidth * 0.85 * (dir === "next" ? 1 : -1);
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className={clsx("mobile-hscroll-nav", className)}>
      <div
        ref={scrollRef}
        className={scrollClassName}
        aria-label={ariaLabel}
        role="region"
      >
        {children}
      </div>
      <button
        type="button"
        className={clsx(
          "mobile-hscroll-nav__btn mobile-hscroll-nav__btn--prev",
          !canPrev && "mobile-hscroll-nav__btn--hidden",
        )}
        aria-label={`${ariaLabel} 이전`}
        onClick={() => scrollByDir("prev")}
      >
        <ChevronLeft strokeWidth={2.5} aria-hidden />
      </button>
      <button
        type="button"
        className={clsx(
          "mobile-hscroll-nav__btn mobile-hscroll-nav__btn--next",
          !canNext && "mobile-hscroll-nav__btn--hidden",
        )}
        aria-label={`${ariaLabel} 다음`}
        onClick={() => scrollByDir("next")}
      >
        <ChevronRight strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}

export function MobileScrollHint({ text = "더 보기" }: { text?: string }) {
  return (
    <span className="mobile-hscroll-hint" aria-hidden>
      {text} →
    </span>
  );
}
