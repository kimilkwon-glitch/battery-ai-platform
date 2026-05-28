import { compareHref } from "@/lib/platform-data";
import { batteryDetailHref } from "@/lib/canonical-battery-code";
import type { CoreBatteryDetailCode } from "@/lib/battery-detail/core-battery-codes";
import { normalizeCoreBatteryCode } from "@/lib/battery-detail/core-battery-codes";

export type HubBadge = { text: string; tone: "blue" | "amber" | "green" | "gray" };

export type HubFeaturedVehicle = {
  slug: string;
  title: string;
  fuel?: string;
  condition?: string;
};

export type HubCompareCard = {
  target: string;
  diff: string;
  href: string;
  detailHref: string;
};

export type BatteryDetailHubContent = {
  code: CoreBatteryDetailCode;
  positioning: string;
  typeLabel: string;
  useCase: string;
  badges: HubBadge[];
  confusionSpecs: string[];
  featuredVehicles: HubFeaturedVehicle[];
  compareCards: HubCompareCard[];
  misorderTips: string[];
  cautionNotes: string[];
};

function cmp(target: string, diff: string, items: [string, string]): HubCompareCard {
  return {
    target,
    diff,
    href: compareHref(items[0], items[1]),
    detailHref: batteryDetailHref(target),
  };
}

