"use client";

import { RelatedQnaSection } from "@/components/qna/RelatedQnaSection";
import { normalizeBatteryCode } from "@/lib/batteryNormalize";
import { getQuestionsForBattery } from "@/lib/qna";
export function BatteryDetailRelatedQna({ code }: { code: string }) {
  const family = normalizeBatteryCode(code) || code.trim();
  const items = getQuestionsForBattery(family, 4);
  if (items.length === 0) return null;

  return (
    <RelatedQnaSection
      title="이 규격 관련 질문"
      description="같은 규격을 검색하는 고객이 자주 묻는 내용입니다."
      questions={items}
      hubHref={`/qa?q=${encodeURIComponent(code)}`}
      showPhotoCta={false}
      contextBatteryCode={family}
    />
  );
}
