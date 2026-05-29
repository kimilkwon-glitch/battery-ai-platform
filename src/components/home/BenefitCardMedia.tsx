"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  HOME_BENEFIT_FALLBACK_ICONS,
  type HomeBenefitCard,
} from "@/lib/home-benefits-data";

export function BenefitCardMedia({
  card,
  variant = "card",
}: {
  card: HomeBenefitCard;
  /** card: 캐러셀·목록 / detail: 상세 상단 */
  variant?: "card" | "detail";
}) {
  const [imageReady, setImageReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const Icon = HOME_BENEFIT_FALLBACK_ICONS[card.fallbackIcon];
  const active = card.status === "active";
  const showImage = Boolean(card.image) && !imageFailed && imageReady;
  /** 3% 쿠폰 등 실제 배너 이미지 — 영역을 꽉 채우되 비율 유지 */
  const fillBanner = active && Boolean(card.image);

  return (
    <div
      className={clsx(
        "home-benefit-card-media relative w-full overflow-hidden",
        fillBanner ? "bg-amber-100/80" : "bg-gradient-to-b from-amber-50/90 to-white",
        variant === "detail"
          ? fillBanner
            ? "h-[220px] sm:h-[280px] md:h-[320px]"
            : "min-h-[200px] sm:min-h-[260px]"
          : fillBanner
            ? "aspect-[3/2] min-h-[180px] sm:min-h-[200px] lg:min-h-[212px]"
            : "aspect-[5/3] min-h-[148px] sm:min-h-[168px]",
        active && "home-benefit-card-media--active",
        fillBanner && "home-benefit-card-media--fill",
        !active && "opacity-90",
      )}
    >
      {card.image && !imageFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.image}
          alt=""
          className={clsx(
            "absolute inset-0 h-full w-full transition-opacity duration-300",
            fillBanner
              ? "home-benefit-card-media__img--cover object-cover object-[center_42%] p-0"
              : "object-contain object-center p-2",
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
