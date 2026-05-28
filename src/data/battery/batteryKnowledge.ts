import type { BatteryKnowledgeTopic } from "./types";

export const BATTERY_KNOWLEDGE_TOPICS: BatteryKnowledgeTopic[] = [
  {
    id: "diesel-larger-battery",
    title: "디젤은 왜 가솔린보다 큰 배터리를 쓰는 경우가 많을까",
    summary: "시동 부하·전장 부하·예열 장치 때문에 용량·CCA 여유가 필요한 경우가 많습니다.",
    body: "디절은 압축착화 방식 특성상 시동 순간 부하가 큰 편입니다. 예열·전장 부하까지 합치면 같은 차종이라도 디젤이 더 큰 규격이 들어가는 경우가 있습니다. 다만 최종 기준은 차종·연식·현재 장착 배터리입니다.",
    checkPoints: ["연료(가솔린/디젤) 확인", "현재 장착 Ah·CCA", "ISG·스마트충전 여부"],
    relatedBatteryCodes: ["AGM80L", "AGM95L"],
  },
  {
    id: "isg-agm",
    title: "ISG 차량은 왜 AGM이 필요한가",
    summary: "잦은 시동·정지와 충방전 반복에 일반 MF보다 AGM·EFB 수용성이 맞는 경우가 많습니다.",
    body: "ISG·스마트충전 차량은 엔진 정지·재시동이 잦아 배터리 충방전 부담이 큽니다. 일반 DIN·CMF로 내리면 충전 제어·수명 측면에서 문제가 생길 수 있어, 차량 조건에 맞는 AGM 유지 여부를 먼저 봅니다.",
    checkPoints: ["ISG·스마트충전 옵션", "순정 AGM 여부", "BMS·IBS 등록 필요 여부"],
    relatedBatteryCodes: ["AGM70L", "AGM80L"],
    relatedGuideIds: ["agm-vs-din"],
  },
  {
    id: "ev-aux-12v",
    title: "하이브리드·EV 보조 12V는 왜 따로 봐야 하는가",
    summary: "고전압 메인 배터리와 별개로 전장·시동 준비·제어에 쓰이는 12V 계열입니다.",
    body: "전기차·하이브리드의 12V는 문잠금·통신·시동 준비 등에 쓰입니다. 위치·규격·타입이 차종별로 달라 일반 승용 메인 배터리와 동일하게 보기 어렵습니다.",
    checkPoints: ["보조 12V 위치", "라벨 규격 코드", "AGM60L·EV 12V 혼동 여부"],
    relatedBatteryCodes: ["EV 12V", "AGM60L"],
    relatedGuideIds: ["ev-12v"],
  },
  {
    id: "terminal-lr",
    title: "L/R 단자 방향이 왜 중요한가",
    summary: "규격 이름의 L/R은 단자 방향 정보입니다. 케이블·고정쇠·트레이와 함께 봐야 합니다.",
    body: "플러스 단자 위치가 다르면 케이블 길이·클램프 각도가 맞지 않습니다. AGM60L·100R처럼 코드에 L/R이 있으면 방향은 알 수 있지만, 실제 차량은 트레이·케이블·고정쇠까지 함께 확인하는 것이 안전합니다.",
    checkPoints: ["라벨 L/R 표기", "현재 장착과 같은 방향인지", "트레이·홀 패턴"],
    relatedGuideIds: ["terminal-lr"],
  },
  {
    id: "din-vs-jis",
    title: "DIN과 일반단자(JIS/GB) 차이",
    summary: "외형·단자 구조가 달라 용량만 보고 바꾸면 장착·충전계 문제가 생길 수 있습니다.",
    body: "DIN 계열은 유럽형 케이스·단자 구조를 쓰는 경우가 많고, CMF·GB는 국내 승용·상용에서 흔한 JIS 계열입니다. DIN 차량에 CMF를, ISG AGM 차량에 일반 DIN을 무리하게 맞추지 않는 것이 좋습니다.",
    checkPoints: ["순정 단자 타입", "ISG·스마트충전", "트레이·홀 위치"],
    relatedBatteryCodes: ["DIN74L", "CMF80L", "AGM80L"],
    relatedGuideIds: ["agm-vs-din", "din-sizes"],
  },
  {
    id: "cca-meaning",
    title: "CCA는 무엇인가",
    summary: "저온 시동 순간 전류 지표로, 디젤·겨울·상용에서 특히 참고합니다.",
    body: "Cold Cranking Amps(CCA)는 저온에서 시동에 필요한 순간 전류 성능을 보는 지표입니다. CCA만 높다고 모든 차량에 맞는 것은 아니며, 장착 규격·단자·타입이 우선입니다.",
    checkPoints: ["겨울 시동 불안", "디젤·상용 여부", "순정 CCA 대비 여유"],
    relatedGuideIds: ["cca-ah", "winter-cca"],
  },
  {
    id: "ah-vs-cca",
    title: "Ah와 CCA 차이",
    summary: "Ah는 저장 용량, CCA는 시동 순간 힘 — 둘 다 보되 장착 규격이 먼저입니다.",
    body: "Ah(20시간율)는 전장 부하·주차 대기와 관련되고, CCA는 시동 순간 부하와 관련됩니다. 업그레이드는 Ah만 키우기보다 트레이·충전계·단자 조건을 함께 봅니다.",
    checkPoints: ["순정 Ah", "순정 CCA", "블랙박스·대기전류"],
    relatedGuideIds: ["cca-ah"],
  },
  {
    id: "rc-meaning",
    title: "RC(예비 용량)는 무엇인가",
    summary: "전장 부하를 버티는 여유와 연관 — 블랙박스·대기전류 설명과 함께 볼 수 있습니다.",
    body: "Reserve Capacity(RC)는 부하 상태에서 배터리가 버티는 시간 성격의 지표입니다. 브랜드·제품별 표기 차이가 있어, 사이트에서는 Ah·CCA·차량 순정을 우선 안내합니다.",
    checkPoints: ["주차 녹화·상시전원", "대기전류", "Ah 여유"],
    relatedGuideIds: ["blackbox-cutoff"],
  },
  {
    id: "blackbox-drain",
    title: "블랙박스 방전",
    summary: "배터리 노후만이 아니라 컷오프·대기전류·주차 패턴을 함께 봅니다.",
    body: "블랙박스 상시전원·이벤트 녹화는 대기전류를 키웁니다. 컷오프 전압·녹화 모드·배터리 수명을 같이 점검하면 원인 파악에 도움이 됩니다.",
    checkPoints: ["컷오프 설정(12.2V 전후)", "상시전원 모드", "배터리 제조·경과"],
    relatedGuideIds: ["blackbox-cutoff"],
  },
  {
    id: "jump-re-drain",
    title: "점프 후 재방전",
    summary: "일시 방전이 아니라 충전계·암전류·배터리 수명 문제일 수 있습니다.",
    body: "점프 시동 후 다시 방전되면 배터리 자체 노후뿐 아니라 발전기 충전·암전류·전장품 부하를 의심할 수 있습니다. 증상만으로 규격을 바꾸기보다 점검 후 교체 여부를 판단하는 것이 좋습니다.",
    checkPoints: ["충전 상태·경고등", "최근 점프 이력", "추가 전장품"],
  },
];

const topicById = new Map(BATTERY_KNOWLEDGE_TOPICS.map((t) => [t.id, t]));

export function getBatteryKnowledgeTopic(id: string): BatteryKnowledgeTopic | null {
  return topicById.get(id) ?? null;
}
