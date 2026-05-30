"use client";

import { RelatedQnaSection } from "@/components/qna/RelatedQnaSection";
import { getQuestionsForCompare } from "@/lib/qna";
export function CompareRelatedQna({ codes }: { codes: string[] }) {
  const items = getQuestionsForCompare(codes, 4);
  if (items.length === 0) return null;

  return (
    <RelatedQnaSection
      title="비교 시 자주 묻는 질문"
      description="단자 방향·타입 차이·대체 가능 여부는 차종별 확인이 필요합니다."
      questions={items}
      hubHref={`/qa?q=${encodeURIComponent(codes.join(" "))}`}
    />
  );
}
