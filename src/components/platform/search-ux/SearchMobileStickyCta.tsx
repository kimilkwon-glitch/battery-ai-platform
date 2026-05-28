"use client";

import Link from "next/link";
import { bm } from "@/lib/design-tokens";
import type { SearchUxCta } from "@/lib/search/search-ux-presentation";

function stickyBtnClass(tier: SearchUxCta["tier"]): string {
  if (tier === "primary") return `${bm.btnNavy} flex-1 text-xs`;
  if (tier === "secondary") return `${bm.btnSecondary} flex-1 text-xs`;
  return `${bm.btnGhost} flex-1 text-xs`;
}

export function SearchMobileStickyCta({ actions }: { actions: SearchUxCta[] }) {
  if (actions.length === 0) return null;
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-3 py-2.5 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md md:hidden"
      data-search-mobile-sticky
    >
      <div className="mx-auto flex max-w-[1280px] gap-2">
        {actions.slice(0, 3).map((cta) => (
          <Link key={`${cta.label}-${cta.href}`} className={stickyBtnClass(cta.tier)} href={cta.href}>
            {cta.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
