"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  HOME_BENEFIT_FALLBACK_ICONS,
  type HomeBenefitCard,
} from "@/lib/home-benefits-data";

/** 3개 혜택 카드 media — 5:3 통일 (benefit-3percent-card.png 기준) */
const MEDIA_ASPECT = "aspect-[5/3] w-full";

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
  const isCouponCard = active && Boolean(card.image) && card.id === "first-order-3";
  const isDetail = variant === "detail";

  return (
    <div
      className={clsx(
        "home-benefit-card-media relative shrink-0 overflow-hidden rounded-t-2xl",
        MEDIA_ASPECT,
        isDetail && "min-h-[200px] sm:min-h-[240px]",
        isCouponCard
          ? "home-benefit-card-media--coupon bg-amber-50"
          : "bg-gradient-to-b from-amber-50/90 to-white",
        active && "home-benefit-card-media--active",
        !active && "opacity-90",
      )}
    >
      {card.image && !imageFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.image}
          alt={card.imageAlt ?? (isCouponCard ? "첫 주문 3% 혜택 카드" : "")}
          className={clsx(
            "home-benefit-card-media__img absolute inset-0 block h-full w-full transition-opacity duration-300",
            isCouponCard
              ? "object-cover object-center"
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
          showImage ? "pointer-events-none opacity-0" : "opacity-100",
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
