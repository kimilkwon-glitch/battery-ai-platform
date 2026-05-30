import { compareHref, diagnosisHref, searchHref } from "@/lib/platform-data";
import {
  HUB_ORDER_CHECKLIST,
  HUB_PHOTO_CHECK,
  HUB_SERVICE,
  HUB_SYMPTOMS,
} from "@/lib/platform-hub-routes";
import { HUB_PHOTO, HUB_QA, HUB_SHOP_ANCHORS, HUB_STORE_ANCHORS } from "@/lib/customer-hub-routes";

export type HubBadgeTone = "ok" | "warn" | "check" | "neutral";

export type HubCheckItem = {
  title: string;
  body: string;
  badge: string;
  tone: HubBadgeTone;
};

export const ORDER_CHECKLIST_ITEMS: HubCheckItem[] = [
  { title: "차량명", body: "모델명·세대(예: 포터2 2020년 이후)를 먼저 봅니다.", badge: "필수", tone: "check" },
  { title: "연식", body: "같은 차도 연식이 바뀌면 90R·100R처럼 달라질 수 있습니다.", badge: "필수", tone: "check" },
  { title: "연료·하이브리드·EV", body: "가솔린·디젤·하이브리드·EV 보조 12V는 규격이 다릅니다.", badge: "필수", tone: "warn" },
  { title: "ISG·BMS", body: "ISG 차량은 AGM·DIN을 잘못 바꾸면 문제가 생길 수 있습니다.", badge: "주의", tone: "warn" },
  { title: "현재 배터리 사진", body: "라벨 코드·L/R 단자가 보이면 가장 안전합니다.", badge: "권장", tone: "ok" },
];

export const ORDER_CHECKLIST_SECTIONS = [
  {
    title: "L/R 단자 방향",
    body: "100R과 AGM95L은 단자 방향과 배터리 타입이 달라 단순 대체 대상이 아닙니다. L/R이 정해진 규격은 이름에서 방향을 알 수 있지만, 트레이·케이블·고정쇠는 사진으로 함께 보세요.",
    badge: "주의",
    tone: "warn" as HubBadgeTone,
    href: HUB_PHOTO_CHECK,
    cta: "사진으로 단자 확인하기",
  },
  {
    title: "AGM · DIN · CMF · 일반",
    body: "차량 전장·ISG에 맞는 타입인지 봅니다. DIN을 CMF로, AGM을 일반 MF로 바꾸면 문제가 생길 수 있습니다.",
    badge: "확인",
    tone: "check" as HubBadgeTone,
    href: "/guide/spec?guide=agm-vs-din",
    cta: "AGM/DIN 가이드",
  },
  {
    title: "CMF80L ≠ 80L",
    body: "표기를 줄이면 다른 규격으로 오주문됩니다. 라벨의 전체 코드를 봅니다.",
    badge: "주의",
    tone: "warn" as HubBadgeTone,
    href: searchHref("CMF80L"),
    cta: "CMF80L 검색",
  },
  {
    title: "90R / 100R 세대",
    body: "포터2 등 상용차는 연식 전후로 R타입 규격이 달라집니다.",
    badge: "주의",
    tone: "warn" as HubBadgeTone,
    href: searchHref("포터2 배터리"),
    cta: "포터2 검색",
  },
  {
    title: "하이브리드·EV 보조 12V",
    body: "고전압 메인 배터리가 아닙니다. EV 12V와 AGM60L을 혼동하지 마세요.",
    badge: "필수",
    tone: "warn" as HubBadgeTone,
    href: searchHref("스포티지 NQ5 하이브리드"),
    cta: "하이브리드 검색",
  },
];

export type SymptomHubItem = {
  id: string;
  title: string;
  causes: string;
  batteryChance: string;
  quickCheck: string;
  action: string;
  searchQuery: string;
  diagnosisSlug?: string;
  qnaHref?: string;
};