const HUB: Record<CoreBatteryDetailCode, BatteryDetailHubContent> = {
  AGM60L: {
    code: "AGM60L",
    positioning: "하이브리드·보조 12V 계열에서 자주 확인되는 AGM 규격",
    typeLabel: "AGM",
    useCase: "ISG·하이브리드 보조 12V, 스타트·전장 부하 대응",
    badges: [
      { text: "하이브리드 우선 확인", tone: "blue" },
      { text: "사진확인 권장", tone: "amber" },
    ],
    confusionSpecs: ["AGM70L", "DIN74L", "EV 12V", "일반 내연 AGM80L"],
    featuredVehicles: [
      { slug: "sportage-nq5", title: "스포티지 NQ5", fuel: "하이브리드", condition: "HEV 보조 12V" },
      { slug: "k8-gl3", title: "K8", fuel: "하이브리드", condition: "HEV 보조 12V" },
      { slug: "sorento-mq4", title: "쏘렌토 MQ4", fuel: "하이브리드", condition: "HEV" },
      { slug: "santafe-mx5", title: "싼타페 MX5", fuel: "하이브리드", condition: "HEV" },
    ],
    compareCards: [
      cmp("AGM70L", "중형 승용 ISG·용량 상향 후보 — 하이브리드 보조와 용도가 다를 수 있음", ["AGM60L", "AGM70L"]),
      cmp("EV 12V", "전기차 보조 12V 전용 흐름 — 고전압 메인 배터리와 혼동 금지", ["AGM60L", "EV 12V"]),
      cmp("DIN74L", "유럽형 DIN 계열 — 상용·봉고 흐름과 타입이 다름", ["AGM60L", "DIN74L"]),
    ],
    misorderTips: [
      "하이브리드·EV는 일반 가솔린 배터리와 단순 동일 취급하지 마세요.",
      "보조 12V 위치·규격은 차종별로 다를 수 있습니다.",
      "현재 장착 배터리 라벨(AGM60L 등)을 사진으로 확인하세요.",
      "단자 L/R 방향을 트레이 기준으로 확인하세요.",
    ],
    cautionNotes: [
      "일반 내연기관 메인 배터리처럼 단순 판단하지 마세요.",
      "연료·연식·옵션에 따라 추천 규격이 달라질 수 있습니다.",
    ],
  },
  AGM70L: {
    code: "AGM70L",
    positioning: "중형·준대형 승용 ISG 계열에서 자주 확인되는 AGM 규격",
    typeLabel: "AGM",
    useCase: "ISG·중형 승용, 그랜저 IG 가솔린 등",
    badges: [
      { text: "AGM80L 혼동 주의", tone: "amber" },
      { text: "연료·옵션 확인", tone: "gray" },
    ],
    confusionSpecs: ["AGM80L", "AGM60L", "DIN74L"],
    featuredVehicles: [
      { slug: "grandeur-ig", title: "그랜저 IG", fuel: "가솔린", condition: "ISG·AGM70L" },
      { slug: "k5-dl3", title: "K5 DL3", fuel: "가솔린", condition: "ISG 후보" },
      { slug: "sonata-dn8", title: "쏘나타 DN8", fuel: "가솔린", condition: "ISG 후보" },
    ],
    compareCards: [
      cmp("AGM80L", "SUV·디젤·대형 승용은 AGM80L일 수 있음 — 용량·트레이 확인", ["AGM70L", "AGM80L"]),
      cmp("AGM60L", "하이브리드 보조 12V는 AGM60L 흐름이 많음", ["AGM70L", "AGM60L"]),
      cmp("DIN74L", "DIN 유럽형과 타입·고정 방식이 다름", ["AGM70L", "DIN74L"]),
    ],
    misorderTips: [
      "디젤·대형 SUV는 AGM80L일 수 있습니다.",
      "같은 차종도 연료·ISG 옵션에 따라 규격이 달라집니다.",
      "AGM70L 라벨과 단자 방향을 사진으로 확인하세요.",
    ],
    cautionNotes: ["AGM80L과 용량·트레이가 다를 수 있습니다."],
  },
  AGM80L: {
    code: "AGM80L",
    positioning: "SUV·디젤·대형 승용에서 자주 확인되는 AGM 규격",
    typeLabel: "AGM",
    useCase: "대형 SUV·디젤 ISG, 쏘렌토 MQ4 디젤·그랜저 IG 디젤 등",
    badges: [
      { text: "대형·디젤 ISG", tone: "blue" },
      { text: "CMF80L 동일 취급 금지", tone: "amber" },
    ],
    confusionSpecs: ["AGM70L", "CMF80L", "AGM95L"],
    featuredVehicles: [
      { slug: "sorento-mq4", title: "쏘렌토 MQ4", fuel: "디젤", condition: "ISG·AGM80L" },
      { slug: "grandeur-ig", title: "그랜저 IG", fuel: "디젤", condition: "디젤 ISG" },
      { slug: "palisade", title: "팰리세이드", fuel: "디젤", condition: "대형 SUV" },
    ],
    compareCards: [
      cmp("AGM70L", "중형 가솔린 ISG는 AGM70L 후보 — 용량·트레이 비교", ["AGM80L", "AGM70L"]),
      cmp("CMF80L", "CMF 타입·표기가 다름 — 80L로 축약해 주문하면 위험", ["AGM80L", "CMF80L"]),
      cmp("AGM95L", "대형 AGM·수입차 흐름 — 단순 대체 금지", ["AGM80L", "AGM95L"]),
    ],
    misorderTips: [
      "스타리아 CMF80L과 무조건 동일하지 않습니다.",
      "트레이·연료·ISG 조건을 차량 상세에서 확인하세요.",
      "단자 L/R·고정 방식을 사진으로 확인하세요.",
    ],
    cautionNotes: ["AGM70L과 혼동이 잦습니다."],
  },
  DIN74L: {
    code: "DIN74L",
    positioning: "유럽형 DIN 계열 — 봉고3·상용 업그레이드 흐름",
    typeLabel: "DIN",
    useCase: "유럽형 DIN 트레이, 상용·밴 계열",
    badges: [
      { text: "DIN 표기 혼동 주의", tone: "amber" },
      { text: "AGM 무조건 대체 금지", tone: "gray" },
    ],
    confusionSpecs: ["DIN78L", "57412", "57820", "AGM70L", "100R"],
    featuredVehicles: [
      { slug: "bongo3-truck", title: "봉고3", fuel: "디젤", condition: "DIN74L" },
    ],
    compareCards: [
      cmp("AGM70L", "AGM JIS 계열과 DIN 트레이·고정이 다름", ["DIN74L", "AGM70L"]),
      cmp("DIN62L", "용량·트레이 한 단계 차이 — 표기 57412/57820 혼동", ["DIN74L", "DIN62L"]),
      cmp("100R", "상용 R타입 JIS와 DIN은 타입·단자 체계가 다름", ["DIN74L", "100R"]),
    ],
    misorderTips: [
      "DIN74L / DIN78L / 57412 / 57820 표기를 라벨로 확인하세요.",
      "단자 방향·홀 위치·고정 방식을 사진으로 확인하세요.",
      "AGM으로 무조건 대체 주문하지 마세요.",
    ],
    cautionNotes: ["봉고3는 차량 상세에서 연료·연식을 함께 확인하세요."],
  },
  "100R": {
    code: "100R",
    positioning: "포터2 2020년 이후 등 R타입 상용 핵심 규격",
    typeLabel: "CMF/R",
    useCase: "포터2 2020~, CMF100R 계열 상용",
    badges: [
      { text: "R타입 단자", tone: "blue" },
      { text: "90R 연식 분기", tone: "amber" },
    ],
    confusionSpecs: ["90R", "CMF100R", "100L", "AGM95L"],
    featuredVehicles: [
      { slug: "porter2-new", title: "포터2", fuel: "디젤", condition: "2020년 이후 · 100R" },
      { slug: "porter2-old", title: "포터2", fuel: "디젤", condition: "2019년 이전 · 90R" },
    ],
    compareCards: [
      cmp("90R", "포터2 연식에 따라 90R/100R 분기 — 연식 칩·사진 확인", ["100R", "90R"]),
      cmp("CMF100R", "브랜드 상품코드와 family 100R — 라벨 표기 확인", ["100R", "CMF100R"]),
      cmp("AGM95L", "대형 AGM 승용·수입차 — 상용 R타입과 용도가 다름", ["100R", "AGM95L"]),
    ],
    misorderTips: [
      "100R은 R타입으로 통일해 확인하세요. L타입과 혼동 금지.",
      "포터2 무연식 검색 시 90R/100R 동시 안내를 유지하세요.",
      "현재 장착 배터리 라벨·단자를 사진으로 보내주세요.",
    ],
    cautionNotes: ["2019년 이전 차량은 90R일 수 있습니다."],
  },
  CMF80L: {
    code: "CMF80L",
    positioning: "CMF80L 표기 전체 보존 — 스타리아 디젤 등 CMF 타입",
    typeLabel: "CMF",
    useCase: "CMF 트레이·스타리아 디젤 등",
    badges: [
      { text: "CMF80L 표기 유지", tone: "blue" },
      { text: "80L 축약 주문 금지", tone: "amber" },
    ],
    confusionSpecs: ["80L", "AGM80L", "CMF100R"],
    featuredVehicles: [
      { slug: "staria", title: "스타리아", fuel: "디젤", condition: "CMF80L" },
    ],
    compareCards: [
      cmp("AGM80L", "AGM과 CMF는 타입·트레이가 다를 수 있음", ["CMF80L", "AGM80L"]),
      cmp("CMF90L", "CMF 계열 용량·단자 차이 — L/R 표기 확인", ["CMF80L", "CMF90L"]),
      cmp("CMF100R", "상용 R타입 CMF와 L타입 CMF 혼동 주의", ["CMF80L", "CMF100R"]),
    ],
    misorderTips: [
      "주문·검색 시 CMF80L 전체 코드를 사용하세요.",
      "AGM80L과 무조건 동일하지 않습니다.",
      "단자 L/R·라벨 사진을 확인하세요.",
    ],
    cautionNotes: ["검색·상세 URL에서 CMF80L이 잘리지 않도록 확인하세요."],
  },
  "115D31L": {
    code: "115D31L",
    positioning: "대형 국산·상용 JIS 대용량 L타입 규격",
    typeLabel: "JIS/CMF",
    useCase: "대형 국산·상용, 고용량 L타입 트레이",
    badges: [
      { text: "L타입 단자", tone: "blue" },
      { text: "100R 단순 대체 금지", tone: "amber" },
    ],
    confusionSpecs: ["115D31R", "100R", "AGM95L"],
    featuredVehicles: [],
    compareCards: [
      cmp("100R", "R타입 상용과 L타입 대용량 — 단자·트레이가 다름", ["115D31L", "100R"]),
      cmp("115D31R", "L/R 단자 방향이 다름 — 라벨·트레이 확인", ["115D31L", "115D31R"]),
      cmp("AGM95L", "대형 AGM 승용과 JIS CMF 계열 혼동 주의", ["115D31L", "AGM95L"]),
    ],
    misorderTips: [
      "L/R 단자 방향을 트레이 기준으로 확인하세요.",
      "장착 공간·홀 위치를 사진으로 확인하세요.",
      "100R과 단순 대체하지 마세요.",
    ],
    cautionNotes: ["차량 DB에 확인된 모델만 대표 차량으로 연결합니다."],
  },
  AGM95L: {
    code: "AGM95L",
    positioning: "대형 AGM — 수입차·대형차 고용량 ISG 계열",
    typeLabel: "AGM",
    useCase: "대형 AGM, 수입·대형 승용(확정 차종만 연결)",
    badges: [
      { text: "100R 단순 대체 금지", tone: "amber" },
      { text: "코딩 차종 안내만", tone: "gray" },
    ],
    confusionSpecs: ["AGM80L", "100R", "115D31L"],
    featuredVehicles: [],
    compareCards: [
      cmp("AGM80L", "국산 대형 SUV·디젤 ISG는 AGM80L 후보가 많음", ["AGM95L", "AGM80L"]),
      cmp("100R", "상용 R타입과 승용 대형 AGM — 용도·타입이 다름", ["AGM95L", "100R"]),
      cmp("115D31L", "JIS CMF 대용량과 AGM 타입 혼동 주의", ["AGM95L", "115D31L"]),
    ],
    misorderTips: [
      "BMS·코딩이 필요한 차종은 확정 표현 대신 안내만 제공합니다.",
      "수입차는 연식·옵션별 AGM95L 여부가 다를 수 있습니다.",
      "라벨·단자 사진으로 최종 확인하세요.",
    ],
    cautionNotes: ["100R과 타입·차량 적용이 다릅니다."],
  },
  "EV 12V": {
    code: "EV 12V",
    positioning: "전기차 보조 12V 배터리 확인 허브 — 메인 고전압 배터리 아님",
    typeLabel: "EV 보조 12V",
    useCase: "EV6·아이오닉5 등 보조 12V, 전장·접근 전원",
    badges: [
      { text: "보조 12V", tone: "blue" },
      { text: "고전압 메인 아님", tone: "amber" },
    ],
    confusionSpecs: ["AGM60L", "일반 AGM", "eAGM60"],
    featuredVehicles: [
      { slug: "ioniq5-ne", title: "아이오닉5", fuel: "전기", condition: "보조 12V" },
      { slug: "ev6", title: "EV6", fuel: "전기", condition: "보조 12V" },
    ],
    compareCards: [
      cmp("AGM60L", "하이브리드 보조 AGM과 EV 보조 12V — 차종별 규격 확인", ["EV 12V", "AGM60L"]),
      cmp("AGM80L", "일반 승용 메인 AGM과 혼동 금지", ["EV 12V", "AGM80L"]),
    ],
    misorderTips: [
      "고전압 메인 배터리 주문이 아닙니다.",
      "보조 12V 위치·규격은 차종·연식별로 다릅니다.",
      "eAGM60 등 EV 전용 개선형이 있으면 라벨로 확인하세요.",
      "사진확인으로 최종 규격을 확정하세요.",
    ],
    cautionNotes: ["CR-V 등 내연 차종으로 이탈하지 않도록 검색·상세 링크를 확인하세요."],
  },
};

export function getBatteryDetailHubContent(code: string): BatteryDetailHubContent | null {
  const key = normalizeCoreBatteryCode(code) as CoreBatteryDetailCode;
  return HUB[key] ?? null;
}

export function listBatteryDetailHubContents(): BatteryDetailHubContent[] {
  return Object.values(HUB);
}
