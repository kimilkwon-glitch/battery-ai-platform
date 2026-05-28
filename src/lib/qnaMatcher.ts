import {
  aiHref,
  compareHref,
  diagnosisHref,
  getBattery,
  getVehicle,
  guideHref,
  photoHref,
  questions,
  searchHref,
  type ActionLink,
  vehicleHref,
} from "./platform-data";

export type QuestionCategory =
  | "호환"
  | "업그레이드"
  | "방전"
  | "BMS"
  | "단자 방향"
  | "연식"
  | "EV 12V"
  | "규격";

export type MatchedQuestion = {
  query: string;
  questionType: QuestionCategory;
  shortAnswer: string;
  summary: string;
  warnings: string[];
  checks: string[];
  tags: string[];
  vehicleIds: string[];
  batteryCodes: string[];
  guideId: string;
};

function norm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function hasAny(text: string, tokens: string[]): boolean {
  return tokens.some((t) => text.includes(norm(t)));
}

const RULES: {
  test: (n: string) => boolean;
  match: (query: string) => Omit<MatchedQuestion, "query">;
}[] = [
  {
    test: (n) =>
      (hasAny(n, ["agm80l", "agm 80l"]) && hasAny(n, ["din74l", "din 74l", "din"])) ||
      (hasAny(n, ["agm"]) && hasAny(n, ["din"]) && hasAny(n, ["대신", "가능", "넣", "호환"])),
    match: (query) => ({
      questionType: "호환",
      shortAnswer:
        "ISG/스마트충전 차량은 AGM 규격 유지가 권장됩니다. 일반 DIN으로 낮추면 충전 제어와 수명 면에서 불리할 수 있습니다.",
      summary:
        "ISG/BMS 차량이라면 AGM 유지가 안전합니다. DIN74L은 단자·크기가 맞을 수 있어도 충전 제어 기준에 맞지 않을 수 있습니다.",
      warnings: ["ISG 유무", "BMS/IBS 등록", "터미널 L/R", "현재 SOH"],
      checks: ["AGM80L", "DIN74L", "ISG"],
      tags: ["AGM80L", "DIN74L", "ISG", "호환"],
      vehicleIds: ["grandeur-ig", "k5-dl3"],
      batteryCodes: ["AGM80L", "DIN74L"],
      guideId: "wrong-spec",
    }),
  },
  {
    test: (n) => hasAny(n, ["bms", "ibs", "등록", "초기화", "학습"]),
    match: () => ({
      questionType: "BMS",
      shortAnswer:
        "BMS/IBS 등록을 하지 않으면 차량이 이전 배터리 상태로 충전을 제어해 신품 수명이 줄거나 경고가 반복될 수 있습니다.",
      summary:
        "배터리 교체 후 BMS/IBS 등록·학습이 필요한 차종입니다. 등록 누락 시 충전 제어 오차와 경고등이 발생할 수 있습니다.",
      warnings: ["등록 절차", "순정 규격", "IBS 센서", "정비 이력"],
      checks: ["BMS 등록", "AGM92Ah", "IBS"],
      tags: ["BMS", "IBS", "등록", "충전 제어"],
      vehicleIds: ["bmw-g30", "grandeur-ig"],
      batteryCodes: ["AGM92Ah", "AGM80L"],
      guideId: "bms-register",
    }),
  },
  {
    test: (n) =>
      hasAny(n, ["ev6", "ev9", "ioniq", "아이오닉", "전기차"]) &&
      hasAny(n, ["12v", "12 v", "방전", "보조"]),
    match: () => ({
      questionType: "EV 12V",
      shortAnswer:
        "EV 12V 보조배터리는 일반 AGM과 충전·대기전류 특성이 다릅니다. SOH와 충전 이벤트 로그를 함께 보는 것이 좋습니다.",
      summary:
        "전기차 12V는 통신·문잠금·시동 준비에 영향을 줍니다. EV 전용 12V 규격과 대기전류를 우선 확인하는 것이 좋습니다.",
      warnings: ["EV 전용 규격", "대기전류", "SOH", "충전 로그"],
      checks: ["EV 12V", "SOH", "대기전류"],
      tags: ["EV6", "12V", "방전", "보조배터리"],
      vehicleIds: ["ev6", "ioniq5"],
      batteryCodes: ["EV 12V", "EV 12V AGM"],
      guideId: "ev-12v",
    }),
  },
  {
    test: (n) =>
      hasAny(n, ["포터", "porter", "봉고"]) &&
      hasAny(n, ["2020", "20년", "100r", "90r", "연식"]),
    match: () => ({
      questionType: "연식",
      shortAnswer: "2020년 이후 연식은 100R 기준으로 확인하는 것이 좋습니다.",
      summary:
        "2019년식까지는 90R(GB90R) 계열이 많고, 2020년형 이후는 100R(GB100R) 기준으로 확인해야 합니다. 크기가 비슷해도 호환되지 않을 수 있습니다.",
      warnings: ["연식 확인", "90R vs 100R", "단자 방향", "사진 확인"],
      checks: ["90R", "100R", "연식"],
      tags: ["포터2", "2020년식", "90R", "100R"],
      vehicleIds: ["porter2-new"],
      batteryCodes: ["100R", "90R"],
      guideId: "wrong-spec",
    }),
  },
  {
    test: (n) => hasAny(n, ["스타리아", "staria"]) && hasAny(n, ["lpg", "agm80r", "agm80l", "80r"]),
    match: () => ({
      questionType: "단자 방향",
      shortAnswer: "스타리아 LPG는 AGM80R 기준으로 확인합니다.",
      summary:
        "스타리아(US4)는 디젤·LPG 모두 AGM80R로 확인하는 경우가 많습니다. AGM80L과 R단자 혼동이 잦아 사진 확인을 권장합니다.",
      warnings: ["단자 L/R", "LPG 트림", "사진 확인"],
      checks: ["AGM80R", "AGM80L", "단자 방향"],
      tags: ["스타리아", "LPG", "AGM80R", "단자 방향"],
      vehicleIds: ["staria-us4"],
      batteryCodes: ["AGM80R", "AGM80L"],
      guideId: "terminal-lr",
    }),
  },
  {
    test: (n) =>
      (hasAny(n, ["agm60l", "agm 60l"]) && hasAny(n, ["agm70l", "agm 70l"])) ||
      (hasAny(n, ["셀토스", "seltos"]) && hasAny(n, ["업그레이드", "용량", "70l"])),
    match: () => ({
      questionType: "업그레이드",
      shortAnswer: "장착 공간과 충전 제어 조건을 먼저 확인하는 것이 좋습니다.",
      summary:
        "셀토스 ISG 트림에서 AGM60L→AGM70L 업그레이드는 트레이 공간·CCA·충전 제어 조건을 확인한 뒤 판단하는 것이 안전합니다.",
      warnings: ["장착 공간", "ISG 여부", "충전 제어", "CCA"],
      checks: ["AGM60L", "AGM70L", "ISG"],
      tags: ["셀토스", "AGM60L", "AGM70L", "업그레이드"],
      vehicleIds: ["seltos"],
      batteryCodes: ["AGM60L", "AGM70L"],
      guideId: "agm-sizes",
    }),
  },
  {
    test: (n) => hasAny(n, ["블랙박스", "상시전원", "대기전류"]),
    match: () => ({
      questionType: "방전",
      shortAnswer: "블랙박스 상시전원은 반복 방전의 대표 원인입니다. 컷오프 전압과 대기전류를 먼저 점검하세요.",
      summary:
        "주차녹화·상시전원 사용 시 컷오프를 12.2V 이상으로 설정하면 방전 반복을 줄일 수 있습니다. 배터리 SOH도 함께 보는 것이 좋습니다.",
      warnings: ["컷오프 전압", "대기전류", "SOH"],
      checks: ["대기전류", "OCV", "컷오프"],
      tags: ["블랙박스", "방전", "대기전류"],
      vehicleIds: ["sorento-mq4", "seltos"],
      batteryCodes: ["AGM80L", "AGM60L"],
      guideId: "blackbox-cutoff",
    }),
  },
];

