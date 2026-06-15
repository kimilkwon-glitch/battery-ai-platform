"use client";

import type { HorizontalScrollMetrics } from "@/hooks/useHorizontalScrollIndicator";

type Props = {
  metrics: HorizontalScrollMetrics;
  className?: string;
};

export function HorizontalScrollIndicator({ metrics, className = "hscroll-indicator" }: Props) {
  if (!metrics.show) return null;

  return (
    <div className={className} aria-hidden data-hscroll-indicator>
      <div
        className={`${className}__thumb`}
        style={{
          width: `${metrics.thumbWidthPct}%`,
          transform: `translateX(${metrics.thumbLeftPct}%)`,
        }}
      />
    </div>
  );
}
