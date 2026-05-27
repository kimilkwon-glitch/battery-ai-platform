import type { Question } from "./platform-types";
import type { QuestionType } from "./platform-types";
import { inferQuestionType } from "./qna-hub-data";

export type ContentUiIconKey =
  | "start-delay"
  | "low-voltage"
  | "bms-registration"
  | "dashcam-drain"
  | "photo-analysis"
  | "battery-compare"
  | "upgrade"
  | "spec-guide"
  | "faq"
  | "caution"
  | "shopping-notice";

const ICON_BASE = "/assets/content-ui-icons";

/** @512.png 우선 — UI 썸네일·보조 아이콘 전용 (16:9 콘텐츠 대표 이미지 아님) */
export const CONTENT_UI_ICON_SRC: Record<ContentUiIconKey, string> = {
  "start-delay": `${ICON_BASE}/bm-icon-start-delay@512.png`,
  "low-voltage": `${ICON_BASE}/bm-icon-low-voltage@512.png`,
  "bms-registration": `${ICON_BASE}/bm-icon-bms-registration@512.png`,
  "dashcam-drain": `${ICON_BASE}/bm-icon-dashcam-drain@512.png`,
  "photo-analysis": `${ICON_BASE}/bm-icon-photo-analysis@512.png`,
  "battery-compare": `${ICON_BASE}/bm-icon-battery-compare@512.png`,
  upgrade: `${ICON_BASE}/bm-icon-upgrade@512.png`,
  "spec-guide": `${ICON_BASE}/bm-icon-spec-guide@512.png`,
  faq: `${ICON_BASE}/bm-icon-faq@512.png`,
  caution: `${ICON_BASE}/bm-icon-caution@512.png`,
  "shopping-notice": `${ICON_BASE}/bm-icon-shopping-notice@512.png`,
};

export function getContentUiIconSrc(key: ContentUiIconKey): string {
  return CONTENT_UI_ICON_SRC[key];
}

/** 제목·메타·태그 텍스트 → UI 아이콘 (진단 사례·검색 카드 등) */
export function resolveContentUiIconFromText(text: string): ContentUiIconKey {
  const s = text;

  if (/사진|라벨|촬영|OCR|단자 촬영|photo/i.test(s)) return "photo-analysis";
  if (/BMS|IBS|등록|코딩|스마트충전/i.test(s)) return "bms-registration";
  if (/블랙박스|장기주차|대기전류|야간방전|컷오프/i.test(s)) return "dashcam-drain";
  if (/시동|딸깍|전기계통|시동 지연|시동 불량/i.test(s)) return "start-delay";
  if (/저전압|12V|EV 12V|보조배터리|방전|OCV|CCA/i.test(s)) return "low-voltage";
  if (/비교|vs|L\/R|단자 방향|AGM80L.*AGM80R|혼동/i.test(s)) return "battery-compare";
  if (/업그레이드|용량|다운그레이드|AGM60L|AGM70L|AGM80L|AGM95L|DIN74/i.test(s)) return "upgrade";
  if (/쇼핑|주문|배송|택배|구매/i.test(s)) return "shopping-notice";
  if (/주의|경고|비권장|확인 필요|예외|헷갈/i.test(s)) return "caution";
  if (/규격|스펙|브랜드|AGM\/DIN|가이드|GUIDE/i.test(s)) return "spec-guide";
  if (/FAQ|질문|Q&A/i.test(s)) return "faq";

  return "faq";
}

/** FAQ/Q&A 카드 좌측 아이콘 */
export function resolveQuestionContentUiIcon(question: Question, type?: QuestionType): ContentUiIconKey {
  const qType = type ?? inferQuestionType(question);
  const text = `${question.title} ${question.category} ${question.tags.join(" ")}`;

  if (/사진|라벨|촬영|OCR/.test(text)) return "photo-analysis";
  if (qType === "BMS/IBS" || /BMS|IBS|등록|코딩|스마트충전/.test(text)) return "bms-registration";
  if (/블랙박스|장기주차|대기전류|야간/.test(text)) return "dashcam-drain";
  if (/시동|딸깍|전기계통/.test(text)) return "start-delay";
  if (qType === "EV 12V" || qType === "방전" || /저전압|12V|방전/.test(text)) return "low-voltage";

  if (!question.batteryCode && !question.vehicleId) return "faq";

  if (
    qType === "AGM/DIN" ||
    qType === "단자 방향" ||
    /비교|vs|L\/R|대신|DIN74/.test(text)
  ) {
    return "battery-compare";
  }
  if (qType === "업그레이드" || /업그레이드|용량|다운그레이드/.test(text)) return "upgrade";
  if (/주의|경고|비권장/.test(text)) return "caution";
  if (/쇼핑|주문|배송/.test(text)) return "shopping-notice";
  if (/AGM|DIN|규격|스펙|호환/.test(text)) return "spec-guide";

  return "faq";
}