export function matchQuestion(query: string): MatchedQuestion {
  const trimmed = query.trim();
  const n = norm(trimmed);

  for (const rule of RULES) {
    if (rule.test(n)) {
      return { query: trimmed, ...rule.match(trimmed) };
    }
  }

  const catalog = questions.find(
    (q) =>
      trimmed.includes(q.title.slice(0, 14)) ||
      q.title.includes(trimmed.slice(0, 14)) ||
      q.tags.some((t) => n.includes(norm(t))),
  );
  if (catalog) {
    return {
      query: trimmed || catalog.title,
      questionType: (catalog.questionType as QuestionCategory) ?? "규격",
      shortAnswer: catalog.shortAnswer ?? catalog.answer.slice(0, 120),
      summary: catalog.answer,
      warnings: ["차량명/연식 확인", "현재 배터리 사진", "ISG·BMS 여부"],
      checks: catalog.tags,
      tags: catalog.tags,
      vehicleIds: catalog.vehicleId ? [catalog.vehicleId] : [],
      batteryCodes: catalog.batteryCode ? [catalog.batteryCode] : [],
      guideId: catalog.guideId ?? "agm-vs-din",
    };
  }

  return {
    query: trimmed,
    questionType: "규격",
    shortAnswer:
      "차량명·연식·연료·현재 배터리 규격을 함께 알려주시면 AGM/DIN 호환, CCA, BMS 등록 필요 여부를 구체적으로 안내할 수 있습니다.",
    summary:
      "차량·연식·현재 규격을 알려주시면 AGM/DIN 호환, CCA, BMS 등록 필요 여부를 구체적으로 안내할 수 있습니다.",
    warnings: ["차량명/연식", "배터리 사진", "증상 발생 시점"],
    checks: ["CCA", "SOH", "대기전류"],
    tags: ["규격", "호환"],
    vehicleIds: ["grandeur-ig"],
    batteryCodes: ["AGM80L"],
    guideId: "agm-vs-din",
  };
}

