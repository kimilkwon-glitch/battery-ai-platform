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
  asLink = true,
  priority = false,
}: {
  card: BenefitCardConfig;
  asLink?: boolean;
  priority?: boolean;
}) {
  const active = card.status === "active";
  const inner = (
    <article
      className={clsx(
        "home-benefit-card home-benefit-card--promo bm-card-unified flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm",
        active
          ? "home-benefit-card--active border-amber-200/90"
          : "border-slate-200/90 bg-slate-50/50",
        !active && "cursor-default",
      )}
    >
      <BenefitCardMedia card={toMediaCard(card)} priority={priority} />
      <div className="home-benefit-card__body home-benefit-card__body--promo flex shrink-0 flex-col gap-1 px-3 pb-3 pt-2.5 sm:px-3.5 sm:pb-3.5 sm:pt-3">
        <span
          className={clsx(
            "home-benefit-card__badge inline-flex w-fit shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wide",
            active
              ? "bg-amber-500/15 text-amber-900 ring-1 ring-amber-200"
              : "bg-slate-200/60 text-slate-500",
          )}
        >
          {card.label}
        </span>
        <h3 className="home-benefit-card__title line-clamp-2 text-[0.9375rem] font-black leading-snug text-slate-900 sm:text-base">
          {card.title}
        </h3>
        {asLink && active ? (
          <span className="home-benefit-card__cta mt-1 text-[11px] font-black text-amber-800">
            혜택 자세히 보기 →
          </span>
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
