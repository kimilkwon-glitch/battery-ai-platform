import type { ImageSlotDefinition } from "@/lib/media/image-slot-registry";
import { QNA_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import {
  type ContentUiIconKey,
  resolveQuestionContentUiIcon,
} from "@/lib/content-ui-icons";
import type { Question } from "@/lib/platform-types";
import { inferQuestionType } from "@/lib/qna-hub-data";

/** 접힌 카드 — 레거시 콘텐츠 PNG 사용 안 함 (아이콘만) */
const QNA_COLLAPSED_THUMB_BY_ID: Partial<Record<string, string>> = {};

/** 질문 ID → 접힌 상태 UI 아이콘 */
const QNA_COLLAPSED_ICON_BY_ID: Partial<Record<string, ContentUiIconKey>> = {
  "q-porter2-year": "battery-compare",
  "q-blackbox": "dashcam-drain",
  "q-agm60l-vs-ev12v": "low-voltage",
  "q-agm70l-vs-agm80l": "battery-compare",
  "q-cmf80l-search-80l": "caution",
  "q-100r-vs-agm95l": "battery-compare",
};

/** 펼친 상태 — 목적형 이미지 슬롯만 (임시 배너 PNG 금지) */
export function resolveQnaExpandedImageSlot(question: Question): ImageSlotDefinition | null {
  const id = question.id;
  const text = `${question.title} ${question.category}`;

  if (id === "q-blackbox" || (/블랙박스/.test(text) && /방전/.test(text))) {
    return QNA_IMAGE_SLOTS.blackboxCheck();
  }
  if (
    id === "q-porter2-year" ||
    id === "q-porter2-2020-100r" ||
    (/포터2/.test(text) && /90R|100R/.test(text))
  ) {
    return QNA_IMAGE_SLOTS.porterInstall();
  }
  if (id === "q-agm60l-vs-ev12v" || /EV\s*12V|EV12V|하이브리드.*12V/i.test(text)) {
    return QNA_IMAGE_SLOTS.hybridAuxLocation();
  }
  if (id === "q-agm70l-vs-agm80l" || /AGM70L.*AGM80L|vs.*AGM/i.test(text)) {
    return QNA_IMAGE_SLOTS.terminalDirection();
  }
  if (/CMF80L|80L.*축약/.test(text)) {
    return QNA_IMAGE_SLOTS.labelCheck();
  }
  if (/100R.*AGM95|AGM95.*100R/i.test(text)) {
    return QNA_IMAGE_SLOTS.terminalDirection();
  }

  return null;
}

export function resolveQnaCollapsedIconKey(question: Question): ContentUiIconKey {
  if (QNA_COLLAPSED_ICON_BY_ID[question.id]) {
    return QNA_COLLAPSED_ICON_BY_ID[question.id]!;
  }
  return resolveQuestionContentUiIcon(question, inferQuestionType(question));
}

export function resolveQnaCollapsedThumbUrl(_question: Question): string | null {
  return null;
}