export function getShortAnswer(query: string): string {
  return matchQuestion(query).shortAnswer;
}

export function getRelatedVehiclesFromQuestion(query: string) {
  const matched = matchQuestion(query);
  return matched.vehicleIds.map((id) => getVehicle(id));
}

export function getRelatedBatteriesFromQuestion(query: string) {
  const matched = matchQuestion(query);
  return matched.batteryCodes.map((code) => getBattery(code));
}

export function getSuggestedActionsFromQuestion(query: string): ActionLink[] {
  const matched = matchQuestion(query);
  const actions: ActionLink[] = [];
  const seen = new Set<string>();

  function add(link: ActionLink) {
    if (seen.has(link.href)) return;
    seen.add(link.href);
    actions.push(link);
  }

  for (const code of matched.batteryCodes.slice(0, 2)) {
    add({ title: `${code} 보기`, description: "규격·호환 차종", href: searchHref(code) });
  }

  if (matched.batteryCodes.length >= 2) {
    add({
      title: "배터리 비교",
      description: `${matched.batteryCodes[0]} vs ${matched.batteryCodes[1]}`,
      href: compareHref(matched.batteryCodes[0], matched.batteryCodes[1]),
    });
  }

  add({ title: "관련 가이드", description: "실무 기준 정리", href: guideHref(matched.guideId) });

  for (const v of matched.vehicleIds.slice(0, 1)) {
    add({
      title: "차량별 규격 확인",
      description: getVehicle(v).displayName,
      href: vehicleHref(v),
    });
  }

  add({ title: "사진으로 규격 확인", description: "라벨·단자 확인", href: photoHref(matched.batteryCodes[0]) });
  add({ title: "증상으로 확인", description: "방전·시동 지연", href: diagnosisHref() });

  return actions.slice(0, 6);
}

export function toMockAiAnswer(query: string) {
  const matched = matchQuestion(query);
  const vehicle = matched.vehicleIds[0] ? getVehicle(matched.vehicleIds[0]) : undefined;
  const battery = matched.batteryCodes[0] ? getBattery(matched.batteryCodes[0]) : undefined;

  return {
    question: matched.query,
    questionType: matched.questionType,
    summary: matched.summary,
    shortAnswer: matched.shortAnswer,
    warnings: matched.warnings,
    checks: matched.checks,
    tags: matched.tags,
    vehicle,
    battery,
    guideId: matched.guideId,
    batteries: matched.batteryCodes,
    vehicles: matched.vehicleIds.map((id) => getVehicle(id)),
  };
}

export { aiHref };
