import type { CompareDeepNote } from "./types";

function pairKey(a: string, b: string): string {
  return [a, b].map((c) => c.trim().toUpperCase()).sort().join("|");
}

export const COMPARE_DEEP_NOTES: CompareDeepNote[] = [
  {
    pairKey: pairKey("AGM70L", "AGM80L"),
    headline: "AGM70L vs AGM80L",
    summary: "같은 L타입 AGM이지만 용량·트레이·적용 차종군이 다릅니다.",
    bullets: [
      "L타입 DIN AGM — 단자 방향은 코드에서 확인 가능",
      "디젤·대형 SUV는 AGM80L 후보가 많음",
      "업그레이드는 트레이·BMS·충전계 확인 후 검토",
    ],
  },
  {
    pairKey: pairKey("AGM80L", "AGM95L"),
    headline: "AGM80L vs AGM95L",
    summary: "L타입 AGM 내 용량 단계 차이 — 무게·트레이·충전계를 함께 봅니다.",
    bullets: [
      "둘 다 L타입 AGM DIN 계열",
      "대형·승합은 AGM95L 검토 가능 — 트레이 여유 필요",
      "100R·상용과는 비교 이해용이며 대체 관계 아님",
    ],
  },
  {
    pairKey: pairKey("90R", "100R"),
    headline: "90R vs 100R",
    summary: "둘 다 R타입 상용 계열이지만 연식·트레이·용량이 달라 단순 대체가 어렵습니다.",
    bullets: [
      "R타입 — 이름에서 방향 확인",
      "포터2 연식별 후보 구분",
      "홀·고정쇠·CCA 차이 — 라벨·사진 확인",
    ],
  },
  {
    pairKey: pairKey("100R", "AGM95L"),
    headline: "100R과 AGM95L은 대체 규격이 아닙니다",
    summary: "용량대가 비슷해 보여도 R타입 CMF(상용)와 L타입 AGM(승용 ISG)은 단순 대체 대상이 아닙니다.",
    bullets: [
      "단자: 100R=R타입, AGM95L=L타입",
      "타입: CMF/GB vs AGM",
      "적용: 상용·포터 vs 대형 승용·ISG",
    ],
    notInterchangeable: true,
  },
  {
    pairKey: pairKey("CMF80L", "AGM80L"),
    headline: "CMF80L vs AGM80L",
    summary: "80Ah급처럼 보여도 CMF(일반)와 AGM(ISG)은 충전·BMS 조건이 다릅니다.",
    bullets: [
      "둘 다 L타입이지만 배터리 타입이 다름",
      "ISG·스마트충전은 AGM 우선 확인",
      "스타리아 등은 CMF80L 후보 — 차종 데이터 우선",
    ],
    notInterchangeable: true,
  },
  {
    pairKey: pairKey("DIN74L", "AGM80L"),
    headline: "DIN74L vs AGM80L",
    summary: "크기가 비슷한 DIN 계열이지만 일반 DIN과 AGM DIN은 ISG 차량에서 구분이 중요합니다.",
    bullets: [
      "L타입 DIN 계열",
      "ISG 차량: AGM 유지 검토",
      "오주문 빈도 높음 — 라벨·차종 확인",
    ],
    notInterchangeable: true,
  },
  {
    pairKey: pairKey("EV 12V", "AGM60L"),
    headline: "EV 12V vs AGM60L",
    summary: "하이브리드·EV 보조 12V와 일반 하이브리드 보조 AGM60L은 차종별로 다릅니다.",
    bullets: [
      "고전압 메인과 별개 12V",
      "위치·규격 차종별 상이",
      "단순 동일 취급 비권장",
    ],
    notInterchangeable: true,
  },
  {
    pairKey: pairKey("CMF90R", "CMF100R"),
    headline: "90R vs 100R (CMF)",
    summary: "상용 R타입 — 연식·트레이 기준으로 구분합니다.",
    bullets: [
      "R타입 유지",
      "용량·CCA·홀 패턴 차이",
      "포터2 연식 칩·사진 확인",
    ],
  },
];

const noteByPair = new Map(COMPARE_DEEP_NOTES.map((n) => [n.pairKey, n]));

export function getCompareDeepNote(codeA: string, codeB: string): CompareDeepNote | null {
  return noteByPair.get(pairKey(codeA, codeB)) ?? null;
}
