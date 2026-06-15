"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type HorizontalScrollMetrics = {
  thumbWidthPct: number;
  thumbLeftPct: number;
  show: boolean;
};

function readScrollMetrics(el: HTMLElement): HorizontalScrollMetrics {
  const maxScroll = el.scrollWidth - el.clientWidth;
  if (maxScroll <= 4) {
    return { thumbWidthPct: 100, thumbLeftPct: 0, show: false };
  }
  const thumbWidthPct = Math.max(22, (el.clientWidth / el.scrollWidth) * 100);
  const travelPct = 100 - thumbWidthPct;
  const thumbLeftPct = (el.scrollLeft / maxScroll) * travelPct;
  return { thumbWidthPct, thumbLeftPct, show: true };
}

/** 가로 스크롤 컨테이너 + 하단 thumb 인디케이터 연동 */
export function useHorizontalScrollIndicator<T extends HTMLElement>() {
  const scrollRef = useRef<T | null>(null);
  const [metrics, setMetrics] = useState<HorizontalScrollMetrics>({
    thumbWidthPct: 100,
    thumbLeftPct: 0,
    show: false,
  });

  const sync = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setMetrics(readScrollMetrics(el));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    const ro = new ResizeObserver(sync);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      ro.disconnect();
    };
  }, [sync]);

  return { scrollRef, metrics, sync };
}
