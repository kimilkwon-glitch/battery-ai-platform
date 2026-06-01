"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isBatteryWishlisted,
  normalizeWishlistCode,
  toggleBatteryWishlist,
} from "@/lib/battery-wishlist-storage";
type Props = {
  code: string;
  className?: string;
  size?: "sm" | "md";
  /** 카드 우측 상단 오버레이 */
  overlay?: boolean;
};

export function BatteryWishlistButton({ code, className = "", size = "md", overlay = false }: Props) {
  const [saved, setSaved] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    setSaved(isBatteryWishlisted(code));
  }, [code]);

  const toggle = useCallback(() => {
    const next = toggleBatteryWishlist(code);
    setSaved(next);
    setHint(next ? "찜에 저장했습니다" : "찜에서 제거했습니다");
    const t = window.setTimeout(() => setHint(null), 2000);
    return () => window.clearTimeout(t);
  }, [code]);

  const dim = size === "sm" ? "size-8" : "size-10";
  const icon = size === "sm" ? "text-base" : "text-lg";

  const shell = overlay
    ? `absolute right-2 top-2 z-10 ${dim} rounded-full bg-white/95 shadow-sm ring-1 ring-slate-200/90 backdrop-blur-sm`
    : `${dim} rounded-xl bg-white ring-1 ring-slate-200`;

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        aria-label={saved ? `${code} 찜 해제` : `${code} 찜 저장`}
        title={saved ? "찜 해제" : "찜 저장"}
        className={`${shell} inline-flex items-center justify-center transition hover:bg-rose-50 hover:ring-rose-200`}
      >
        <span className={`${icon} leading-none ${saved ? "text-rose-600" : "text-slate-400"}`} aria-hidden>
          {saved ? "♥" : "♡"}
        </span>
      </button>
      {hint ? (
        <span
          role="status"
          className="absolute top-full right-0 z-20 mt-1 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white shadow-md"
        >
          {hint}
        </span>
      ) : null}
      <span className="sr-only">{normalizeWishlistCode(code)}</span>
    </div>
  );
}
