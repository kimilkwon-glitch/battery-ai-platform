import type { Question, QuestionType } from "./platform-types";

export const QNA_FEATURED_IDS = [
  "q-bmw-bms",
  "q-din-agm",
  "q-blackbox",
  "q-staria-80r",
  "q-ev6-12v",
] as const;

export const QNA_FEATURED_VISIBLE = 5;

export const QNA_HERO_CHIPS = [
  { label: "AGM 업그레이드", query: "AGM 업그레이드" },
  { label: "12V 방전", query: "12V 방전" },
  { label: "BMS 등록", query: "BMS 등록" },
  { label: "AGM80L", query: "AGM80L" },
  { label: "포터2 100R", query: "포터2 100R" },
  { label: "스타리아 AGM80R", query: "스타리아 AGM80R" },
] as const;

export type QnaPrimaryFilter =
  | "all"
  | "vehicle"
  | "battery"
  | "symptom"
  | "agm-din"
  | "bms"
  | "upgrade"
  | "import-ev"
  | "ev-hybrid"
  | "porter"
  | "photo";

export const QNA_PRIMARY_FILTERS: { key: QnaPrimaryFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "vehicle", label: "차량 질문" },
  { key: "battery", label: "배터리 규격" },
  { key: "symptom", label: "방전/시동 문제" },
  { key: "agm-din", label: "AGM/DIN/CMF" },
  { key: "ev-hybrid", label: "EV/하이브리드" },
  { key: "porter", label: "포터/상용" },
  { key: "photo", label: "사진확인" },
  { key: "bms", label: "BMS/IBS 등록" },
  { key: "upgrade", label: "업그레이드" },
  { key: "import-ev", label: "수입차" },
];

export const QNA_SECONDARY_TAGS = [
  "AGM60L",
  "AGM70L",
  "AGM80L",
  "AGM95L",
  "DIN74L",
  "90R/100R",
  "포터2",
  "그랜저 IG",
  "쏘렌토 MQ4",
  "스타리아",
] as const;

export const QNA_TOPIC_GROUPS = [
  { key: "vehicle", label: "차량별" },
  { key: "battery", label: "배터리 규격별" },
  { key: "symptom", label: "방전/증상별" },
  { key: "service", label: "교체/등록/코딩별" },
] as const;

export type QnaTopicKey = (typeof QNA_TOPIC_GROUPS)[number]["key"];

export const RECENT_QNA_PAGE_SIZE = 6;

const WARNING_TYPES: QuestionType[] = ["업그레이드", "BMS/IBS", "단자 방향", "AGM/DIN"];

export function getShortAnswer(q: Question): string {
  if (q.shortAnswer) return q.shortAnswer;
  const first = q.answer.split(/(?<=[.!?])\s+/)[0] ?? q.answer;
  return first.length > 120 ? `${first.slice(0, 117)}…` : first;
}

export function inferQuestionType(q: Question): QuestionType {
  if (q.questionType) return q.questionType;
  const text = `${q.title} ${q.category} ${q.tags.join(" ")}`;
  if (/업그레이드|용량업|다운그레이드/.test(text)) return "업그레이드";
  if (/BMS|IBS|등록/.test(text)) return "BMS/IBS";
  if (/방전|시동|CCA|전압|12\.1V/.test(text)) return "방전";
  if (/L\/R|단자|80R|80L/.test(text) && /단자|R단|L단|80R|80L/.test(text)) return "단자 방향";
  if (/EV|12V/.test(text) && /EV|전기/.test(text)) return "EV 12V";
  if (/포터|봉고|90R|100R|상용/.test(text)) return "상용차";
  if (/BMW|수입|G30|G80|제네시스/.test(text)) return "수입차";
  if (/AGM|DIN|ISG|호환/.test(text)) return "AGM/DIN";
  return "규격 호환";
}

export function questionTypeTone(type: QuestionType): "warning" | "default" {
  return WARNING_TYPES.includes(type) ? "warning" : "default";
}

export function matchesPrimaryFilter(q: Question, filter: QnaPrimaryFilter): boolean {
  if (filter === "all") return true;
  const text = `${q.title} ${q.category} ${q.tags.join(" ")}`;
  const type = inferQuestionType(q);

  switch (filter) {
    case "vehicle":
      return Boolean(q.vehicleId);
    case "battery":
      return Boolean(q.batteryCode) || /AGM|DIN|90R|100R|CMF/.test(q.tags.join(" "));
    case "symptom":
      return type === "방전" || /방전|시동|CCA|전압/.test(text);
    case "agm-din":
      return type === "AGM/DIN" || /AGM|DIN|ISG|호환/.test(text);
    case "bms":
      return type === "BMS/IBS" || q.guideId === "bms-register";
    case "upgrade":
      return type === "업그레이드";
    case "import-ev":
      return type === "수입차";
    case "ev-hybrid":
      return type === "EV 12V" || /하이브리드|EV|12V|보조/.test(text);
    case "porter":
      return type === "상용차" || /포터|90R|100R|봉고|상용/.test(text);
    case "photo":
      return q.ctaType === "photo" || /사진|단자|라벨|확인/.test(text);
    default:
      return true;
  }
}

