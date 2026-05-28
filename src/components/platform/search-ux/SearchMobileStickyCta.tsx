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
    <div className={bm.stickyMobileBar} data-search-mobile-sticky>
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
