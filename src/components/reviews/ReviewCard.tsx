"use client";

import { useState } from "react";
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
        "bm-badge shrink-0",
        mood ? "bm-badge--review-mood" : "bm-badge--review",
      )}
    >
      {REVIEW_BADGE_LABELS[id]}
    </span>
  );
}

function ReviewOperatorReply({ item }: { item: ReviewItem }) {
  const [expanded, setExpanded] = useState(false);
  if (!item.operatorReply) return null;

  const replyLong = item.operatorReply.length > 160;

  return (
    <div className="review-operator-reply mt-4 min-w-0 max-w-full rounded-xl border border-teal-100 bg-teal-50/50 p-4">
      <div className="review-operator-reply__head flex items-center gap-2">
        <span className="review-operator-reply__icon flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700" aria-hidden>
          <MessageCircle className="size-4" strokeWidth={2.25} />
        </span>
        <p className="review-operator-reply__label text-sm font-black text-teal-900">
          배터리매니저 답변
        </p>
      </div>
      {item.operatorSummary ? (
        <p className="review-operator-reply__summary mt-2 text-sm font-bold text-teal-900/90">
          {item.operatorSummary}
        </p>
      ) : null}
      <p
        className={clsx(
          "review-operator-reply__body mt-2 text-sm font-medium leading-relaxed text-slate-700",
          !expanded && replyLong && "line-clamp-4",
        )}
      >
        {item.operatorReply}
      </p>
      {replyLong ? (
        <button
          type="button"
          className="mt-2 text-xs font-black text-teal-800 hover:underline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "답변 접기" : "답변 더보기"}
        </button>
      ) : null}
    </div>
  );
}

function ReviewCardBody({ item, compact }: { item: ReviewItem; compact?: boolean }) {
  const displayBadges = reviewCardDisplayBadgeIds(item.badges);

  return (
    <div className="review-card__body flex min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <div className="flex shrink-0 items-center gap-0.5 text-amber-500" aria-label={`${item.rating}점`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={clsx("size-3.5 sm:size-4", i < item.rating ? "fill-current" : "opacity-25")}
            />
          ))}
        </div>
        <span className="min-w-0 text-xs font-bold text-slate-600 sm:text-sm">
          {reviewDisplayAuthor(item)}
          {reviewDisplayDate(item) ? ` · ${reviewDisplayDate(item)}` : null}
        </span>
      </div>

      {displayBadges.length > 0 ? (
        <div className="mt-2.5 flex min-w-0 flex-wrap gap-1.5">
          {displayBadges.map((b) => (
            <ReviewBadge key={b} id={b} />
          ))}
        </div>
      ) : null}

      {(item.vehicleName || item.batteryCode) ? (
        <p className="mt-2.5 min-w-0 text-sm font-black text-slate-900 sm:text-base">
          {[item.vehicleName, item.batteryCode].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      <p
        className={clsx(
          "review-card__content mt-2.5 text-sm font-medium leading-relaxed text-slate-700 sm:text-[15px]",
          compact ? "line-clamp-3" : "line-clamp-3 sm:line-clamp-none",
        )}
      >
        {item.content}
      </p>

      <ReviewOperatorReply item={item} />

      <div className="review-card__actions mt-auto flex min-w-0 flex-wrap gap-2 pt-4">
        <Link
          href={item.productHref}
          className={`${bm.btnSecondary} shrink-0 text-xs sm:text-sm`}
        >
          해당 규격 보기
        </Link>
        {item.blogHref ? (
          <a
            href={item.blogHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${bm.btnTertiary} shrink-0 text-xs sm:text-sm`}
          >
            블로그 후기
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function ReviewCard({ item }: { item: ReviewItem }) {
  const withPhoto = reviewHasImages(item);

  if (!withPhoto) {
    return (
      <article
        className={clsx(
          "review-card review-card--text flex h-full min-h-[280px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5",
        )}
      >
        <ReviewCardBody item={item} compact />
      </article>
    );
  }

  return (
    <article
      className={clsx(
        "review-card review-card--photo flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
      )}
    >
      <ReviewCardMedia item={item} className="review-card-media w-full shrink-0" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-4 sm:p-5">
        <ReviewCardBody item={item} />
      </div>
    </article>
  );
}
