import Link from "next/link";
import { bm } from "@/lib/design-tokens";
import type { SearchUxCta } from "@/lib/search/search-ux-presentation";

function btnClass(tier: SearchUxCta["tier"]): string {
  if (tier === "primary") return `${bm.btnNavy} inline-flex text-xs`;
  if (tier === "secondary") return `${bm.btnSecondary} inline-flex text-xs`;
  return `${bm.btnGhost} inline-flex text-xs`;
}

export function SearchUxHeroCtas({ ctas }: { ctas: SearchUxCta[] }) {
  if (ctas.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2" data-search-hero-ctas>
      {ctas.map((cta) => (
        <Link key={`${cta.label}-${cta.href}`} className={btnClass(cta.tier)} href={cta.href}>
          {cta.label}
        </Link>
      ))}
    </div>
  );
}
