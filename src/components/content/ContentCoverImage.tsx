"use client";

import Image from "next/image";
import { useState } from "react";
import type { AdminContentThumbnailType } from "@/data/admin/adminContent.schema";
import { ContentTypeThumbnail } from "@/components/content/ContentTypeThumbnail";
import { resolveContentCoverImage } from "@/lib/content/getContentImage";

type Props = {
  contentId: string;
  title: string;
  /** 카드 상단 16:9 / 상세 hero / 사이드바 compact */
  variant?: "card" | "hero" | "compact";
  objectFit?: "cover" | "contain";
  /** 이미지 하단에 HTML 제목 표시 */
  showTitle?: boolean;
  className?: string;
  roundedClass?: string;
};

const VARIANT_CLASS = {
  card: "aspect-video w-full",
  hero: "aspect-video w-full max-h-[280px]",
  compact: "aspect-video w-20 shrink-0",
} as const;

export function ContentCoverImage({
  contentId,
  title,
  variant = "card",
  objectFit = "cover",
  showTitle = false,
  className = "",
  roundedClass = "rounded-t-2xl",
}: Props) {
  const cover = resolveContentCoverImage(contentId);
  const [failed, setFailed] = useState(false);

  const frameClass = `${VARIANT_CLASS[variant]} relative overflow-hidden bg-slate-100 ${roundedClass} ${className}`;

  if (!cover.showHero) {
    return null;
  }

  const hasImage = Boolean(cover.imagePath) && !failed;

  if (hasImage && cover.imagePath) {
    return (
      <div className={frameClass}>
        <Image
          alt={cover.altText}
          className={`${objectFit === "contain" ? "object-contain" : "object-cover"} bg-slate-50`}
          fill
          sizes={variant === "compact" ? "80px" : variant === "hero" ? "960px" : "640px"}
          src={cover.imagePath}
          onError={() => setFailed(true)}
        />
        {showTitle ? (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent px-3 pb-2.5 pt-8">
            <p className="line-clamp-2 text-sm font-black leading-snug text-white">{title}</p>
          </div>
        ) : null}
      </div>
    );
  }

  if (cover.imageNeeded) {
    return (
      <div className={`${frameClass} flex flex-col items-center justify-center ring-1 ring-slate-200`}>
        <ContentTypeThumbnail
          thumbnailType={cover.thumbnailType as AdminContentThumbnailType}
          title={title}
          size={variant === "compact" ? "sm" : "md"}
        />
        {variant !== "compact" ? (
          <p className="mt-2 px-3 text-center text-[11px] font-bold text-slate-400">실물 기준 확인</p>
        ) : null}
      </div>
    );
  }

  return null;
}
