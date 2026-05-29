"use client";

import { RelatedQnaSection } from "@/components/qna/RelatedQnaSection";
import { getQuestionsForVehicle } from "@/lib/qna";
export function VehicleDetailRelatedQna({
  slug,
  fuelHint,
}: {
  slug: string;
  fuelHint?: string | null;
}) {
  const items = getQuestionsForVehicle(slug, 3, fuelHint);
  if (items.length === 0) return null;

  return (
    <RelatedQnaSection
      title="이 차량 관련 질문"
      description="연식·연료·보조배터리 확인 전에 참고하세요."
      questions={items}
      hubHref="/guides"
      hubLinkLabel="배터리 가이드에서 더보기"
      showPhotoCta={false}
    />
  );
}
