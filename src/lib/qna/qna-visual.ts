import type { ImageSlotDefinition } from "@/lib/media/image-slot-registry";
import { QNA_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import {
  type ContentUiIconKey,
  resolveQuestionContentUiIcon,
} from "@/lib/content-ui-icons";
import type { Question } from "@/lib/platform-types";
import { inferQuestionType } from "@/lib/qna-hub-data";

/** 접힌 카드 — 질문 ID별 전용 작은 썸네일 (없으면 아이콘만, 공통 fallback 금지) */
const QNA_COLLAPSED_THUMB_BY_ID: Partial<Record<string, string>> = {
  "q-blackbox": "/assets/content/symptom_blackbox_drain.png",
  "q-porter2-year": "/assets/content/guide_porter2_90r_100r.png",
  "q-agm60l-vs-ev12v": "/assets/content/guide_ev12v.png",
  "q-agm70l-vs-agm80l": "/assets/content/guide_agm_vs_din.png",
  "q-cmf80l-search-80l": "/assets/content/caution_wrong_spec.png",
};

/** 질문 ID → 접힌 상태 UI 아이콘 (PNG 없어도 글리프 fallback) */
const QNA_COLLAPSED_ICON_BY_ID: Partial<Record<string, ContentUiIconKey>> = {
  "q-porter2-year": "battery-compare",
  "q-blackbox": "dashcam-drain",
  "q-agm60l-vs-ev12v": "low-voltage",
  "q-agm70l-vs-agm80l": "battery-compare",
  "q-cmf80l-search-80l": "caution",
};

/** 펼친 상태 — 질문별 콘텐츠 이미지 슬롯 (섹션 공통 blackbox 금지) */
export function resolveQnaExpandedImageSlot(question: Question): ImageSlotDefinition | null {
  const id = question.id;
  const text = `${question.title} ${question.category}`;

  if (id === "q-blackbox" || (/블랙박스/.test(text) && /방전/.test(text))) {
    return QNA_IMAGE_SLOTS.blackboxCheck();
  }
  if (
    id === "q-porter2-year" ||
    id === "q-porter2-2020-100r" ||
    /포터2/.test(text) && /90R|100R/.test(text)
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
  if (/단자|L\/R|방향/.test(text)) {
    return QNA_IMAGE_SLOTS.terminalDirection();
  }

  return null;
}

/** 접힌 카드 좌측 — 아이콘 키 (카테고리·질문별) */
export function resolveQnaCollapsedIconKey(question: Question): ContentUiIconKey {
  if (QNA_COLLAPSED_ICON_BY_ID[question.id]) {
    return QNA_COLLAPSED_ICON_BY_ID[question.id]!;
  }
  return resolveQuestionContentUiIcon(question, inferQuestionType(question));
}

/**
 * 접힌 카드 전용 작은 썸네일 URL.
 * 질문 ID에 매핑된 경우만 반환 — 블랙박스 이미지를 다른 Q&A에 쓰지 않음.
 */
export function resolveQnaCollapsedThumbUrl(question: Question): string | null {
  return QNA_COLLAPSED_THUMB_BY_ID[question.id] ?? null;
}
