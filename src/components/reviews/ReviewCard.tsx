"use client";

import Link from "next/link";
import { MessageCircle, Star } from "lucide-react";
import clsx from "clsx";
import { ReviewCardMedia } from "@/components/reviews/ReviewCardMedia";
import {
  reviewDisplayAuthor,
  reviewDisplayDate,
  reviewHasImages,
} from "@/lib/review-card-utils";
import {
  isReviewMoodBadge,
  reviewCardDisplayBadgeIds,
} from "@/lib/review-badge-utils";
import {
  REVIEW_BADGE_LABELS,
  type ReviewBadgeId,
  type ReviewItem,
} from "@/lib/reviews-mock-data";
import { bm } from "@/lib/design-tokens";

function ReviewBadge({ id }: { id: ReviewBadgeId }) {
  const mood = isReviewMoodBadge(id);
  return (
    <span
      className={clsx(
        "bm-badge",
        mood ? "bm-badge--review-mood" : "bm-badge--review",
      )}
    >
      {REVIEW_BADGE_LABELS[id]}
    </span>
  );
}

function ReviewOperatorReply({ item }: { item: ReviewItem }) {
  if (!item.operatorReply) return null;

  return (
    <div className="review-operator-reply mt-4">
      <div className="review-operator-reply__head">
        <span className="review-operator-reply__icon" aria-hidden>
          <MessageCircle className="size-4" strokeWidth={2.25} />
        </span>
        <p className="review-operator-reply__label">배터리매니저 답변</p>
      </div>
      {item.operatorSummary ? (
        <p className="review-operator-reply__summary">{item.operatorSummary}</p>
      ) : null}
      <p className="review-operator-reply__body">{item.operatorReply}</p>
    </div>
  );
}

function ReviewCardBody({ item, compact }: { item: ReviewItem; compact?: boolean }) {
  const displayBadges = reviewCardDisplayBadgeIds(item.badges);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-0.5 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={clsx("size-3.5 sm:size-4", i < item.rating ? "fill-current" : "opacity-25")}
            />
          ))}
        </div>
        <span className="text-xs font-bold text-slate-500 sm:text-sm">
          {reviewDisplayAuthor(item)}
          {reviewDisplayDate(item) ? ` · ${reviewDisplayDate(item)}` : null}
        </span>
      </div>

      {displayBadges.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {displayBadges.map((b) => (
            <ReviewBadge key={b} id={b} />
          ))}
        </div>
      ) : null}

      {(item.vehicleName || item.batteryCode) ? (
        <p className="mt-2.5 text-sm font-black text-slate-900 line-clamp-1 sm:text-base">
          {[item.vehicleName, item.batteryCode].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      <p
        className={clsx(
          "mt-2.5 text-sm font-medium leading-relaxed text-slate-700 sm:text-[15px] sm:leading-relaxed",
          compact ? "line-clamp-4" : "line-clamp-3",
        )}
      >
        {item.content}
      </p>

      <ReviewOperatorReply item={item} />

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={item.productHref} className={`${bm.btnSecondary} text-xs sm:text-sm`}>
          해당 규격 보기
        </Link>
        {item.blogHref ? (
          <a
            href={item.blogHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${bm.btnTertiary} text-xs sm:text-sm`}
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
