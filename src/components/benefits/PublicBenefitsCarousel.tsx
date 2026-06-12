"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BenefitsPromoCarousel } from "@/components/benefits/BenefitsPromoCarousel";
import { BENEFIT_CARDS, BENEFITS_HUB_TITLE, HUB_BENEFITS } from "@/lib/benefits-data";
import { filterPublicBenefitCards } from "@/lib/benefits-display-filter";
import { apiFetchPublicPromotionsPaginated } from "@/lib/cms/cms-client";
import { CONTENT_DISPLAY_LIMITS } from "@/lib/content-display-limits";
import { publicPromotionToBenefitCard } from "@/lib/promotion/promotion-to-benefit-card";
import type { BenefitCardConfig } from "@/lib/benefits-data";

const STATIC_EXTRAS = BENEFIT_CARDS.filter((c) => c.id !== "first-order-3");

type Props = {
  showHeader?: boolean;
  variant?: "main" | "hub";
  filter?: "main" | "benefits" | "all";
  autoPlay?: boolean;
  className?: string;
  ariaLabel?: string;
  showMoreLink?: boolean;
};

export function PublicBenefitsCarousel({
  showHeader = true,
  variant = "main",
  filter = "all",
  autoPlay = true,
  className,
  ariaLabel = BENEFITS_HUB_TITLE,
  showMoreLink = variant === "main",
}: Props) {
  const [cards, setCards] = useState<BenefitCardConfig[]>(() => filterPublicBenefitCards(BENEFIT_CARDS));
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const isMain = filter === "main";
      const res = await apiFetchPublicPromotionsPaginated({
        page: 1,
        limit: isMain ? CONTENT_DISPLAY_LIMITS.mainBenefits : CONTENT_DISPLAY_LIMITS.benefitsPageSize,
        mainOnly: isMain,
        benefitsOnly: filter === "benefits",
      });
      setLoading(false);

      if (!res.ok) return;

      const fromDb = filterPublicBenefitCards(res.items.map(publicPromotionToBenefitCard));
      if (fromDb.length === 0 && !isMain) return;

      if (isMain) {
        setCards(fromDb.length ? fromDb : filterPublicBenefitCards(BENEFIT_CARDS.slice(0, CONTENT_DISPLAY_LIMITS.mainBenefits)));
        setHasMore(res.hasMore || fromDb.length < (res.total || 0));
        return;
      }

      const merged =
        filter === "benefits"
          ? [...fromDb, ...filterPublicBenefitCards(STATIC_EXTRAS.filter((c) => c.status === "coming_soon"))]
          : fromDb;

      if (merged.length) {
        setCards(merged);
        setHasMore(res.hasMore);
      }
    })();
  }, [filter]);

  if (!loading && cards.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
        <p className="text-sm font-bold text-slate-600">진행 중인 혜택이 없습니다.</p>
        <Link href={HUB_BENEFITS} className="mt-2 inline-block text-xs font-black text-amber-800 hover:underline">
          혜택 안내 보기
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <BenefitsPromoCarousel
        cards={cards}
        showHeader={showHeader}
        variant={variant}
        ariaLabel={ariaLabel}
        className={className}
        autoPlay={autoPlay}
      />
      {showMoreLink && hasMore ? (
        <p className="text-right">
          <Link
            href={HUB_BENEFITS}
            className="text-xs font-black text-amber-900 hover:underline"
          >
            혜택 더보기 →
          </Link>
        </p>
      ) : null}
    </div>
  );
}
