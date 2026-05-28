import type { BatteryKnowledgeTopic } from "./types";

function topic(
  partial: Omit<BatteryKnowledgeTopic, "keyPoints" | "caution" | "hook" | "checkPoints"> & {
    hook?: string;
    keyPoints?: string[];
    checkPoints?: string[];
    caution?: string;
  },
): BatteryKnowledgeTopic {
  const points = partial.checkPoints ?? partial.keyPoints ?? [];
  return {
    hook: partial.hook ?? partial.summary,
    keyPoints: partial.keyPoints ?? points,
    checkPoints: partial.checkPoints ?? points,
    caution: partial.caution ?? "",
    ...partial,
  };
}

export const BATTERY_KNOWLEDGE_TOPICS: BatteryKnowledgeTopic[] = [
  topic({
    id: "diesel-larger-battery",
    title: "디젤 차량은 왜 가솔린보다 큰 배터리를 쓰는 경우가 많은가",
    hook: "압축착화·예열·전장 부하 때문에 같은 차종도 디젤이 한 단계 큰 규격이 들어가는 경우가 있습니다.",
    summary: "시동 부하와 전장 구성 차이로 용량·CCA 여유가 필요한 경우가 많습니다.",
    body: "디절은 시동 순간 토크 부하가 크고, 예열 플러그·전장 부하까지 합쳐 12V 계통에 부담이 큽니다. 최종 기준은 차종·연식·순정 라벨이며, 가솔린과 동일 규격으로 단정하지 않는 것이 안전합니다.",
    checkPoints: ["연료(가솔린/디젤)", "순정 Ah·CCA", "ISG·스마트충전"],
    keyPoints: ["디젤은 시동·예열 부하가 큼", "같은 차종도 규격이 다를 수 있음", "차량 DB·사진이 우선"],
    caution: "연료만 보고 규격을 단정하지 마세요.",
    relatedSpecs: ["AGM80L", "AGM95L"],
    ctaType: "vehicle",
  }),
  topic({
    id: "isg-agm",
    title: "AGM 배터리는 왜 ISG·스마트충전 차량에 많이 쓰이는가",
    hook: "잦은 시동·정지와 충방전 반복에 일반 MF보다 AGM·EFB 수용성이 맞는 경우가 많습니다.",
    summary: "충전 제어·BMS와 맞는 배터리 타입을 유지하는 것이 중요합니다.",
    body: "ISG·스마트충전은 엔진 정지·재시동이 잦아 배터리가 반복 충방전됩니다. 일반 DIN·CMF로 내리면 경고·수명·충전 오차가 생길 수 있어, 순정 AGM 여부를 먼저 확인합니다.",
    checkPoints: ["ISG·스마트충전 옵션", "순정 AGM 라벨", "BMS·IBS 등록"],
    relatedSpecs: ["AGM70L", "AGM80L"],
    relatedGuideIds: ["agm-vs-din"],
    ctaType: "spec",
  }),
  topic({
    id: "terminal-lr",
    title: "L/R 단자 방향은 무엇이며, 왜 중요한가",
    hook: "AGM60L·100R처럼 규격 이름의 L/R은 플러스 단자 위치 정보입니다.",
    summary: "케이블·고정쇠·트레이와 함께 봐야 장착 실수를 줄일 수 있습니다.",
    body: "L/R은 플러스 단자가 배터리 좌·우 어디에 오는지를 뜻합니다. 방향이 다르면 케이블 길이와 클램프 각도가 맞지 않습니다. 코드에 L/R이 있어도 트레이·홀 패턴은 차량별로 확인하는 것이 안전합니다.",
    checkPoints: ["규격 코드 L/R", "현재 장착과 동일 방향", "트레이·홀"],
    keyPoints: ["이름만으로 방향 파악 가능한 경우가 많음", "차량 트레이·케이블은 별도 확인", "R↔L은 단순 대체 아님"],
    caution: "L/R이 다른 규격을 억지로 장착하면 케이블·단자에 무리가 갈 수 있습니다.",
    relatedGuideIds: ["terminal-lr"],
    ctaType: "photo",
  }),
  topic({
    id: "din-vs-jis",
    title: "DIN 단자와 일반단자(JIS/GB) 계열의 차이",
    hook: "용량 숫자만 같다고 바꿀 수 없습니다. 케이스·단자·충전계가 다릅니다.",
    summary: "DIN은 유럽형 케이스, CMF·GB는 국내 승용·상용 JIS 계열이 흔합니다.",
    body: "DIN74L·57820·57412처럼 표기는 달라도 H6급 DIN 계열로 묶이는 경우가 있습니다. ISG 차량에 일반 DIN을, DIN 차량에 무리한 CMF를 맞추지 않는 것이 좋습니다.",
    checkPoints: ["순정 단자 타입", "ISG 여부", "표기(57820/57412)"],
    relatedSpecs: ["DIN74L", "CMF57412", "AGM80L"],
    ctaType: "compare",
  }),
  topic({
    id: "ah-vs-cca",
    title: "Ah와 CCA의 차이",
    hook: "Ah는 저장 용량, CCA는 저온 시동 순간 전류 — 장착 규격이 먼저입니다.",
    summary: "둘 다 중요하지만, 차량 트레이·타입·단자가 맞아야 합니다.",
    body: "20시간율 Ah는 전장 부하·주차 대기와 관련되고, CCA는 시동 순간 부하와 관련됩니다. 겨울·디젤·상용은 CCA 여유를, 블랙박스·상시전원은 Ah·대기전류를 함께 봅니다.",
    checkPoints: ["순정 Ah", "순정 CCA", "사용 환경"],
    relatedGuideIds: ["cca-ah"],
    ctaType: "guides",
  }),
  topic({
    id: "rc-meaning",
    title: "RC(보유 용량)가 의미하는 것",
    hook: "전장 부하를 버티는 여유와 연관 — 블랙박스·대기전류 설명과 연결됩니다.",
    summary: "브랜드·제품별 표기 방식이 달라 Ah·CCA·차량 순정을 함께 봅니다.",
    body: "Reserve Capacity는 부하 상태에서 배터리가 버티는 시간 성격의 지표입니다. 로케트 AGM 제원표에는 RC가 표기되며, 브랜드별로 수치가 다를 수 있습니다.",
    checkPoints: ["RC 표기 여부", "주차 녹화·상시전원", "Ah 여유"],
    relatedGuideIds: ["blackbox-cutoff"],
  }),
  topic({
    id: "90r-100r-confusion",
    title: "90R과 100R이 헷갈리는 이유",
    hook: "크기가 비슷해도 연식·트레이·용량이 달라 단순 대체가 어렵습니다.",
    summary: "포터2 등 상용은 연식·라벨·홀 패턴 확인이 핵심입니다.",
    body: "90R과 100R은 모두 R타입 상용 계열이지만 Ah·CCA·트레이가 다릅니다. 포터2는 2019년 이전 90R·이후 100R 후보가 나뉘는 경우가 많습니다.",
    checkPoints: ["차량 연식", "라벨 90R/100R", "트레이·홀"],
    relatedSpecs: ["90R", "100R"],
    ctaType: "compare",
  }),
  topic({
    id: "100r-vs-agm95l",
    title: "100R과 AGM95L이 단순 대체 대상이 아닌 이유",
    hook: "용량대가 비슷해도 R타입 CMF/상용과 L타입 AGM은 대체 관계가 아닙니다.",
    summary: "단자 방향·배터리 타입·적용 차량군이 다릅니다.",
    body: "100R은 R타입 일반·상용, AGM95L은 L타입 AGM·ISG 대형 승용 계열입니다. 비교는 차이 이해용이며, 교체는 차종·사진·순정 기준으로 확인합니다.",
    checkPoints: ["R vs L", "CMF/GB vs AGM", "차종·연료"],
    relatedSpecs: ["100R", "AGM95L"],
    caution: "“호환 안 됨” 한 줄로 끝내지 말고, 타입·단자·차량군 차이를 봅니다.",
    ctaType: "compare",
  }),
  topic({
    id: "agm70-vs-agm80",
    title: "AGM70L과 AGM80L 차이",
    hook: "L3와 L4 AGM — 디젤·SUV는 80L 후보가 있을 수 있습니다.",
    summary: "로케트 기준 L3 70Ah CCA760, L4 80Ah CCA800 — 트레이 여유 필요.",
    body: "AGM70L은 중형 ISG, AGM80L은 SUV·디젤·스마트충전에서 자주 확인됩니다. 업그레이드는 트레이·BMS·충전계를 함께 보며, 단순 Ah 상향으로 단정하지 않습니다.",
    relatedSpecs: ["AGM70L", "AGM80L"],
    ctaType: "compare",
  }),
  topic({
    id: "agm80-vs-agm95",
    title: "AGM80L과 AGM95L 차이",
    hook: "L4와 L5 — 대형 SUV·승합은 95L 검토, 트레이·무게 확인.",
    summary: "치수·중량·충전계가 커지므로 장착 여유가 필요합니다.",
    body: "AGM95L은 L5급으로 CCA·RC·중량이 AGM80L보다 큽니다. 100R·상용과 혼동하지 않도록 타입을 구분합니다.",
    relatedSpecs: ["AGM80L", "AGM95L"],
  }),
  topic({
    id: "cmf80-vs-agm80",
    title: "CMF80L과 AGM80L 차이",
    hook: "80Ah처럼 보여도 CMF(일반)와 AGM(ISG)은 타입이 다릅니다.",
    summary: "스타리아 디젤 CMF80L 후보와 ISG AGM80L은 차량군이 다릅니다.",
    body: "CMF80L은 일반 전해액 계열, AGM80L은 유리매트·충방전 수용성이 다릅니다. ISG·스마트충전 차량은 AGM 유지 여부를 먼저 확인합니다.",
    relatedSpecs: ["CMF80L", "AGM80L"],
    ctaType: "compare",
  }),
  topic({
    id: "din-code-mapping",
    title: "57412·57820처럼 숫자 표기가 다른 이유",
    hook: "브랜드 품번이 다를 뿐 DIN74L(H6)로 연결되는 경우가 많습니다.",
    summary: "로케트 GB57820 = 쏠라이트 CMF57412 ≈ DIN74L — CCA·중량은 브랜드별 확인.",
    body: "라벨에 57820, 57412, DIN74L이 혼재합니다. 표준 규격으로 먼저 맞춘 뒤, 브랜드별 CCA·중량·제조 주차를 비교합니다.",
    relatedSpecs: ["DIN74L", "GB57820", "CMF57412"],
    ctaType: "spec",
  }),
  topic({
    id: "hybrid-agm60-confusion",
    title: "하이브리드 보조 12V와 AGM60L 혼동 주의",
    hook: "HEV·PHEV 보조 12V는 차종별 규격이 다릅니다.",
    summary: "일반 승용 메인 배터리와 동일하게 보지 않습니다.",
    body: "하이브리드는 고전압 시스템과 별도 12V가 있으며, AGM60L·EV 12V·다른 Ah가 차종별로 적용됩니다. 연료 탭·라벨·사진을 함께 봅니다.",
    relatedSpecs: ["AGM60L", "EV 12V"],
    ctaType: "vehicle",
  }),
  topic({
    id: "ev-aux-12v",
    title: "전기차 EV 12V 배터리의 역할",
    hook: "고전압 메인 팩과 별개 — 문잠금·통신·시동 준비.",
    summary: "위치·규격·타입이 차종별로 다릅니다.",
    body: "EV·PHEV의 12V는 주행용 고전압 배터리와 역할이 다릅니다. AGM60L과 혼동되지 않도록 순정 라벨을 확인합니다.",
    relatedSpecs: ["EV 12V", "AGM60L"],
    relatedGuideIds: ["ev-12v"],
  }),
  topic({
    id: "blackbox-drain",
    title: "블랙박스 방전과 컷오프 설정",
    hook: "배터리 노후만이 아니라 상시전원·대기전류·컷오프를 함께 봅니다.",
    summary: "컷오프 12.2V 전후 설정과 사용 패턴 점검이 도움이 됩니다.",
    body: "이벤트·상시 녹화는 대기전류를 키웁니다. 배터리 교체 전 설정·퓨즈·충전 상태를 점검하는 것이 좋습니다.",
    relatedGuideIds: ["blackbox-cutoff"],
    ctaType: "guides",
  }),
  topic({
    id: "jump-re-drain",
    title: "점프 후 재방전 원인",
    hook: "일시 방전이 아니라 충전계·암전류·SOH를 의심할 수 있습니다.",
    summary: "점프 후 충전 상태·경고등·추가 전장품을 봅니다.",
    body: "점프 시동 후 다시 방전되면 발전기 충전 불량, 암전류, 배터리 수명 저하가 겹칠 수 있습니다. 규격 변경 전 점검을 권장합니다.",
  }),
  topic({
    id: "upgrade-possible",
    title: "배터리 업그레이드가 가능한 조건",
    hook: "용량만 키우는 작업이 아닙니다 — 단자·타입·트레이·충전계.",
    summary: "같은 L/R·같은 단자 타입·트레이 여유가 전제입니다.",
    body: "일반 단자는 JIS/GB 계열 안에서, DIN은 DIN 안에서, AGM ISG는 AGM DIN 안에서 검토합니다. DIN62→DIN74, AGM70→AGM80, 90R→100R은 조건부 후보입니다.",
    ctaType: "guides",
  }),
  topic({
    id: "upgrade-avoid",
    title: "배터리 업그레이드를 피해야 하는 경우",
    hook: "100R→AGM95L, CMF→AGM, DIN→AGM 무리한 다운/크로스는 비권장.",
    summary: "타입·단자·충전계가 다르면 후보에서 제외합니다.",
    body: "용량이 크다고 항상 좋은 것은 아닙니다. ISG 차량의 일반 MF 교체, 상용 R의 AGM 교체, EV 보조의 일반 승용 규격 적용은 위험할 수 있습니다.",
    caution: "자동 확정·무조건 교체 표현을 피하고, 사진·차종 데이터로 확인합니다.",
  }),
  topic({
    id: "photo-when-needed",
    title: "현재 장착 배터리 사진을 봐야 하는 경우",
    hook: "연식·트림·개조·표기 차이로 DB만으로 부족할 때.",
    summary: "라벨·단자·트레이가 보이면 오주문을 줄일 수 있습니다.",
    body: "포터2 연식 분기, 하이브리드/EV 보조, CMF↔AGM 혼동, L/R 확인이 필요한 경우 사진이 가장 빠른 확인 수단입니다.",
    ctaType: "photo",
  }),
  topic({
    id: "brand-vs-spec-first",
    title: "브랜드보다 규격이 먼저인 이유",
    hook: "로케트·쏠라이트·델코·아트라스BX는 선택지, 장착 규격이 기준입니다.",
    summary: "브랜드별 CCA·중량은 조금 다를 수 있으나, normalized 규격이 우선입니다.",
    body: "같은 AGM80L도 브랜드별 CCA·RC·중량·표기명이 다를 수 있습니다. 브랜드 선택 전에 L/R·타입·Ah·트레이를 맞추는 것이 안전합니다.",
    ctaType: "guides",
  }),
];

const byId = new Map(BATTERY_KNOWLEDGE_TOPICS.map((t) => [t.id, t]));

export function getBatteryKnowledgeTopic(id: string): BatteryKnowledgeTopic | null {
  return byId.get(id) ?? null;
}

export function getKnowledgeTopicsForSpec(code: string): BatteryKnowledgeTopic[] {
  const norm = code.trim().toUpperCase();
  return BATTERY_KNOWLEDGE_TOPICS.filter(
    (t) =>
      t.relatedSpecs?.some((s) => s.toUpperCase() === norm) ||
      t.relatedBatteryCodes?.some((s) => s.toUpperCase() === norm),
  ).slice(0, 3);
}
