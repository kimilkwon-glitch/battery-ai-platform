"use client";

import { RelatedQnaSection } from "@/components/qna/RelatedQnaSection";
import { getQuestionsForVehicle } from "@/lib/qna";
import { QNA_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";

export function VehicleDetailRelatedQna({
  slug,
  fuelHint,
}: {
  slug: string;
  fuelHint?: string | null;
}) {
  const items = getQuestionsForVehicle(slug, 4, fuelHint);
  if (items.length === 0) return null;

  const hybrid = /하이브리드|hev/i.test(fuelHint ?? "") || /sportage-nq5|k8-gl3/.test(slug);
  const imageSlot = hybrid ? QNA_IMAGE_SLOTS.hybridAuxLocation() : QNA_IMAGE_SLOTS.labelCheck();

  return (
    <RelatedQnaSection
      title="이 차량 관련 질문"
      description="연식·연료·보조배터리 확인 전에 참고하세요."
      questions={items}
      imageSlot={imageSlot}
      hubHref={`/community?q=${encodeURIComponent(slug)}`}
    />
  );
}
