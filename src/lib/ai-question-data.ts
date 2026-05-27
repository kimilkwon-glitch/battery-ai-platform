export type AiQuestion = {
  question: string;
  category: string;
  href: string;
};

export type AiAnswerExperience = {
  question: string;
  intent: string;
  shortAnswer: string;
  risk: string;
  urgency: string;
  recommendedBattery: string;
  replacementWindow: string;
  agmRequired: string;
  bmsWarning: string;
  relatedVehicles: string[];
  widgets: [string, string, string][];
  cards: {
    title: string;
    value: string;
    detail: string;
    tone: string;
  }[];
  relatedQuestions: string[];
  guides: string[];
  cases: string[];
  batteries: string[];
  compatibility: string[];
};

export const suggestedQuestions: AiQuestion[] = [
  { question: "AGM 차량에 일반 배터리 넣어도 되나요?", category: "AGM 호환", href: "/ai/chat?q=AGM 차량에 일반 배터리 넣어도 되나요?" },
  { question: "EV6 12V 방전 왜 생기나요?", category: "EV 12V", href: "/ai/chat?q=EV6 12V 방전 왜 생기나요?" },
  { question: "블랙박스 때문에 방전될 수 있나요?", category: "대기전류", href: "/ai/chat?q=블랙박스 때문에 방전될 수 있나요?" },
  { question: "AGM80L 대신 DIN74L 사용 가능?", category: "호환 규격", href: "/ai/chat?q=AGM80L 대신 DIN74L 사용 가능?" },
  { question: "BMS 등록 안 하면 어떻게 되나요?", category: "BMS/IBS", href: "/ai/chat?q=BMS 등록 안 하면 어떻게 되나요?" },
];

export const popularQuestions: AiQuestion[] = [
  { question: "시동이 늦게 걸리면 배터리 교체해야 하나요?", category: "시동 지연", href: "/ai/chat?q=시동이 늦게 걸리면 배터리 교체해야 하나요?" },
  { question: "쏘렌토 MQ4 배터리는 AGM95L이 맞나요?", category: "쏘렌토 MQ4", href: "/ai/chat?q=쏘렌토 MQ4 배터리는 AGM95L이 맞나요?" },
  { question: "겨울철 CCA 저하는 어떻게 확인하나요?", category: "겨울철", href: "/ai/chat?q=겨울철 CCA 저하는 어떻게 확인하나요?" },
  { question: "단거리 주행이면 배터리가 빨리 닳나요?", category: "충전 부족", href: "/ai/chat?q=단거리 주행이면 배터리가 빨리 닳나요?" },
];

export const recentQuestions: AiQuestion[] = [
  { question: "BMW G30 배터리 등록 꼭 해야 하나요?", category: "BMW BMS", href: "/ai/chat?q=BMW G30 배터리 등록 꼭 해야 하나요?" },
  { question: "블랙박스 컷오프 12.2V면 안전한가요?", category: "블랙박스", href: "/ai/chat?q=블랙박스 컷오프 12.2V면 안전한가요?" },
  { question: "SOH 78%면 교체 시기인가요?", category: "SOH 감소", href: "/ai/chat?q=SOH 78%면 교체 시기인가요?" },
];

export const vehicleQuestionGroups = [
  ["쏘렌토 MQ4", "AGM95L", "ISG/IBS AGM 호환", "/ai/chat?q=쏘렌토 MQ4 AGM95L 교체할 때 주의할 점"],
  ["EV6", "EV 12V", "보조배터리 반복 방전", "/ai/chat?q=EV6 12V 보조배터리 반복 방전 원인"],
  ["BMW G30", "AGM92Ah", "교체 후 배터리 등록", "/ai/chat?q=BMW G30 배터리 등록 안 하면 어떻게 되나요"],
  ["그랜저 GN7", "AGM80L", "BMS 충전 제어", "/ai/chat?q=그랜저 GN7 AGM80L 호환되나요"],
];