export function matchesTagFilter(q: Question, tag: string): boolean {
  if (tag === "90R/100R") {
    return q.tags.some((t) => /90R|100R|포터/.test(t)) || q.title.includes("90R") || q.title.includes("100R");
  }
  return q.tags.some((t) => t.includes(tag)) || q.title.includes(tag);
}

export function matchesSearchQuery(q: Question, query: string): boolean {
  const qn = query.trim().toLowerCase();
  if (!qn) return true;
  return (
    q.title.toLowerCase().includes(qn) ||
    q.answer.toLowerCase().includes(qn) ||
    q.tags.some((t) => t.toLowerCase().includes(qn)) ||
    q.category.toLowerCase().includes(qn) ||
    (q.relatedSearchQueries?.some((sq) => sq.toLowerCase().includes(qn) || qn.includes(sq.toLowerCase())) ??
      false)
  );
}

export function matchesTopicGroup(q: Question, key: QnaTopicKey): boolean {
  const type = inferQuestionType(q);
  switch (key) {
    case "vehicle":
      return Boolean(q.vehicleId);
    case "battery":
      return Boolean(q.batteryCode) || type === "AGM/DIN" || type === "단자 방향" || type === "규격 호환";
    case "symptom":
      return type === "방전";
    case "service":
      return type === "BMS/IBS" || type === "업그레이드" || type === "수입차";
    default:
      return false;
  }
}

export function sortQuestionsByRecent(questions: Question[]): Question[] {
  return [...questions].sort((a, b) => {
    const da = a.updatedAt ?? "2026-01-01";
    const db = b.updatedAt ?? "2026-01-01";
    return db.localeCompare(da);
  });
}

export function isFeaturedQuestion(q: Question): boolean {
  return q.featured === true || (QNA_FEATURED_IDS as readonly string[]).includes(q.id);
}

export const QNA_SIDEBAR_TOPICS = [
  { label: "AGM 업그레이드", filter: "upgrade" as QnaPrimaryFilter },
  { label: "BMS 등록", filter: "bms" as QnaPrimaryFilter },
  { label: "12V 방전", filter: "symptom" as QnaPrimaryFilter },
  { label: "단자 방향", query: "단자 방향" },
  { label: "포터2 100R", query: "포터2 100R" },
] as const;

export const QNA_PREP_CHECKLIST = [
  "차량명",
  "연식",
  "연료",
  "기존 배터리 사진",
  "단자 방향",
] as const;

const DISPLAY_TAG_OVERRIDES: Record<string, string[]> = {
  "q-porter2-year": ["포터2", "100R"],
  "q-staria-80r": ["스타리아", "AGM80R"],
  "q-blackbox": ["블랙박스 방전"],
  "q-g80-rg3": ["G80", "AGM95R"],
  "q-bmw-bms": ["BMS 등록"],
  "q-din-agm": ["AGM80L", "DIN74L"],
  "q-ev6-12v": ["EV6", "12V 방전"],
};

function normalizeTag(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** 질문 카드에 노출할 태그 — 무관 차량명 제거, 최대 2개 */
export function pickQuestionDisplayTags(question: Question, questionType: QuestionType): string[] {
  const override = DISPLAY_TAG_OVERRIDES[question.id];
  if (override) return override.slice(0, 1);

  const blob = normalizeTag(`${question.title} ${question.shortAnswer ?? ""} ${question.category}`);
  const seen = new Set<string>();
  const chips: string[] = [];

  const push = (value: string) => {
    const key = normalizeTag(value);
    if (!key || key === normalizeTag(questionType) || seen.has(key)) return;
    if (/자주\s*묻는|대표|연료별|^agm$|^isg$/i.test(value)) return;
    seen.add(key);
    chips.push(value.trim());
  };

  if (question.batteryCode && blob.includes(normalizeTag(question.batteryCode))) {
    push(question.batteryCode);
  }

  for (const tag of question.tags) {
    const t = tag.trim();
    if (/자주\s*묻는|대표|연료별/i.test(t)) continue;
    const tn = normalizeTag(t);
    if (tn.length < 2) continue;
    if (blob.includes(tn)) push(t);
    else if (question.batteryCode && tn.includes(normalizeTag(question.batteryCode))) push(t);
    else if (/블랙박스|방전|bms|ibs|agm|din|ev|12v|포터|스타리아|쏘렌토|그랜저|g80/i.test(t) && blob.split(" ").some((w) => tn.includes(w) && w.length > 2)) {
      push(t);
    }
  }

  return chips.slice(0, 1);
}
