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
  const label = card.imageAlt ?? card.title;

  const inner = (
    <article
      className={clsx(
        "home-benefit-card home-benefit-card--banner home-benefit-card--image-only bm-card-unified block w-full overflow-hidden",
        active ? "home-benefit-card--active" : "home-benefit-card--inactive",
        !active && "cursor-default",
      )}
    >
      <BenefitCardMedia card={toMediaCard(card)} priority={priority} />
    </article>
  );

  if (!asLink || !active) {
    return inner;
  }

  return (
    <Link
      href={card.href}
      className="home-benefit-card-link block w-full rounded-2xl outline-none ring-amber-200 focus-visible:ring-2"
      aria-label={label}
    >
      {inner}
    </Link>
  );
}
