"use client";

import { useCallback, useEffect, useState } from "react";
import { BenefitCardVisual } from "@/components/benefits/BenefitCardVisual";
import { BENEFITS_PAGE_FALLBACK_CARDS, type BenefitCardConfig } from "@/lib/benefits-data";
import { apiFetchPublicPromotionsPaginated } from "@/lib/cms/cms-client";
import { CONTENT_DISPLAY_LIMITS } from "@/lib/content-display-limits";
import { publicPromotionToBenefitCard } from "@/lib/promotion/promotion-to-benefit-card";
import { bm } from "@/lib/design-tokens";

export function BenefitsGridSection() {
  const [cards, setCards] = useState<BenefitCardConfig[]>(BENEFITS_PAGE_FALLBACK_CARDS);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = useCallback(async (nextPage: number, append: boolean) => {
    if (append) setLoadingMore(true);

    try {
      const res = await apiFetchPublicPromotionsPaginated({
        page: nextPage,
        limit: CONTENT_DISPLAY_LIMITS.benefitsPageSize,
        benefitsOnly: true,
      });

      if (!res.ok || res.items.length === 0) {
        if (!append) setCards(BENEFITS_PAGE_FALLBACK_CARDS);
        return;
      }

      const mapped = res.items.map(publicPromotionToBenefitCard);
      setCards((prev) => (append ? [...prev, ...mapped] : mapped.length ? mapped : BENEFITS_PAGE_FALLBACK_CARDS));
      setHasMore(res.hasMore);
      setPage(nextPage);
    } catch {
      if (!append) setCards(BENEFITS_PAGE_FALLBACK_CARDS);
    } finally {
      if (append) setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  return (
    <section className="space-y-4" aria-label="전체 혜택 목록">
      <h2 className="text-sm font-black text-slate-800">진행 중인 혜택</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <BenefitCardVisual key={card.id} card={card} />
        ))}
      </div>
      {hasMore ? (
        <div className="text-center">
          <button
            type="button"
            className={`${bm.btnTertiary} text-sm`}
            disabled={loadingMore}
            onClick={() => void loadPage(page + 1, true)}
          >
            {loadingMore ? "추가 혜택 불러오는 중…" : "혜택 더 불러오기"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
