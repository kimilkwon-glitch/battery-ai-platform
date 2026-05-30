"use client";

import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";
import {
  HOME_BENEFIT_FALLBACK_ICONS,
  type HomeBenefitCard,
} from "@/lib/home-benefits-data";

/** 혜택 카드 media — 1000×600 (5:3) 원본 비율 고정 */
const MEDIA_ASPECT = "aspect-[5/3] w-full";
const BENEFIT_IMAGE_SIZES = "(max-width: 639px) 92vw, (max-width: 1023px) 45vw, 360px";

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

  return (
    <div
      className={clsx(
        "home-benefit-card-media relative shrink-0 overflow-hidden rounded-t-2xl bg-amber-50",
        MEDIA_ASPECT,
        isDetail && "min-h-[200px] sm:min-h-[240px]",
        hasImage && "home-benefit-card-media--photo",
        active && "home-benefit-card-media--active",
        !active && "opacity-90",
      )}
    >
      {card.image && !imageFailed ? (
        <Image
          src={card.image}
          alt={card.imageAlt ?? card.title}
          fill
          sizes={isDetail ? "(max-width: 639px) 100vw, 672px" : BENEFIT_IMAGE_SIZES}
          quality={95}
          priority={priority}
          unoptimized
          className="home-benefit-card-media__img object-cover object-center"
          onError={() => setImageFailed(true)}
        />
      ) : null}

      <div
        className={clsx(
          "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-amber-50/90 to-white transition-opacity duration-200",
          hasImage ? "pointer-events-none opacity-0" : "opacity-100",
        )}
        aria-hidden={hasImage}
      >
        <span
          className={clsx(
            "flex size-12 items-center justify-center rounded-2xl shadow-sm ring-1",
            active
              ? "bg-white/90 text-[var(--bm-primary)] ring-blue-100/80"
              : "bg-white/70 text-slate-400 ring-slate-200/80",
          )}
        >
          <Icon className="size-6" strokeWidth={2} />
        </span>
        <span className="text-[10px] font-bold text-slate-400/90">혜택 이미지 준비중</span>
      </div>
    </div>
  );
}
