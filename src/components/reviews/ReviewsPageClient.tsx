"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppIcon } from "@/components/common/AppIcon";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import clsx from "clsx";
import {
  REVIEW_FILTER_OPTIONS,
  REVIEWS_MOCK,
  type ReviewBadgeId,
} from "@/lib/reviews-mock-data";
import { storeLinks } from "@/lib/external-links";
import { bm } from "@/lib/design-tokens";
import { HUB_PHOTO } from "@/lib/customer-hub-routes";

export function ReviewsPageClient({ initialBattery }: { initialBattery?: string }) {
  const [filter, setFilter] = useState<"all" | ReviewBadgeId>("all");

  const filtered = useMemo(() => {
    let list = REVIEWS_MOCK;
    if (initialBattery) {
      const b = initialBattery.trim().toUpperCase();
      list = list.filter((r) => (r.batteryCode ?? "").toUpperCase() === b);
    }
    if (filter === "all") return list;
    return list.filter((r) => r.badges.includes(filter));
  }, [filter, initialBattery]);

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

      <div className="reviews-grid-wrap rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
        <ul className="reviews-grid grid list-none grid-cols-1 items-start gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3 xl:gap-7">
          {filtered.map((item) => (
            <li key={item.id} className="min-w-0">
              <ReviewCard item={item} />
            </li>
          ))}
        </ul>
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
