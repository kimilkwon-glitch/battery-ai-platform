"use client";

import { useMemo } from "react";
import { RelatedQnaSection } from "@/components/qna/RelatedQnaSection";
import { getQuestionsForSearch } from "@/lib/qna";
export function SearchRelatedQna({
  query,
  rawQuery,
}: {
  query: string;
  rawQuery?: string;
}) {
  const items = useMemo(() => getQuestionsForSearch(query, 4, rawQuery), [query, rawQuery]);
  if (!query.trim() || items.length === 0) return null;

  return (
    <RelatedQnaSection
      title="검색과 연결된 질문"
      description="같은 키워드로 문의하는 고객 Q&A입니다."
      questions={items}
      hubHref={`/community?q=${encodeURIComponent(query)}`}
    />
  );
}
