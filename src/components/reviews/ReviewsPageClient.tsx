"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import clsx from "clsx";
import {
  REVIEW_BADGE_LABELS,
  REVIEW_FILTER_OPTIONS,
  REVIEWS_MOCK,
  type ReviewBadgeId,
  type ReviewItem,
} from "@/lib/reviews-mock-data";
import { bm } from "@/lib/design-tokens";

function ReviewBadge({ id }: { id: ReviewBadgeId }) {
  return <span className="bm-badge bm-badge--review">{REVIEW_BADGE_LABELS[id]}</span>;
}

function ReviewCard({ item }: { item: ReviewItem }) {
  return (
    <article className={`${bm.card} bm-card-unified overflow-hidden`}>
      <div className={`${bm.cardPad} space-y-3`}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={clsx("size-3.5", i < item.rating ? "fill-current" : "opacity-25")}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-500">
            {item.authorMasked} · {item.date}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {item.badges.map((b) => (
            <ReviewBadge key={b} id={b} />
          ))}
        </div>
        <p className="text-sm font-black text-slate-900">
          {item.vehicle} · {item.batteryCode}
        </p>
        <p className="text-sm font-medium leading-relaxed text-slate-700">{item.body}</p>
        <div className="flex flex-wrap gap-2">
          <Link href={item.productHref} className={`${bm.btnSecondary} text-xs`}>
            해당 규격 보기
          </Link>
          <Link href={`/reviews?battery=${encodeURIComponent(item.batteryCode)}`} className={`${bm.btnTertiary} text-xs`}>
            작업 사례 보기
          </Link>
        </div>
        {item.operatorReply ? (
          <div className="review-operator-reply rounded-xl border p-3">
            <p className="review-operator-reply__label text-[10px] font-black">Battery Manager 답변</p>
            {item.operatorSummary ? (
              <p className="mt-1 text-xs font-bold text-slate-700">{item.operatorSummary}</p>
            ) : null}
            <p className="mt-1 text-xs font-medium text-slate-600">{item.operatorReply}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function ReviewsPageClient({ initialBattery }: { initialBattery?: string }) {
  const [filter, setFilter] = useState<"all" | ReviewBadgeId>("all");

  const filtered = useMemo(() => {
    let list = REVIEWS_MOCK;
    if (initialBattery) {
      const b = initialBattery.trim().toUpperCase();
      list = list.filter((r) => r.batteryCode.toUpperCase() === b);
    }
    if (filter === "all") return list;
    return list.filter((r) => r.badges.includes(filter));
  }, [filter, initialBattery]);

  return (
    <div className="reviews-page bm-zone bm-zone--review space-y-6">
      {initialBattery ? (
        <p className="text-sm font-bold text-[var(--color-accent-review)]">
          필터: {initialBattery}{" "}
          <Link href="/reviews" className="font-semibold text-slate-500 hover:underline">
            전체 보기
          </Link>
        </p>
      ) : null}
      <button
        type="button"
        disabled
        className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-400"
        title="리뷰 작성 기능 준비중"
      >
        리뷰 작성 (준비중)
      </button>

      <div className="bm-tab-rail bm-tab-rail--review overflow-x-auto flex-nowrap sm:flex-wrap">
        {REVIEW_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setFilter(opt.id)}
            className={clsx(
              "bm-tab-rail__btn shrink-0",
              filter === opt.id && "bm-tab-rail__btn--active",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((item) => (
          <ReviewCard key={item.id} item={item} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm font-medium text-slate-500">해당 조건의 후기가 없습니다.</p>
      ) : null}

      <p className="text-center text-[10px] font-medium text-slate-400">
        {/* 샘플 데이터 — 실제 고객 후기 연동 전 */}
        표시된 후기는 UI 검증용 샘플입니다.
      </p>
    </div>
  );
}
