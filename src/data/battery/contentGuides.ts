import type { ContentGuide } from "./types";

export const CONTENT_GUIDES: ContentGuide[] = [
  {
    id: "bk-diesel-size",
    title: "디젤 차량은 왜 배터리가 더 큰 경우가 많을까",
    hook: "같은 차종이라도 디젤은 시동·전장 부하 때문에 한 단계 큰 규격이 들어가는 경우가 있습니다.",
    paragraphs: [
      "디절은 시동 순간 부하가 크고, 예열·전장 부하까지 합쳐져 용량·CCA 여유가 필요한 경우가 많습니다.",
      "가솔린과 디젤을 같은 규격으로 보지 말고, 연료·연식·현재 장착 배터리를 함께 확인하세요.",
      "ISG·스마트충전이 있으면 AGM 여부도 같이 봅니다.",
    ],
    checkPoints: ["연료 확인", "순정 Ah·CCA", "현재 라벨 사진"],
    ctas: [
      { label: "차량 기준 보기", href: "/vehicles" },
      { label: "사진으로 확인", href: "/photo-check" },
    ],
    imageSlotPurpose: "diesel-gasoline-battery-compare",
    imageSlotCaption: "디젤·가솔린 배터리 규격 비교 예시 이미지 영역",
    tags: ["디젤", "용량"],
  },
  {
    id: "bk-agm-when",
    title: "AGM 배터리는 언제 필요한가",
    hook: "ISG·스마트충전·잦은 시동·정지 차량에서는 AGM·EFB 유지가 중요한 경우가 많습니다.",
    paragraphs: [
      "엔진 자동 시동·정지가 잦으면 충방전 반복이 늘어 일반 MF보다 AGM 수용성이 맞는 경우가 있습니다.",
      "일반 DIN·CMF로 내리면 충전 제어·경고·수명 문제가 생길 수 있습니다.",
      "차량 매뉴얼·순정 라벨·ISG 옵션을 먼저 확인하세요.",
    ],
    checkPoints: ["ISG·스마트충전", "순정 AGM 라벨", "BMS·IBS 등록"],
    ctas: [
      { label: "AGM/DIN 가이드", href: "/guide/spec?guide=agm-vs-din" },
      { label: "AGM80L 규격 보기", href: "/batteries/AGM80L" },
    ],
    imageSlotPurpose: "agm-isg-context",
    imageSlotCaption: "ISG·AGM 적용 차량 설명 이미지 영역",
    relatedBatteryCodes: ["AGM70L", "AGM80L"],
    tags: ["AGM", "ISG"],
  },
  {
    id: "bk-lr-from-name",
    title: "L/R 단자 방향, 이름만 봐도 어느 정도 알 수 있습니다",
    hook: "AGM60L·100R처럼 코드 끝 L/R은 단자 방향 정보입니다. 다만 차량 트레이·케이블도 함께 봅니다.",
    paragraphs: [
      "L은 플러스 단자가 한쪽, R은 반대쪽에 오는 타입으로 안내하는 경우가 많습니다.",
      "방향이 다르면 케이블·고정쇠가 맞지 않아 장착이 어렵습니다.",
      "현재 장착 배터리와 같은 L/R인지, 트레이·홀까지 사진으로 확인하면 안전합니다.",
    ],
    checkPoints: ["규격 코드 L/R", "플러스 단자 위치 사진", "트레이·홀 패턴"],
    ctas: [
      { label: "단자 확인 가이드", href: "/guides/knowledge/bk-lr-from-name" },
      { label: "사진으로 확인", href: "/photo-check" },
    ],
    imageSlotPurpose: "terminal-direction-example",
    imageSlotCaption: "단자 방향(L/R) 확인 예시 이미지 영역",
    tags: ["L/R", "단자"],
  },
  {
    id: "bk-din-vs-jis",
    title: "DIN과 일반단자 배터리는 왜 구분해야 할까",
    hook: "용량 숫자만 같다고 바꿀 수 없습니다. 케이스·단자·충전계가 다릅니다.",
    paragraphs: [
      "DIN은 유럽형 케이스·단자 구조, CMF·GB는 국내 승용·상용 JIS 계열이 흔합니다.",
      "ISG AGM 차량에 일반 DIN을, DIN 차량에 무리한 CMF를 맞추지 않는 것이 좋습니다.",
      "라벨의 전체 규격 코드와 차종 순정을 함께 보세요.",
    ],
    checkPoints: ["순정 단자 타입", "ISG 여부", "트레이·홀"],
    ctas: [
      { label: "DIN74L 보기", href: "/batteries/DIN74L" },
      { label: "비교해보기", href: "/compare?items=AGM80L,DIN74L" },
    ],
    imageSlotPurpose: "din-cmf-terminal-compare",
    imageSlotCaption: "DIN·일반단자 구조 비교 이미지 영역",
    relatedBatteryCodes: ["DIN74L", "CMF80L", "AGM80L"],
  },
  {
    id: "bk-ah-cca-priority",
    title: "Ah와 CCA, 뭐가 더 중요할까",
    hook: "둘 다 중요하지만, 장착 규격·단자·타입이 먼저입니다.",
    paragraphs: [
      "Ah는 저장·전장 부하, CCA는 저온 시동 순간 힘에 가깝습니다.",
      "겨울·디젤·상용은 CCA 여유를, 블랙박스·주차는 Ah·대기전류를 함께 봅니다.",
      "업그레이드는 Ah만 키우기보다 트레이·충전계를 확인하세요.",
    ],
    checkPoints: ["순정 Ah", "순정 CCA", "사용 환경(겨울·상용)"],
    ctas: [
      { label: "CCA/Ah 가이드", href: "/guide/spec?guide=cca-ah" },
      { label: "증상별 확인", href: "/symptoms" },
    ],
    imageSlotPurpose: "ah-cca-chart",
    imageSlotCaption: "Ah·CCA 개념 설명 이미지 영역",
  },
  {
    id: "bk-90r-100r-confusion",
    title: "90R과 100R이 헷갈리는 이유",
    hook: "크기가 비슷해도 연식·트레이·용량이 달라 단순 대체가 어렵습니다.",
    paragraphs: [
      "포터2는 연식에 따라 90R·100R 후보가 나뉘는 경우가 많습니다.",
      "둘 다 R타입이지만 홀·용량·CCA가 다를 수 있습니다.",
      "연식·라벨·현재 장착 사진을 함께 보는 것이 가장 정확합니다.",
    ],
    checkPoints: ["차량 연식", "라벨 90R/100R", "트레이·홀"],
    ctas: [
      { label: "90R vs 100R 비교", href: "/compare?items=90R,100R" },
      { label: "포터2 가이드", href: "/vehicles" },
    ],
    imageSlotPurpose: "porter-90r-100r-label",
    imageSlotCaption: "90R·100R 라벨 비교 예시 이미지 영역",
    relatedBatteryCodes: ["90R", "100R"],
  },
  {
    id: "bk-100r-vs-agm95l",
    title: "100R과 AGM95L은 왜 단순 비교 대상이 아닐까",
    hook: "용량대가 비슷해 보여도 R타입 상용 CMF와 L타입 AGM은 대체 관계가 아닙니다.",
    paragraphs: [
      "100R은 R타입 상용·CMF 계열, AGM95L은 L타입 AGM·승용 ISG 계열로 보는 경우가 많습니다.",
      "단자 방향·배터리 타입·적용 차량군이 달라 장착·충전계가 맞지 않을 수 있습니다.",
      "비교는 차이 이해용이며, 교체 규격은 차종·사진 기준으로 확인하세요.",
    ],
    checkPoints: ["R vs L 타입", "CMF vs AGM", "차종·연료"],
    ctas: [
      { label: "비교해보기", href: "/compare?items=100R,AGM95L" },
      { label: "100R 규격 보기", href: "/batteries/100R" },
    ],
    imageSlotPurpose: "100r-agm95l-type-compare",
    imageSlotCaption: "100R·AGM95L 타입·단자 비교 이미지 영역",
    relatedBatteryCodes: ["100R", "AGM95L"],
  },
  {
    id: "bk-ev-aux-12v",
    title: "하이브리드/EV 보조 12V는 따로 봐야 하는 이유",
    hook: "고전압 메인 배터리와 별개입니다. 위치·규격이 차종마다 다릅니다.",
    paragraphs: [
      "12V는 문잠금·통신·시동 준비 등에 쓰이며, 메인 고전압 팩과 역할이 다릅니다.",
      "AGM60L·EV 12V 등 표기가 비슷해도 차종별 순정이 다를 수 있습니다.",
      "보조 12V 위치·라벨 사진으로 확인하는 것이 안전합니다.",
    ],
    checkPoints: ["보조 12V 위치", "라벨 규격", "하이브리드/EV 여부"],
    ctas: [
      { label: "EV 12V 보기", href: "/batteries/EV%2012V" },
      { label: "비교", href: "/compare?items=AGM60L,EV%2012V" },
    ],
    imageSlotPurpose: "ev-aux-battery-location",
    imageSlotCaption: "하이브리드·EV 보조 12V 위치 예시 이미지 영역",
    relatedBatteryCodes: ["EV 12V", "AGM60L"],
  },
  {
    id: "bk-blackbox-drain",
    title: "블랙박스 방전, 배터리 문제만은 아닐 수 있습니다",
    hook: "컷오프·녹화 모드·대기전류·배터리 수명을 함께 봅니다.",
    paragraphs: [
      "상시전원·이벤트 녹화는 대기전류를 키웁니다.",
      "컷오프를 12.2V 전후로 맞추면 반복 방전을 줄이는 데 도움이 될 수 있습니다.",
      "배터리 교체 전 설정·전장품·충전 상태를 점검하세요.",
    ],
    checkPoints: ["컷오프 전압", "녹화 모드", "배터리 경과·시동"],
    ctas: [
      { label: "블랙박스 가이드", href: "/guide/spec?guide=blackbox-cutoff" },
      { label: "증상 확인", href: "/symptoms" },
    ],
    imageSlotPurpose: "blackbox-cutoff-settings",
    imageSlotCaption: "블랙박스 컷오프·상시전원 설명 이미지 영역",
  },
  {
    id: "bk-upgrade-conditions",
    title: "배터리 업그레이드가 가능한 조건과 피해야 할 조건",
    hook: "용량만 크면 좋은 것이 아닙니다. 단자·타입·트레이·충전계가 맞아야 합니다.",
    paragraphs: [
      "같은 L/R·같은 단자 타입(AGM DIN, JIS/GB, DIN) 안에서 후보를 봅니다.",
      "트레이·고정쇠·케이블·ISG·스마트충전을 함께 확인합니다.",
      "가능·권장·비권장을 구분하고, 사진·차량 데이터로 최종 확인하세요.",
    ],
    checkPoints: ["L/R·단자 타입", "트레이 여유", "ISG·AGM 여부"],
    ctas: [
      { label: "주문 전 체크리스트", href: "/order-checklist" },
      { label: "비교해보기", href: "/compare" },
    ],
    imageSlotPurpose: "upgrade-tray-fit",
    imageSlotCaption: "트레이·고정쇠·업그레이드 여유 설명 이미지 영역",
  },
  {
    id: "bk-din-code-mapping",
    title: "57412와 57820처럼 숫자 표기가 다른 이유",
    hook: "브랜드 품번이 다를 뿐, 같은 DIN H6급으로 보는 경우가 많습니다.",
    paragraphs: [
      "로케트 GB57820과 쏠라이트 CMF57412는 표준 규격 DIN74L로 연결해 설명하는 경우가 많습니다.",
      "Ah·치수는 비슷해도 브랜드별 CCA·중량·제조 주차는 제원표·라벨로 확인합니다.",
      "ISG 차량은 AGM 유지 여부를 먼저 봅니다.",
    ],
    checkPoints: ["라벨 숫자", "DIN74L 여부", "ISG·AGM"],
    ctas: [
      { label: "DIN74L 보기", href: "/batteries/DIN74L" },
      { label: "비교", href: "/compare?items=AGM80L,DIN74L" },
    ],
    imageSlotPurpose: "din-code-brand-mapping",
    imageSlotCaption: "57820·57412·DIN 표기 매핑 설명 이미지 영역",
    relatedBatteryCodes: ["DIN74L", "CMF57412"],
  },
  {
    id: "bk-brand-cca-variance",
    title: "브랜드별 CCA가 다른 이유",
    hook: "같은 AGM80L이라도 로케트·델코·아트라스·쏠라이트 제원표 수치가 조금씩 다를 수 있습니다.",
    paragraphs: [
      "제조사·제품 라인·시험 조건에 따라 CCA·RC·치수가 달라집니다.",
      "교체 기준은 브랜드명이 아니라 차량 순정 규격·L/R·타입·트레이입니다.",
      "4브랜드 제원은 배터리 상세·비교 페이지에서 표로 확인할 수 있습니다.",
    ],
    checkPoints: ["순정 Ah·CCA", "L/R·단자 타입", "브랜드별 제원표"],
    ctas: [
      { label: "AGM80L 상세", href: "/batteries/AGM80L" },
      { label: "규격 비교", href: "/compare?items=AGM70L,AGM80L" },
    ],
    imageSlotPurpose: "brand-cca-variance",
    imageSlotCaption: "브랜드별 CCA 차이 설명",
    relatedBatteryCodes: ["AGM80L", "AGM70L"],
    tags: ["브랜드", "제원"],
  },
  {
    id: "bk-brand-vs-spec",
    title: "브랜드보다 먼저 봐야 할 것은 규격입니다",
    hook: "로케트·델코·아트라스BX·쏠라이트는 선택지, 장착 규격이 기준입니다.",
    paragraphs: [
      "같은 AGM80L도 브랜드별 CCA·RC·중량이 조금 다를 수 있습니다.",
      "L/R·타입·Ah·트레이를 먼저 맞춘 뒤 브랜드를 고르는 순서가 안전합니다.",
      "제원표 데이터는 상세 페이지에서 브랜드별로 비교할 수 있습니다.",
    ],
    checkPoints: ["규격 코드", "L/R·타입", "브랜드별 CCA"],
    ctas: [
      { label: "가이드 목록", href: "/guides" },
      { label: "주문 전 체크", href: "/order-checklist" },
    ],
    imageSlotPurpose: "brand-vs-spec-priority",
    imageSlotCaption: "브랜드·규격 우선순위 안내 이미지 영역",
  },
];

/** @deprecated use CONTENT_GUIDES — alias for batteryGuideContents */
export const BATTERY_GUIDE_CONTENTS = CONTENT_GUIDES;

const guideById = new Map(CONTENT_GUIDES.map((g) => [g.id, g]));

export function getContentGuide(id: string): ContentGuide | null {
  return guideById.get(id) ?? null;
}

export function listContentGuideTeasers(limit = 10): ContentGuide[] {
  return CONTENT_GUIDES.slice(0, limit);
}