const defaultQuestion = "AGM 차량에 일반 배터리 넣어도 되나요?";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function getAiAnswerExperience(questionValue?: string): AiAnswerExperience {
  const question = questionValue?.trim() || defaultQuestion;
  const normalized = normalize(question);
  const isEv = normalized.includes("ev") || normalized.includes("12v") || normalized.includes("전기차");
  const isBlackbox = normalized.includes("블랙박스") || normalized.includes("상시전원") || normalized.includes("대기전류");
  const isBms = normalized.includes("bms") || normalized.includes("ibs") || normalized.includes("등록");
  const isDin = normalized.includes("din74") || normalized.includes("일반 배터리");
  const isWinter = normalized.includes("겨울") || normalized.includes("cca");

  const intent = isEv
    ? "EV 12V 보조배터리 진단"
    : isBlackbox
      ? "블랙박스 대기전력 분석"
      : isBms
        ? "BMS/IBS 등록 리스크"
        : isDin
          ? "AGM 호환성 판단"
          : "배터리 증상 종합 분석";

  return {
    question,
    intent,
    shortAnswer: isEv
      ? "EV6 같은 전기차도 12V 보조배터리가 방전되면 통신, 문잠금, 시동 준비가 불안정해질 수 있습니다. SOH와 대기전류, 충전 이벤트 로그를 함께 확인하세요."
      : isBlackbox
        ? "블랙박스 상시전원은 반복 방전의 대표 원인입니다. 컷오프 전압, 주차녹화 시간, 대기전류를 먼저 점검하는 것이 좋습니다."
        : isBms
          ? "BMS/IBS 등록을 하지 않으면 차량이 이전 배터리 상태로 충전을 제어해 신품 배터리 수명이 줄거나 경고가 반복될 수 있습니다."
          : "ISG/IBS 차량은 AGM 호환 규격을 유지하는 편이 안전합니다. 일반 DIN 배터리로 낮추면 CCA, SOH, 충전 제어 안정성이 떨어질 수 있습니다.",
    risk: isEv || isBms ? "높음" : isBlackbox || isWinter ? "중상" : "주의",
    urgency: isEv ? "48시간 내 점검" : isBms ? "교체 즉시 등록 확인" : "7일 내 점검 권장",
    recommendedBattery: isEv ? "EV auxiliary battery" : isDin ? "AGM80L 또는 순정 AGM" : "AGM80L / AGM95L",
    replacementWindow: isWinter || isEv ? "1-3개월" : "3-6개월",
    agmRequired: isDin || isBms ? "ISG 차량은 AGM 유지 권장" : "차종별 순정 규격 확인",
    bmsWarning: isBms ? "BMS 초기화/배터리 등록 필요" : "IBS 센서 차량은 등록 여부 확인",
    relatedVehicles: isEv ? ["EV6", "EV9", "아이오닉5"] : ["쏘렌토 MQ4", "그랜저 GN7", "BMW G30"],
    widgets: [
      ["배터리 건강 점수", isEv ? "76/100" : "82/100", "SOH 추정"],
      ["SOH 추정", isBlackbox ? "78%" : "84%", "교체 전 모니터링"],
      ["충전 상태", isBms ? "등록 확인" : "12.42V", "BMS/IBS 기준"],
      ["겨울철 위험도", isWinter ? "높음" : "중상", "CCA 저하 영향"],
      ["대기전류 위험", isBlackbox ? "높음" : "주의", "상시전원 확인"],
    ],
    cards: [
      {
        title: "원인 분석",
        value: isBlackbox ? "대기전류 가능성 68%" : isEv ? "EV 12V 관리 이슈 64%" : "AGM 호환 리스크 71%",
        detail: "CCA 저하, SOH 감소, 단거리 주행, 발전기 충전 부족 신호를 함께 비교했습니다.",
        tone: "from-blue-500 to-cyan-400",
      },
      {
        title: "위험도",
        value: isEv || isBms ? "높음" : "중상",
        detail: "방치 시 재방전, 경고등, 시동 지연, 전장품 오류로 이어질 수 있습니다.",
        tone: "from-red-500 to-orange-400",
      },
      {
        title: "추천 배터리",
        value: isEv ? "EV 12V AGM" : "AGM80L / AGM95L",
        detail: "차종별 순정 Ah, CCA, 터미널 방향, LN/DIN 호환을 확인하세요.",
        tone: "from-indigo-500 to-blue-500",
      },
      {
        title: "BMS/IBS 경고",
        value: isBms ? "등록 필수" : "확인 필요",
        detail: "BMS 초기화 또는 배터리 등록 누락은 충전 제어 오차를 만들 수 있습니다.",
        tone: "from-slate-900 to-blue-700",
      },
    ],
    relatedQuestions: [
      "SOH 80% 이하면 바로 교체해야 하나요?",
      "블랙박스 컷오프 전압은 몇 V가 좋나요?",
      "AGM80L과 DIN74L 차이가 뭔가요?",
      "단거리 주행이 배터리에 왜 안 좋나요?",
    ],
    guides: ["AGM 호환 규격 확인법", "BMS 초기화와 배터리 등록", "블랙박스 상시전원 설정", "겨울철 CCA 점검"],
    cases: ["쏘렌토 MQ4 AGM 다운그레이드 후 시동 지연", "EV6 12V 반복 방전 진단", "BMW G30 배터리 등록 누락 경고"],
    batteries: ["AGM80L", "AGM70L", "DIN74L", "EV auxiliary battery"],
    compatibility: ["AGM 호환", "ISG 차량", "LN/DIN 규격", "터미널 L/R", "BMS 초기화"],
  };
}
