"use client";

import { useMemo } from "react";
import { RelatedQnaSection } from "@/components/qna/RelatedQnaSection";
import { getQuestionsForSearch } from "@/lib/qna";
import { QNA_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";

export function SearchRelatedQna({
  query,
  rawQuery,
}: {
  query: string;
  rawQuery?: string;
}) {
  const items = useMemo(() => getQuestionsForSearch(query, 4, rawQuery), [query, rawQuery]);
  const matchText = `${query} ${rawQuery ?? ""}`.trim();
  if (!matchText || items.length === 0) return null;

  const imageSlot = /블랙박스|방전|암전류/.test(matchText)
    ? QNA_IMAGE_SLOTS.blackboxCheck()
    : /포터|90R|100R/.test(matchText)
      ? QNA_IMAGE_SLOTS.porterInstall()
      : /하이브리드|EV|보조/.test(matchText)
        ? QNA_IMAGE_SLOTS.hybridAuxLocation()
        : QNA_IMAGE_SLOTS.labelCheck();

  return (
    <RelatedQnaSection
      title="검색과 연결된 질문"
      description="같은 키워드로 문의하는 고객 Q&A입니다."
      questions={items}
      imageSlot={imageSlot}
      hubHref={`/community?q=${encodeURIComponent(query)}`}
    />
  );
}
