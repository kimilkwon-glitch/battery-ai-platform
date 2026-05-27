export type DiagnosisCategory = {
  slug: string;
  title: string;
  subtitle: string;
  metric: string;
  tone: string;
  tags: string[];
};

export type SymptomDiagnosis = DiagnosisCategory & {
  severity: string;
  urgency: string;
  healthScore: string;
  failureProbability: string;
  confidence: string;
  summary: string;
  signals: [string, string, string][];
  analysis: {
    title: string;
    probability: string;
    detail: string;
    tone: string;
  }[];
  actions: {
    title: string;
    priority: string;
    detail: string;
  }[];
  batteries: {
    model: string;
    fit: string;
    note: string;
    specs: [string, string][];
  }[];
  timeline: {
    label: string;
    status: string;
    detail: string;
    risk: string;
  }[];
  related: string[];
};

export const diagnosisCategories: DiagnosisCategory[] = [
  {
    slug: "slow-engine-start",
    title: "시동 늦게 걸림",
    subtitle: "CCA 저하, SOH 감소, 단거리 충전 부족 가능성을 분석합니다.",
    metric: "원인 매칭 94%",
    tone: "from-blue-500 to-cyan-400",
    tags: ["CCA 저하", "SOH 감소", "ISG 차량"],
  },
  {
    slug: "blackbox-drain",
    title: "블랙박스 방전",
    subtitle: "대기전류, 컷오프 전압, 주차녹화 패턴을 진단합니다.",
    metric: "대기전류 의심 68%",
    tone: "from-slate-900 to-blue-700",
    tags: ["대기전류", "블랙박스", "OCV"],
  },
  {
    slug: "winter-discharge",
    title: "겨울철 방전",
    subtitle: "저온 CCA 성능 저하와 교체 예상 시점을 계산합니다.",
    metric: "저온 위험 +31%",
    tone: "from-sky-500 to-blue-400",
    tags: ["CCA", "저온", "SOH"],
  },
  {
    slug: "agm-replacement",
    title: "AGM 교체 필요",
    subtitle: "AGM 호환, ISG 차량, BMS 초기화 필요성을 확인합니다.",
    metric: "AGM 호환 97%",
    tone: "from-indigo-500 to-blue-500",
    tags: ["AGM 호환", "BMS 초기화", "ISG 차량"],
  },
  {
    slug: "ev12v-discharge",
    title: "EV 12V 배터리 문제",
    subtitle: "전기차 보조배터리 SOH, 대기전류, 충전 이벤트를 분석합니다.",
    metric: "재방전 위험 91%",
    tone: "from-cyan-500 to-blue-600",
    tags: ["EV 보조배터리", "BMS", "SOH"],
  },
  {
    slug: "battery-warning-light",
    title: "배터리 경고등",
    subtitle: "발전기, 충전 전압, 배선 접촉 불량 가능성을 분류합니다.",
    metric: "충전계통 의심 73%",
    tone: "from-red-500 to-orange-400",
    tags: ["발전기", "충전 전압", "경고등"],
  },
  {
    slug: "ibs-bms-error",
    title: "IBS/BMS 오류",
    subtitle: "IBS 센서 문제, BMS 등록 누락, 충전 제어 오차를 확인합니다.",
    metric: "센서 이슈 82%",
    tone: "from-violet-500 to-blue-500",
    tags: ["IBS 센서", "BMS 초기화", "충전 제어"],
  },
  {
    slug: "short-trip-charging",
    title: "단거리 주행 문제",
    subtitle: "짧은 주행으로 인한 충전 부족과 SOH 감소 패턴을 진단합니다.",
    metric: "충전 부족 76%",
    tone: "from-emerald-500 to-cyan-400",
    tags: ["단거리", "충전 부족", "SOH 감소"],
  },
];

const commonBatteries: SymptomDiagnosis["batteries"] = [
  {
    model: "AGM80L",
    fit: "ISG 세단/SUV 추천",
    note: "AGM 호환 차량에서 CCA와 충전 제어 안정성이 좋습니다.",
    specs: [["CCA", "800A"], ["Ah", "80Ah"], ["LN/DIN", "LN4 / H7"]],
  },
  {
    model: "AGM70L",
    fit: "중형 플랫폼 조건부",
    note: "장착 공간과 순정 Ah를 확인한 뒤 선택하는 대체 후보입니다.",
    specs: [["CCA", "720A"], ["Ah", "70Ah"], ["LN/DIN", "LN3 / H6"]],
  },
  {
    model: "DIN74L",
    fit: "일반 DIN 대체",
    note: "ISG 차량에서는 AGM 다운그레이드 리스크를 반드시 확인해야 합니다.",
    specs: [["CCA", "680A"], ["Ah", "74Ah"], ["LN/DIN", "DIN H6"]],
  },
  {
    model: "EV auxiliary battery",
    fit: "EV 12V 보조배터리",
    note: "EV 보조전원은 대기전류와 충전 이벤트 로그를 함께 확인해야 합니다.",
    specs: [["CCA", "620A"], ["Ah", "60Ah"], ["Type", "EV 12V AGM"]],
  },
];

const baseActions: SymptomDiagnosis["actions"] = [
  {
    title: "즉시 점검 필요",
    priority: "HIGH",
    detail: "OCV 12.4V 이하, CCA 저하, SOH 감소가 함께 보이면 부하 테스트를 먼저 진행하세요.",
  },
  {
    title: "AGM 업그레이드 추천",
    priority: "RECOMMENDED",
    detail: "ISG 차량은 AGM 호환 규격 유지가 배터리 수명과 충전 제어 안정성에 유리합니다.",
  },
  {
    title: "BMS 등록 필요",
    priority: "CHECK",
    detail: "IBS/BMS 차량은 교체 후 BMS 초기화 또는 배터리 등록 여부를 확인해야 합니다.",
  },
  {
    title: "장거리 충전 권장",
    priority: "ROUTINE",
    detail: "단거리 주행이 반복되면 30분 이상 주행 또는 외부 충전으로 충전 회복을 확인하세요.",
  },
  {
    title: "블랙박스 설정 점검",
    priority: "SETTINGS",
    detail: "주차녹화 컷오프 전압은 12.2V 이상으로 설정하면 재방전 위험을 낮출 수 있습니다.",
  },
];

