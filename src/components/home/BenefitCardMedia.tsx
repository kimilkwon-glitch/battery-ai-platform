"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  HOME_BENEFIT_FALLBACK_ICONS,
  type HomeBenefitCard,
} from "@/lib/home-benefits-data";

export function BenefitCardMedia({ card }: { card: HomeBenefitCard }) {
  const [imageReady, setImageReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const Icon = HOME_BENEFIT_FALLBACK_ICONS[card.fallbackIcon];
  const active = card.status === "active";
  const showImage = Boolean(card.image) && !imageFailed && imageReady;

  return (
    <div
      className={clsx(
        "home-benefit-card-media relative aspect-[2/1] w-full overflow-hidden",
        active && "home-benefit-card-media--active",
        !active && "opacity-90",
      )}
    >
      {card.image && !imageFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.image}
          alt=""
          className={clsx(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            showImage ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setImageReady(true)}
          onError={() => {
            setImageFailed(true);
            setImageReady(false);
          }}
        />
      ) : null}

      <div
        className={clsx(
          "absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity duration-300",
          showImage ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
        aria-hidden={showImage}
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