export const SYMPTOM_HUB_ITEMS: SymptomHubItem[] = [
  {
    id: "slow-start",
    title: "시동이 평소보다 늦게 걸림",
    causes: "배터리 약화, 터미널 산화, 겨울철 CCA 부족",
    batteryChance: "높음",
    quickCheck: "시동 전압·경고등·최근 주행",
    action: "CCA·용량을 보고 규격 검색으로 이어가기",
    searchQuery: "시동 늦게 걸림",
    diagnosisSlug: "slow-engine-start",
  },
  {
    id: "blackbox",
    title: "블랙박스로 방전",
    causes: "상시전원, 암전류, 배터리 노후",
    batteryChance: "중~높음",
    quickCheck: "상시전원 설정·퓨즈·주차 일수",
    action: "차종과 방전 증상으로 검색",
    searchQuery: "레이 블랙박스 방전",
    diagnosisSlug: "blackbox-drain",
    qnaHref: "/qa?q=블랙박스",
  },
  {
    id: "parking",
    title: "장기주차 후 방전",
    causes: "자연 방전, 악세서리 암전류",
    batteryChance: "중간",
    quickCheck: "주차 기간·경고등·도어 미닫힘",
    action: "증상과 차종으로 검색",
    searchQuery: "장기주차 방전",
    diagnosisSlug: "winter-discharge",
  },
  {
    id: "jump",
    title: "점프 후 다시 방전",
    causes: "배터리 불량, 충전 시스템, 암전류",
    batteryChance: "높음",
    quickCheck: "점프 후 충전 여부·경고등",
    action: "규격을 보고 교체 시점 검토",
    searchQuery: "점프스타트 후 방전",
  },
  {
    id: "winter",
    title: "겨울철 방전",
    causes: "CCA 저하, 배터리 노후",
    batteryChance: "높음",
    quickCheck: "겨울 시동 횟수·CCA 라벨",
    action: "CCA 가이드·규격 검색",
    searchQuery: "겨울 배터리",
    diagnosisSlug: "winter-discharge",
  },
  {
    id: "hybrid-aux",
    title: "하이브리드 보조배터리 방전",
    causes: "보조 12V 약화, 장기 미사용",
    batteryChance: "높음",
    quickCheck: "HV 시스템 경고·보조배터리 위치",
    action: "보조 12V — AGM60L 등 규격 보기",
    searchQuery: "스포티지 NQ5 하이브리드",
    diagnosisSlug: "agm-replacement",
  },
  {
    id: "ev12v",
    title: "EV 12V 보조배터리 문제",
    causes: "보조 12V 방전, DC-DC 이상 가능",
    batteryChance: "중~높음",
    quickCheck: "12V 경고·충전 상태",
    action: "EV 12V 규격과 차종 보기",
    searchQuery: "EV6 12V",
    diagnosisSlug: "ev12v-discharge",
  },
  {
    id: "isg",
    title: "ISG 작동 이상",
    causes: "AGM 용량 부족, BMS 학습",
    batteryChance: "중간",
    quickCheck: "ISG 경고·AGM 규격",
    action: "AGM 규격·BMS 가이드",
    searchQuery: "ISG 배터리",
    diagnosisSlug: "ibs-bms-error",
  },
  {
    id: "warning",
    title: "경고등·전장 이상",
    causes: "저전압, 배터리·충전 계통",
    batteryChance: "중간",
    quickCheck: "경고 코드·시동 상태",
    action: "차종 검색으로 규격 보기",
    searchQuery: "배터리 경고등",
    diagnosisSlug: "ibs-bms-error",
  },
  {
    id: "after-replace",
    title: "교체 후에도 이상",
    causes: "규격 오류, 단자 방향, BMS 미등록",
    batteryChance: "확인 필요",
    quickCheck: "장착 규격·단자·BMS",
    action: "주문 전 체크리스트 보기",
    searchQuery: "배터리 교체 후",
  },
];

export type PhotoExampleKind = "good" | "bad";

