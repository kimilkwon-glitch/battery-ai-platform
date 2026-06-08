"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import clsx from "clsx";
import { apiFetchPublicReviews } from "@/lib/cms/cms-client";
import { CONTENT_DISPLAY_LIMITS } from "@/lib/content-display-limits";
import {
  REVIEW_MAIN_FILTER_OPTIONS,
  REVIEW_MOOD_FILTER_OPTIONS,
  reviewMatchesMainFilter,
  reviewMatchesMoodFilter,
  type ReviewMainFilterId,
} from "@/lib/review-badge-utils";
import { REVIEWS_MOCK, type ReviewBadgeId, type ReviewItem } from "@/lib/reviews-mock-data";
import { bm } from "@/lib/design-tokens";

export function ReviewsPageClient({ initialBattery }: { initialBattery?: string }) {
  const searchParams = useSearchParams();
  const pageFromUrl = Math.max(1, Number(searchParams.get("page")) || 1);

  const [mainFilter, setMainFilter] = useState<ReviewMainFilterId>("all");
  const [moodFilter, setMoodFilter] = useState<ReviewBadgeId | null>(null);
  const [items, setItems] = useState<ReviewItem[]>(REVIEWS_MOCK);
  const [page, setPage] = useState(pageFromUrl);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [useDb, setUseDb] = useState(false);

  const loadReviews = useCallback(
    async (nextPage: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await apiFetchPublicReviews({
        page: nextPage,
        limit: CONTENT_DISPLAY_LIMITS.reviewsPageSize,
        battery: initialBattery,
      });

      if (append) setLoadingMore(false);
      else setLoading(false);

      if (res.ok && res.items.length > 0) {
        setUseDb(true);
        setItems((prev) => (append ? [...prev, ...res.items] : res.items));
        setHasMore(res.hasMore);
        setPage(nextPage);
      } else if (!append) {
        setUseDb(false);
        setItems(REVIEWS_MOCK);
        setHasMore(false);
      }
    },
    [initialBattery],
  );

  useEffect(() => {
    void loadReviews(pageFromUrl, false);
  }, [loadReviews, pageFromUrl]);

  const filtered = useMemo(() => {
    let list = items;
    if (initialBattery) {
      const b = initialBattery.trim().toUpperCase();
      list = list.filter((r) => (r.batteryCode ?? "").toUpperCase() === b);
    }
    return list.filter(
      (r) => reviewMatchesMainFilter(r, mainFilter) && reviewMatchesMoodFilter(r, moodFilter),
    );
  }, [mainFilter, moodFilter, initialBattery, items]);

  return (
    <div className="reviews-page bm-zone bm-zone--review space-y-5">
      {initialBattery ? (
        <p className="text-sm font-bold text-[var(--color-accent-review)]">
          필터: {initialBattery}{" "}
          <Link href="/reviews" className="font-semibold text-slate-500 hover:underline">
            전체 보기
          </Link>
        </p>
      ) : null}

      <section className={`${bm.card} ${bm.cardPad}`}>
        <p className={bm.intentBadge}>고객 후기</p>
        <h2 className={`${bm.sectionTitle} mt-2`}>배터리 교체 후기</h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          실제 작업 후기를 기준으로 정리한 배터리 교체 사례입니다. 지점별 작업 후기와 고객 문의가
          많은 차량을 함께 확인할 수 있습니다.
        </p>
      </section>

      <div className="space-y-2.5">
        <div
          className="bm-tab-rail bm-tab-rail--review reviews-filter-main overflow-x-auto flex-nowrap"
          role="tablist"
          aria-label="작업 유형 필터"
        >
          {REVIEW_MAIN_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={mainFilter === opt.id}
              onClick={() => {
                setMainFilter(opt.id);
                if (opt.id === "all") setMoodFilter(null);
              }}
              className={clsx(
                "bm-tab-rail__btn shrink-0",
                mainFilter === opt.id && "bm-tab-rail__btn--active",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div
          className="reviews-filter-topic flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="후기 성격 보조 필터"
        >
          {REVIEW_MOOD_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMoodFilter(moodFilter === opt.id ? null : opt.id)}
              className={clsx(
                "reviews-filter-topic__chip",
                moodFilter === opt.id && "reviews-filter-topic__chip--active",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-sm font-medium text-slate-500">후기를 불러오는 중…</p>
      ) : (
        <div className="reviews-grid-wrap rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium text-slate-500">
              해당 조건의 후기가 없습니다.
            </p>
          ) : (
            <ul className="reviews-grid grid list-none grid-cols-1 items-stretch gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3 xl:gap-7">
              {filtered.map((item) => (
                <li key={item.id} className="min-w-0">
                  <ReviewCard item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {useDb && hasMore && !loading ? (
        <div className="text-center">
          <button
            type="button"
            className={`${bm.btnTertiary} text-sm`}
            disabled={loadingMore}
            onClick={() => void loadReviews(page + 1, true)}
          >
            {loadingMore ? "불러오는 중…" : "후기 더 불러오기"}
          </button>
        </div>
      ) : null}

      {useDb && page > 1 ? (
        <p className="text-center text-xs font-semibold text-slate-400">
          {page}페이지 ·{" "}
          <Link href="/reviews" className="font-bold text-slate-600 hover:underline">
            처음으로
          </Link>
        </p>
      ) : null}
    </div>
  );
}
