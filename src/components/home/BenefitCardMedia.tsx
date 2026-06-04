"use client";

import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";
import {
  HOME_BENEFIT_FALLBACK_ICONS,
  type HomeBenefitCard,
} from "@/lib/home-benefits-data";

const BENEFIT_IMAGE_SIZES =
  "(max-width: 639px) 92vw, (max-width: 1023px) 46vw, (max-width: 1399px) 42vw, 640px";

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
        <Image
          src={card.image}
          alt={card.imageAlt ?? card.title}
          fill
          sizes={isDetail ? "(max-width: 639px) 100vw, 672px" : BENEFIT_IMAGE_SIZES}
          quality={100}
          priority={priority}
          unoptimized
          className="home-benefit-card-media__img"
          onError={() => setImageFailed(true)}
        />
      ) : null}

      <div
        className={clsx(
          "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
          gradient,
          hasImage ? "pointer-events-none opacity-0" : "opacity-100",
          isDetail ? "flex-col gap-3 px-5 py-6 text-center" : "px-4 py-4",
        )}
        aria-hidden={hasImage}
      >
        <span
          className={clsx(
            "flex size-12 items-center justify-center rounded-2xl shadow-md ring-1 ring-white/30",
            active ? "bg-white/95 text-[var(--bm-primary)]" : "bg-white/80 text-slate-500",
          )}
        >
          <Icon className="size-6" strokeWidth={2} />
        </span>
        {isDetail ? (
          <>
            <p className="max-w-[14rem] text-xs font-black leading-snug text-white drop-shadow-sm">
              {card.title}
            </p>
            <p className="max-w-[16rem] text-[10px] font-semibold leading-relaxed text-white/90">
              {card.label}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
