"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import {
  reviewExtraImageCount,
  reviewImageAlt,
  reviewPrimaryImage,
} from "@/lib/review-card-utils";
import type { ReviewItem } from "@/lib/reviews-mock-data";

type Props = {
  item: ReviewItem;
  className?: string;
};

/** 사진이 있는 리뷰만 렌더 — images 없으면 null (placeholder·빈 박스 없음) */
export function ReviewCardMedia({ item, className }: Props) {
  const src = reviewPrimaryImage(item);
  const extra = reviewExtraImageCount(item);
  const alt = reviewImageAlt(item);
  const [broken, setBroken] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const closeLightbox = useCallback(() => setLightbox(false), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox, closeLightbox]);

  if (!src || broken) return null;

  return (
    <>
      <button
        type="button"
        className={clsx(
          "review-card-media group relative block w-full overflow-hidden bg-slate-100 text-left",
          "aspect-[4/3] sm:aspect-auto sm:min-h-[11.5rem] sm:w-full sm:max-w-none",
          className,
        )}
        onClick={() => setLightbox(true)}
        aria-label={`${alt} 크게 보기`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02] sm:object-contain sm:group-hover:scale-100"
          decoding="async"
          onError={() => setBroken(true)}
        />
        {extra > 0 ? (
          <span
            className="absolute bottom-2 right-2 rounded-lg bg-slate-900/75 px-2 py-0.5 text-[11px] font-black text-white"
            aria-hidden
          >
            +{extra}
          </span>
        ) : null}
      </button>

      {lightbox ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={closeLightbox}
            aria-label="닫기"
          >
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[min(85vh,720px)] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
