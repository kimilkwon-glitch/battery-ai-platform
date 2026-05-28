"use client";

import Image from "next/image";
import { useState } from "react";
import { ContentUiIconGlyph } from "@/components/content/ContentUiIconGlyph";
import type { ContentUiIconSize } from "@/components/content/ContentUiIcon";
import {
  resolveQnaCollapsedIconKey,
  resolveQnaCollapsedThumbUrl,
} from "@/lib/qna/qna-visual";
import type { Question } from "@/lib/platform-types";

const SIZE_CLASS: Record<ContentUiIconSize, string> = {
  32: "h-8 w-8",
  36: "h-9 w-9",
  44: "h-11 w-11",
  48: "h-12 w-12",
  52: "h-[52px] w-[52px]",
};

/**
 * Q&A 접힌 상태 좌측 — 질문별 아이콘 우선, ID별 작은 썸네일은 선택적.
 * 큰 콘텐츠 배너·공통 blackbox fallback 사용 금지.
 */
export function QnaCollapsedThumb({
  question,
  size = 44,
}: {
  question: Question;
  size?: ContentUiIconSize;
}) {
  const iconKey = resolveQnaCollapsedIconKey(question);
  const thumbUrl = resolveQnaCollapsedThumbUrl(question);
  const [thumbFailed, setThumbFailed] = useState(false);

  if (thumbUrl && !thumbFailed) {
    return (
      <span
        className={`relative shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200/70 ${SIZE_CLASS[size]}`}
        data-qna-collapsed-thumb={question.id}
      >
        <Image
          alt=""
          aria-hidden
          className="object-contain object-center p-1"
          fill
          sizes="48px"
          src={thumbUrl}
          unoptimized
          onError={() => setThumbFailed(true)}
        />
      </span>
    );
  }

  return <ContentUiIconGlyph iconKey={iconKey} size={size} data-qna-collapsed-icon={question.id} />;
}