export type PhotoExampleCard = {
  kind: PhotoExampleKind;
  title: string;
  hint: string;
  icon: "top" | "label" | "terminal" | "tray" | "blur" | "hidden" | "crop";
};

/** 아이콘형 예시 카드 — 실사 없이 안내만 */
export const PHOTO_CHECK_EXAMPLES: PhotoExampleCard[] = [
  { kind: "good", title: "배터리 전체 상단", hint: "트레이·홀드다운이 보이는 각도", icon: "top" },
  { kind: "good", title: "라벨 확대", hint: "규격 코드·제조일이 선명하게", icon: "label" },
  { kind: "good", title: "+ / − 단자 방향", hint: "플러스·마이너스 위치가 보일 것", icon: "terminal" },
  { kind: "good", title: "고정쇠·트레이 주변", hint: "홀 패턴·브래킷 포함", icon: "tray" },
  { kind: "bad", title: "라벨이 흐림", hint: "빛 반사·초점 불량", icon: "blur" },
  { kind: "bad", title: "단자 방향이 가려짐", hint: "케이블·커버에 가려진 경우", icon: "hidden" },
  { kind: "bad", title: "너무 가까움", hint: "규격 코드가 화각 밖으로 잘림", icon: "crop" },
];

export const PHOTO_CHECK_STEPS = [
  {
    step: 1,
    title: "언제 사진 확인이 필요한가",
    items: [
      "검색 결과 후보가 두 개 이상일 때",
      "연식·연료가 불확실할 때",
      "CMF80L / 80L처럼 표기가 헷갈릴 때",
      "택배 주문·자가장착 전",
    ],
    note: "차종·연식을 본 뒤, 라벨·단자 사진으로 한 번 더 보는 보조 단계입니다.",
  },
  {
    step: 2,
    title: "꼭 찍어야 하는 사진",
    items: [
      "배터리 전체 상단(트레이·홀드다운 포함)",
      "라벨 확대(규격 코드·제조일)",
      "+ / − 단자 방향이 보이는 각도",
      "고정쇠·트레이 주변(홀 패턴)",
      "필요 시 계기판·차량명판",
    ],
  },
  {
    step: 3,
    title: "찍으면 안 좋은 사진",
    items: [
      "라벨이 흐릿하거나 빛 반사",
      "단자 방향이 가려진 사진",
      "너무 가까워 화각이 잘린 사진",
      "규격 코드가 잘린 사진",
    ],
  },
  {
    step: 4,
    title: "보내기 전 확인",
    items: [
      "차종·연식·연료를 함께 적기",
      "블랙박스·악세서리 여부 메모",
      "현재 증상(시동지연·방전 등) 간단히 기재",
    ],
  },
];

export type ServiceOption = {
  title: string;
  desc: string;
  href: string;
  when: string;
  tone: "primary" | "secondary" | "ghost";
  region?: string;
};

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    title: "덕천점 내방",
    desc: "직영점에서 규격 확인·장착 상담",
    href: HUB_STORE_ANCHORS.deokcheon,
    when: "북구·동래·금정권 — 덕천·구포·만덕·화명·대저 등",
    region: "북부 직영",
    tone: "primary" as const,
  },
  {
    title: "학장점 내방",
    desc: "직영점에서 규격 확인·장착 상담",
    href: HUB_STORE_ANCHORS.hakjang,
    when: "사상구·사하·강서권 — 학장·감전·괘법·주례·엄궁·사하 등",
    region: "서부 직영",
    tone: "primary" as const,
  },
  {
    title: "부산 출장",
    desc: "현장에서 시동 불가·긴급 교체 상담",
    href: HUB_STORE_ANCHORS.visit,
    when: "지금 당장 시동이 안 걸릴 때",
    tone: "secondary" as const,
  },
  {
    title: "택배·자가장착",
    desc: "규격 확정 후 택배 주문",
    href: HUB_SHOP_ANCHORS.delivery,
    when: "규격을 알고 있고 자가장착 가능할 때",
    tone: "secondary" as const,
  },
  {
    title: "사진 확인 후 상담",
    desc: "라벨·단자 사진으로 규격 보조 확인",
    href: HUB_PHOTO,
    when: "규격이 헷갈리거나 처음 주문할 때",
    tone: "ghost" as const,
  },
];

