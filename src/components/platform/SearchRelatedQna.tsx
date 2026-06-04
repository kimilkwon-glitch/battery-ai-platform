"use client";

import { useMemo } from "react";
import { RelatedQnaSection } from "@/components/qna/RelatedQnaSection";
import { getQuestionsForSearch } from "@/lib/qna";
export function SearchRelatedQna({
  query,
  rawQuery,
  maxItems = 4,
  title = "검색과 연결된 질문",
  description = "같은 키워드로 문의하는 고객 Q&A입니다.",
}: {
  query: string;
  rawQuery?: string;
  maxItems?: number;
  title?: string;
  description?: string;
}) {
  const items = useMemo(
    () => getQuestionsForSearch(query, maxItems, rawQuery),
    [query, rawQuery, maxItems],
  );
  if (!query.trim() || items.length === 0) return null;

  return (
    <RelatedQnaSection
      title={title}
      description={description}
      questions={items}
      hubHref={`/qa?q=${encodeURIComponent(query)}`}
    />
  );
}
