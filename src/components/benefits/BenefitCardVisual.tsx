"use client";

import Link from "next/link";
import clsx from "clsx";
import { BenefitCardMedia } from "@/components/home/BenefitCardMedia";
import type { BenefitCardConfig } from "@/lib/benefits-data";
import type { HomeBenefitCard } from "@/lib/home-benefits-data";

function toMediaCard(card: BenefitCardConfig): HomeBenefitCard {
  return card;
}

export function BenefitCardVisual({
  card,
  emphasis,
  asLink = true,
}: {
  card: BenefitCardConfig;
  emphasis?: boolean;
  asLink?: boolean;
}) {
  const active = card.status === "active";
  const inner = (
    <article
      className={clsx(
        "home-benefit-card bm-card-unified flex h-full min-h-[240px] flex-col overflow-hidden bg-white transition-[transform,box-shadow,opacity] duration-[280ms] ease-out",
        asLink && active && "motion-safe:hover:-translate-y-1",
        emphasis ? "opacity-100" : "opacity-[0.94]",
        active ? "home-benefit-card--active border-amber-200/80" : "border-slate-200/90 bg-slate-50/50",
        !active && "cursor-default",
      )}
    >
      <BenefitCardMedia card={toMediaCard(card)} />
      <div className="flex flex-1 flex-col p-4">
        <span
          className={clsx(
            "inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide",
            active
              ? "bg-amber-500/15 text-amber-900 ring-1 ring-amber-200"
              : "bg-slate-200/60 text-slate-500",
          )}
        >
          {card.label}
        </span>
        <h3 className="mt-2 text-base font-black text-slate-900">{card.title}</h3>
        <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-600">{card.description}</p>
        {card.note ? (
          <p className="mt-auto pt-3 text-[10px] font-medium leading-snug text-slate-400">{card.note}</p>
        ) : (
          <p className="mt-auto pt-3 text-[10px] text-transparent">.</p>
        )}
        {asLink && active ? (
          <p className="mt-2 text-[11px] font-black text-amber-800">혜택 자세히 보기 →</p>
        ) : null}
      </div>
    </article>
  );

  if (!asLink || !active) {
    return inner;
  }

  return (
    <Link href={card.href} className="block h-full rounded-2xl outline-none ring-amber-200 focus-visible:ring-2">
      {inner}
    </Link>
  );
}
