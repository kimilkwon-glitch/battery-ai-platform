"use client";

import { RelatedQnaSection } from "@/components/qna/RelatedQnaSection";
import { normalizeBatteryCode } from "@/lib/batteryNormalize";
import { getQuestionsForBattery } from "@/lib/qna";
import { QNA_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";

export function BatteryDetailRelatedQna({ code }: { code: string }) {
  const family = normalizeBatteryCode(code) || code.trim();
  const items = getQuestionsForBattery(family, 4);
  if (items.length === 0) return null;

  const imageSlot = /CMF80L/i.test(code)
    ? QNA_IMAGE_SLOTS.labelCheck()
    : /100R|90R/i.test(code)
      ? QNA_IMAGE_SLOTS.porterInstall()
      : /EV|AGM60/i.test(code)
        ? QNA_IMAGE_SLOTS.hybridAuxLocation()
        : QNA_IMAGE_SLOTS.labelCheck();

  return (
    <RelatedQnaSection
      title="이 규격 관련 질문"
      description="같은 규격을 검색하는 고객이 자주 묻는 내용입니다."
      questions={items}
      imageSlot={imageSlot}
      hubHref={`/community?q=${encodeURIComponent(code)}`}
    />
  );
}