const baseTimeline: SymptomDiagnosis["timeline"] = [
  {
    label: "현재 상태",
    status: "OCV/SOH 경계",
    detail: "증상 키워드와 차량 사용 패턴에서 배터리 성능 저하 신호가 감지됩니다.",
    risk: "중간",
  },
  {
    label: "2주 후 예상",
    status: "재방전 가능",
    detail: "단거리 주행 또는 대기전류가 유지되면 시동 지연과 경고등 가능성이 증가합니다.",
    risk: "중상",
  },
  {
    label: "겨울철 위험 증가",
    status: "CCA 여유율 감소",
    detail: "영하권에서는 CCA 저하가 체감 시동 성능에 더 크게 반영됩니다.",
    risk: "높음",
  },
  {
    label: "예상 교체 시점",
    status: "1-3개월",
    detail: "SOH 80% 이하 또는 반복 방전 이력이 있으면 예방 교체를 권장합니다.",
    risk: "관리 필요",
  },
];

const diagnosisDetails: SymptomDiagnosis[] = diagnosisCategories.map((category) => {
  const isBlackbox = category.slug === "blackbox-drain";
  const isEv = category.slug === "ev12v-discharge";
  const isWinter = category.slug === "winter-discharge";
  const isWarning = category.slug === "battery-warning-light";
  const isBms = category.slug === "ibs-bms-error";

  return {
    ...category,
    severity: isWarning ? "위험" : isBlackbox || isEv ? "주의 높음" : "중상",
    urgency: isWarning ? "즉시 점검" : isEv ? "48시간 내 점검" : "7일 내 점검 권장",
    healthScore: isWarning ? "68" : isEv ? "76" : isWinter ? "72" : "81",
    failureProbability: isWarning ? "73%" : isBlackbox ? "68%" : isEv ? "64%" : "58%",
    confidence: category.metric.match(/\d+%/)?.[0] ?? "91%",
    summary:
      `${category.title} 증상은 ${category.tags.join(", ")} 신호를 함께 봐야 정확합니다. Battery Manager는 CCA 저하, SOH 감소, 대기전류, BMS 초기화 필요성을 함께 확인합니다.`,
    signals: [
      ["CCA", isWinter ? "저온 취약" : "저하 의심", "저온 시동 전류"],
      ["SOH", isWarning ? "68%" : "80%대", "배터리 건강도"],
      ["OCV", isBlackbox ? "12.28V" : "12.42V", "개방 전압"],
      ["BMS", isBms ? "오류 의심" : "확인 필요", "충전 제어"],
    ],
    analysis: [
      {
        title: "배터리 노후 가능성",
        probability: isWarning ? "73%" : "62%",
        detail: "SOH 감소와 CCA 저하가 함께 나타나면 시동 성능과 전장 안정성이 떨어집니다.",
        tone: "from-blue-500 to-cyan-400",
      },
      {
        title: "발전기 문제 가능성",
        probability: isWarning ? "58%" : "24%",
        detail: "주행 중 충전 전압이 낮거나 경고등이 동반되면 발전기와 배선 점검이 필요합니다.",
        tone: "from-red-500 to-orange-400",
      },
      {
        title: "블랙박스 대기전력",
        probability: isBlackbox ? "68%" : "36%",
        detail: "주차녹화, 낮은 컷오프 전압, 대기전류 증가는 반복 방전의 대표 패턴입니다.",
        tone: "from-slate-900 to-blue-700",
      },
      {
        title: "IBS 센서 문제",
        probability: isBms ? "82%" : "31%",
        detail: "IBS 센서 오차 또는 BMS 등록 누락은 충전 제어와 SOH 계산에 영향을 줍니다.",
        tone: "from-violet-500 to-blue-500",
      },
      {
        title: "겨울철 저온 영향",
        probability: isWinter ? "79%" : "44%",
        detail: "기온이 낮아지면 CCA 여유율이 급격히 중요해지고 시동 지연이 늘어납니다.",
        tone: "from-sky-500 to-blue-400",
      },
      {
        title: "단거리 충전 부족",
        probability: "57%",
        detail: "짧은 주행 반복은 충전 회복 시간을 줄여 AGM 배터리도 수명을 빠르게 소모합니다.",
        tone: "from-emerald-500 to-cyan-400",
      },
    ],
    actions: baseActions,
    batteries: commonBatteries,
    timeline: isEv
      ? [
          {
            label: "현재 상태",
            status: "EV 12V 저전압 주의",
            detail: "보조배터리 SOH와 대기전류, 원격 제어 사용량을 함께 확인합니다.",
            risk: "주의",
          },
          ...baseTimeline.slice(1),
        ]
      : baseTimeline,
    related: diagnosisCategories
      .filter((item) => item.slug !== category.slug)
      .slice(0, 4)
      .map((item) => item.slug),
  };
});

export function getDiagnosisCategories() {
  return diagnosisCategories;
}

export function getDiagnosisDetail(slug: string) {
  return diagnosisDetails.find((item) => item.slug === slug) ?? diagnosisDetails[0];
}

export function getDiagnosisSlugs() {
  return diagnosisDetails.map((item) => item.slug);
}
