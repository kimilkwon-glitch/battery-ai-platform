"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  HOME_BENEFIT_FALLBACK_ICONS,
  type HomeBenefitCard,
} from "@/lib/home-benefits-data";

/** 카드형·상세 공통 — 3개 혜택 카드 media 높이 통일 */
const MEDIA_HEIGHT_CARD = "h-[168px] sm:h-[180px]";
const MEDIA_HEIGHT_DETAIL = "h-[240px] sm:h-[300px] lg:h-[340px]";

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
  /** 첫 번째 3% 쿠폰 — contain + 톤 배경 (cover 금지) */
  const isCouponBanner = active && Boolean(card.image) && card.id === "first-order-3";
  const isDetail = variant === "detail";

  return (
    <div
      className={clsx(
        "home-benefit-card-media relative w-full shrink-0 overflow-hidden border-b border-slate-200/60",
        isDetail ? MEDIA_HEIGHT_DETAIL : MEDIA_HEIGHT_CARD,
        isCouponBanner
          ? "home-benefit-card-media--banner bg-gradient-to-br from-amber-100/95 via-amber-50/90 to-white"
          : "bg-gradient-to-b from-amber-50/90 to-white",
        active && "home-benefit-card-media--active",
        !active && "opacity-90",
      )}
    >
      {card.image && !imageFailed ? (
        <div
          className={clsx(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
            isCouponBanner ? "p-0 sm:p-0.5" : "p-2",
            showImage ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={!showImage}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.image}
            alt={card.imageAlt ?? (isCouponBanner ? "첫 주문 3% 혜택 카드" : "")}
            className={clsx(
              "home-benefit-card-media__img block max-h-full max-w-full object-contain object-center",
              isCouponBanner && "home-benefit-card-media__img--coupon",
            )}
            onLoad={() => setImageReady(true)}
            onError={() => {
              setImageFailed(true);
              setImageReady(false);
            }}
          />
        </div>
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
