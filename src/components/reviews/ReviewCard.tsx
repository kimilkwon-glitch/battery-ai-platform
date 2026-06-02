"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import clsx from "clsx";
import { ReviewCardMedia } from "@/components/reviews/ReviewCardMedia";
import {
  reviewDisplayAuthor,
  reviewDisplayDate,
  reviewHasImages,
} from "@/lib/review-card-utils";
import {
  REVIEW_BADGE_LABELS,
  type ReviewBadgeId,
  type ReviewItem,
} from "@/lib/reviews-mock-data";
import { bm } from "@/lib/design-tokens";

function ReviewBadge({ id }: { id: ReviewBadgeId }) {
  return <span className="bm-badge bm-badge--review">{REVIEW_BADGE_LABELS[id]}</span>;
}

function ReviewCardBody({ item, compact }: { item: ReviewItem; compact?: boolean }) {
  return (
    <>
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
          {reviewDisplayAuthor(item)}
          {reviewDisplayDate(item) ? ` · ${reviewDisplayDate(item)}` : null}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {item.badges.map((b) => (
          <ReviewBadge key={b} id={b} />
        ))}
      </div>

      {(item.vehicleName || item.batteryCode) ? (
        <p className="mt-2 text-sm font-black text-slate-900 line-clamp-1">
          {[item.vehicleName, item.batteryCode].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      <p
        className={clsx(
          "mt-2 text-sm font-medium leading-relaxed text-slate-700",
          compact ? "line-clamp-4" : "line-clamp-3",
        )}
      >
        {item.content}
      </p>

      {item.operatorReply ? (
        <div className="review-operator-reply mt-3 rounded-xl border p-2.5 sm:p-3">
          <p className="review-operator-reply__label text-[10px] font-black">Battery Manager 답변</p>
          {item.operatorSummary ? (
            <p className="mt-0.5 line-clamp-1 text-xs font-bold text-slate-700">
              {item.operatorSummary}
            </p>
          ) : null}
          <p className="mt-0.5 line-clamp-3 text-xs font-medium leading-snug text-slate-600">
            {item.operatorReply}
          </p>
        </div>
      ) : null}

      <div className={clsx("flex flex-wrap gap-2", compact ? "mt-4" : "mt-4")}>
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
    </>
  );
}

export function ReviewCard({ item }: { item: ReviewItem }) {
  const withPhoto = reviewHasImages(item);

  if (!withPhoto) {
    return (
      <article
        className={clsx(
          "review-card review-card--text flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5",
        )}
      >
        <ReviewCardBody item={item} compact />
      </article>
    );
  }

  return (
    <article
      className={clsx(
        "review-card review-card--photo flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
      )}
    >
      <ReviewCardMedia item={item} />
      <div className="flex flex-col p-4 sm:p-5">
        <ReviewCardBody item={item} />
      </div>
    </article>
  );
}
