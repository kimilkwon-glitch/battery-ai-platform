"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  HOME_BENEFIT_FALLBACK_ICONS,
  type HomeBenefitCard,
} from "@/lib/home-benefits-data";

const PLACEHOLDER_GRADIENT: Record<HomeBenefitCard["fallbackIcon"], string> = {
  percent: "from-[#1e3a5f] via-[#2563eb] to-[#f59e0b]",
  service: "from-slate-800 via-[#1e40af] to-sky-500",
  store: "from-[#0f172a] via-[#1d4ed8] to-amber-500",
};

export function BenefitCardMedia({
  card,
  variant = "card",
  priority = false,
}: {
  card: HomeBenefitCard;
  variant?: "card" | "detail";
  priority?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const Icon = HOME_BENEFIT_FALLBACK_ICONS[card.fallbackIcon];
  const active = card.status === "active";
  const hasImage = Boolean(card.image) && !imageFailed;
  const isDetail = variant === "detail";
  const gradient = PLACEHOLDER_GRADIENT[card.fallbackIcon];
  const mobileSrc = card.imageMobile ?? card.image;

  return (
    <div
      className={clsx(
        "home-benefit-card-media relative w-full overflow-hidden bg-slate-100",
        isDetail
          ? "home-benefit-card-media--detail rounded-t-2xl"
          : "home-benefit-card-media--carousel home-benefit-card-media--banner aspect-[16/9]",
        hasImage && "home-benefit-card-media--photo",
        active && "home-benefit-card-media--active",
      )}
      data-benefit-id={!isDetail ? card.id : undefined}
    >
      {card.image && !imageFailed ? (
        <picture className="home-benefit-card-media__picture absolute inset-0 block h-full w-full max-w-none">
          {mobileSrc && mobileSrc !== card.image ? (
            <source media="(max-width: 767px)" srcSet={mobileSrc} />
          ) : null}
          <img
            src={card.image}
            alt={card.imageAlt ?? card.title}
            className="home-benefit-card-media__img h-full w-full object-cover object-center"
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            onError={() => setImageFailed(true)}
          />
        </picture>
      ) : null}

      {!hasImage ? (
        <div
          className={clsx(
            "absolute inset-0 flex flex-col justify-end bg-gradient-to-br from-slate-50 to-white p-4",
            isDetail ? "items-center justify-center gap-3 text-center" : "gap-2",
          )}
        >
          <span
            className={clsx(
              "flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200",
              active ? "text-[var(--bm-primary)]" : "text-slate-500",
            )}
          >
            <Icon className="size-5" strokeWidth={2} />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-black leading-snug text-slate-900">{card.title}</p>
            <p className="text-[11px] font-semibold leading-relaxed text-slate-600">
              {card.description}
            </p>
            {card.label ? (
              <p className="text-[10px] font-bold text-amber-800">{card.label}</p>
            ) : null}
          </div>
        </div>
      ) : (
        <div
          className={clsx(
            "pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-br opacity-0",
            gradient,
          )}
          aria-hidden
        />
      )}
    </div>
  );
}
