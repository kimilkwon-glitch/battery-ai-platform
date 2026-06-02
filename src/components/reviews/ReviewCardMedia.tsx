"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import {
  reviewGalleryImages,
  reviewImageAlt,
} from "@/lib/review-card-utils";
import type { ReviewItem } from "@/lib/reviews-mock-data";

type Props = {
  item: ReviewItem;
  className?: string;
};

/** 이미지가 있는 리뷰만 — 최대 5장 갤러리 */
export function ReviewCardMedia({ item, className }: Props) {
  const images = reviewGalleryImages(item);
  const [activeIndex, setActiveIndex] = useState(0);
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const [lightbox, setLightbox] = useState(false);

  const closeLightbox = useCallback(() => setLightbox(false), []);

  useEffect(() => {
    setActiveIndex(0);
    setBroken({});
  }, [item.id]);

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

  const visible = images.filter((_, i) => !broken[i]);
  if (visible.length === 0) return null;

  const safeIndex = Math.min(activeIndex, images.length - 1);
  const mainSrc = images[safeIndex];
  if (!mainSrc || broken[safeIndex]) return null;

  const thumbs = images
    .map((src, i) => ({ src, i }))
    .filter(({ i }) => !broken[i] && i !== safeIndex);

  const markBroken = (index: number) => {
    setBroken((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <>
      <div className={clsx("review-card-media w-full", className)}>
        <button
          type="button"
          className="group relative block aspect-[16/10] w-full overflow-hidden rounded-t-2xl bg-slate-50 text-left sm:aspect-[5/3]"
          onClick={() => setLightbox(true)}
          aria-label={`${reviewImageAlt(item, safeIndex)} 크게 보기`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainSrc}
            alt={reviewImageAlt(item, safeIndex)}
            className="h-full w-full object-contain object-center p-2 transition duration-200 group-hover:scale-[1.02]"
            decoding="async"
            onError={() => markBroken(safeIndex)}
          />
        </button>

        {images.length > 1 ? (
          <div
            className="grid grid-cols-4 gap-1 border-t border-slate-100 bg-slate-50/80 p-1.5 sm:grid-cols-5"
            role="list"
            aria-label="후기 사진 썸네일"
          >
            {images.map((src, i) => {
              if (broken[i]) return null;
              const selected = i === safeIndex;
              return (
                <button
                  key={`${item.id}-thumb-${i}`}
                  type="button"
                  role="listitem"
                  onClick={() => setActiveIndex(i)}
                  className={clsx(
                    "relative aspect-[4/3] overflow-hidden rounded-md ring-2 transition",
                    selected
                      ? "ring-teal-500"
                      : "ring-transparent hover:ring-slate-300",
                  )}
                  aria-label={reviewImageAlt(item, i)}
                  aria-pressed={selected}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                    decoding="async"
                    onError={() => markBroken(i)}
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {lightbox ? (
        <div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-3 bg-slate-950/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={reviewImageAlt(item, safeIndex)}
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
            src={mainSrc}
            alt={reviewImageAlt(item, safeIndex)}
            className="max-h-[min(75vh,640px)] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 ? (
            <div
              className="flex max-w-full flex-wrap justify-center gap-2 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((src, i) =>
                broken[i] ? null : (
                  <button
                    key={`lb-${i}`}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={clsx(
                      "size-14 overflow-hidden rounded-lg ring-2 sm:size-16",
                      i === safeIndex ? "ring-white" : "ring-white/30",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ),
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
