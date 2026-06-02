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
        "home-benefit-card bm-card-unified flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm",
        active
          ? "home-benefit-card--active border-amber-200/90"
          : "border-slate-200/90 bg-slate-50/50",
        !active && "cursor-default",
      )}
    >
      <BenefitCardMedia card={toMediaCard(card)} priority={priority} />
      <div className="home-benefit-card__body flex min-h-0 flex-1 flex-col gap-1.5 p-4 sm:gap-2 sm:p-5">
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
        <h3 className="home-benefit-card__title text-base font-black leading-snug text-slate-900">
          {card.title}
        </h3>
        <p className="home-benefit-card__desc text-xs font-semibold leading-relaxed text-slate-600">
          {card.description}
        </p>
        {card.note ? (
          <p className="home-benefit-card__meta min-h-[2rem] text-[10px] font-medium leading-snug text-slate-400">
            {card.note}
          </p>
        ) : (
          <span className="home-benefit-card__meta min-h-[2rem]" aria-hidden />
        )}
        {asLink && active ? (
          <p className="home-benefit-card__cta mt-auto shrink-0 pt-3 text-[11px] font-black text-amber-800">
            혜택 자세히 보기 →
          </p>
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