export const SERVICE_SCENARIOS = [
  { situation: "지금 당장 시동이 안 걸림", pick: "출장 또는 가까운 직영점", href: HUB_STORE_ANCHORS.visit },
  { situation: "규격을 알고 있음", pick: "택배 주문 + 오주문 체크", href: HUB_ORDER_CHECKLIST },
  { situation: "자가장착 자신 있음", pick: "택배 + 사진 확인", href: HUB_PHOTO_CHECK },
  { situation: "하이브리드/EV", pick: "상담 후 진행 권장", href: searchHref("하이브리드 배터리") },
  { situation: "배터리 종류가 헷갈림", pick: "차종 검색 또는 사진 확인", href: "/search?q=AGM80L" },
];

export type ComparePresetCard = {
  label: string;
  a: string;
  b: string;
  headline: string;
  diff: string;
  terminalNote: string;
  substitute: "가능" | "주의" | "불가";
  href: string;
};

export const COMPARE_PRESET_CARDS: ComparePresetCard[] = [
  {
    label: "90R vs 100R",
    a: "CMF90R",
    b: "CMF100R",
    headline: "포터2 연식 분기",
    diff: "용량·트레이·규격 코드가 다름",
    terminalNote: "둘 다 R타입 — 연식 확인 필수",
    substitute: "주의",
    href: compareHref("CMF90R", "CMF100R"),
  },
  {
    label: "100L vs 100R",
    a: "100L",
    b: "100R",
    headline: "L/R 타입 구분",
    diff: "단자 방향·트레이가 다를 수 있음",
    terminalNote: "R타입 상용 — L타입과 혼동 주의",
    substitute: "주의",
    href: compareHref("100L", "100R"),
  },
  {
    label: "AGM70L vs AGM80L",
    a: "AGM70L",
    b: "AGM80L",
    headline: "중형 vs SUV·디젤",
    diff: "용량·CCA 차이",
    terminalNote: "L타입 동일 시 트레이 확인",
    substitute: "주의",
    href: compareHref("AGM70L", "AGM80L"),
  },
  {
    label: "AGM60L vs EV 12V",
    a: "AGM60L",
    b: "EV 12V",
    headline: "하이브리드 vs EV 보조",
    diff: "용도·위치·규격 체계 다름",
    terminalNote: "차종·연료로 먼저 구분",
    substitute: "불가",
    href: compareHref("AGM60L", "AGM70L"),
  },
  {
    label: "DIN74L vs CMF80L",
    a: "DIN74L",
    b: "CMF80L",
    headline: "유럽형 DIN vs CMF",
    diff: "타입·트레이·전장 호환",
    terminalNote: "ISG 차량 DIN 주의",
    substitute: "주의",
    href: compareHref("DIN74L", "CMF80L"),
  },
  {
    label: "AGM80L vs AGM95L",
    a: "AGM80L",
    b: "AGM95L",
    headline: "대형 승용 AGM",
    diff: "용량·CCA 상향",
    terminalNote: "L타입·홀드다운 확인",
    substitute: "주의",
    href: compareHref("AGM80L", "AGM95L"),
  },
  {
    label: "CMF80L vs 100R",
    a: "CMF80L",
    b: "100R",
    headline: "승용 CMF vs 상용 R",
    diff: "차종·타입 완전히 다름",
    terminalNote: "단자 방향·타입 확인",
    substitute: "불가",
    href: compareHref("CMF80L", "100R"),
  },
];

export function symptomDiagnosisHref(slug?: string): string {
  return slug ? diagnosisHref(slug) : HUB_SYMPTOMS;
}
