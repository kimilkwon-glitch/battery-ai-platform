"use client";

import { useCallback, useEffect, useState } from "react";
import { BenefitCardVisual } from "@/components/benefits/BenefitCardVisual";
import { apiFetchPublicPromotionsPaginated } from "@/lib/cms/cms-client";
import { CONTENT_DISPLAY_LIMITS } from "@/lib/content-display-limits";
import { publicPromotionToBenefitCard } from "@/lib/promotion/promotion-to-benefit-card";
import type { BenefitCardConfig } from "@/lib/benefits-data";
import { bm } from "@/lib/design-tokens";

export function BenefitsGridSection() {
  const [cards, setCards] = useState<BenefitCardConfig[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = useCallback(async (nextPage: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    const res = await apiFetchPublicPromotionsPaginated({
      page: nextPage,
      limit: CONTENT_DISPLAY_LIMITS.benefitsPageSize,
      benefitsOnly: true,
    });

    if (append) setLoadingMore(false);
    else setLoading(false);

    if (!res.ok) return;

    const mapped = res.items.map(publicPromotionToBenefitCard);
    setCards((prev) => (append ? [...prev, ...mapped] : mapped));
    setHasMore(res.hasMore);
    setPage(nextPage);
  }, []);

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  if (loading) {
    return <p className="text-center text-sm font-medium text-slate-500">혜택을 불러오는 중…</p>;
  }

  if (cards.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
        <p className="text-sm font-bold text-slate-600">등록된 혜택이 없습니다.</p>
      </section>
    );
  }

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
            {loadingMore ? "불러오는 중…" : "혜택 더 불러오기"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
