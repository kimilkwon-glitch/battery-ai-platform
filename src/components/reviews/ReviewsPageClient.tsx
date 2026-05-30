"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import clsx from "clsx";
import { AppIcon } from "@/components/common/AppIcon";
import {
  REVIEW_BADGE_LABELS,
  REVIEW_FILTER_OPTIONS,
  REVIEWS_MOCK,
  type ReviewBadgeId,
  type ReviewItem,
} from "@/lib/reviews-mock-data";
import { storeLinks } from "@/lib/external-links";
import { bm } from "@/lib/design-tokens";
import { HUB_PHOTO } from "@/lib/customer-hub-routes";

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
          {item.blogHref ? (
            <a
              href={item.blogHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${bm.btnTertiary} text-xs`}
            >
              블로그 후기
            </a>
          ) : null}
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

      <section className={`${bm.card} ${bm.cardPad}`}>
        <p className={bm.intentBadge}>고객 후기</p>
        <h2 className={`${bm.sectionTitle} mt-2`}>배터리 교체 후기</h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          실제 작업 후기를 기준으로 정리한 배터리 교체 사례입니다. 지점별 작업 후기와 고객 문의가
          많은 차량을 함께 확인할 수 있습니다. 더 많은 후기는 각 지점 블로그에서 확인할 수
          있습니다.
        </p>
      </section>

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

      <section className={bm.platformStrip}>
        <p className={bm.label}>더 보기 · 상담</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={storeLinks.deokcheon.blog}
            target="_blank"
            rel="noopener noreferrer"
            className={`${bm.btnSecondary} inline-flex items-center gap-1.5 text-xs`}
          >
            <AppIcon iconKey="guide" size="sm" />
            덕천점 블로그 후기 보기
          </a>
          <a
            href={storeLinks.hakjang.blog}
            target="_blank"
            rel="noopener noreferrer"
            className={`${bm.btnSecondary} inline-flex items-center gap-1.5 text-xs`}
          >
            <AppIcon iconKey="guide" size="sm" />
            학장점 블로그 후기 보기
          </a>
          <Link className={`${bm.btnNavy} inline-flex items-center gap-1.5 text-xs`} href="/vehicles">
            <AppIcon iconKey="vehicle" size="sm" className="!text-white" />
            내 차 배터리 상담하기
          </Link>
          <Link className={`${bm.btnSecondary} inline-flex items-center gap-1.5 text-xs`} href={HUB_PHOTO}>
            <AppIcon iconKey="photoCheck" size="sm" />
            사진으로 확인하기
          </Link>
        </div>
      </section>
    </div>
  );
}
