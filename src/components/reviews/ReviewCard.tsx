"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Star, X } from "lucide-react";
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

function ReviewCardBody({
  item,
  compact,
  expanded,
  onToggleExpand,
}: {
  item: ReviewItem;
  compact?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const displayBadges = reviewCardDisplayBadgeIds(item.badges);
  const contentLong = item.content.length > 120;

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

      {(item.branchName || item.serviceType) ? (
        <p className="mt-1.5 min-w-0 text-xs font-semibold text-slate-500 sm:text-sm">
          {[item.branchName, item.serviceType].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      <p
        className={clsx(
          "review-card__content mt-2.5 text-sm font-medium leading-relaxed text-slate-700 sm:text-[15px]",
          compact && !expanded && "line-clamp-3",
          !compact && !expanded && "line-clamp-3 sm:line-clamp-none",
        )}
      >
        {item.content}
      </p>

      {(compact || contentLong) && onToggleExpand ? (
        <button
          type="button"
          className="review-card__expand mt-2 text-xs font-black text-teal-800 hover:underline"
          onClick={onToggleExpand}
        >
          {expanded ? "접기" : "자세히 보기"}
        </button>
      ) : null}

      {expanded ? <ReviewOperatorReply item={item} /> : null}

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
  const [expanded, setExpanded] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!detailOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [detailOpen]);

  const handleToggleExpand = () => {
    if (withPhoto) {
      setDetailOpen(true);
    } else {
      setExpanded((v) => !v);
    }
  };

  if (!withPhoto) {
    return (
      <article
        className={clsx(
          "review-card review-card--text flex h-full min-h-[240px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:min-h-[280px] sm:p-5",
        )}
      >
        <ReviewCardBody item={item} compact expanded={expanded} onToggleExpand={handleToggleExpand} />
      </article>
    );
  }

  return (
    <>
      <article
        className={clsx(
          "review-card review-card--photo flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
        )}
      >
        <ReviewCardMedia item={item} className="review-card-media w-full shrink-0" />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col p-4 sm:p-5">
          <ReviewCardBody item={item} compact expanded={false} onToggleExpand={handleToggleExpand} />
        </div>
      </article>

      {detailOpen ? (
        <div
          className="review-detail-overlay fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="후기 상세"
          onClick={() => setDetailOpen(false)}
        >
          <div
            className="review-detail-panel max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
              <p className="text-sm font-black text-slate-900">후기 상세</p>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                aria-label="닫기"
                onClick={() => setDetailOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            <ReviewCardMedia item={item} className="review-card-media w-full shrink-0" />
            <div className="p-4 sm:p-5">
              <ReviewCardBody item={item} expanded />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
