import type { UpgradeRule } from "./types";

/** 업그레이드·호환 — 자동 확정 없이 후보 안내만 */
export const UPGRADE_RULES: UpgradeRule[] = [
  {
    id: "din62-to-din74",
    fromCode: "DIN62L",
    toCode: "DIN74L",
    feasibility: "conditional",
    summary: "트레이 길이·홀·단자 L타입이 맞는 일반 차량에서 검토 가능",
    conditions: ["같은 L타입", "DIN 계열 유지", "트레이 여유"],
    cautions: ["ISG 차량은 AGM 검토 우선", "고정쇠·케이블 길이 확인"],
  },
  {
    id: "agm70-to-agm80",
    fromCode: "AGM70L",
    toCode: "AGM80L",
    feasibility: "conditional",
    summary: "일부 디젤·ISG·SUV에서 트레이 여유가 있으면 검토 가능",
    conditions: ["L타입 유지", "AGM DIN 계열", "ISG·스마트충전 호환"],
    cautions: ["단순 업그레이드로 단정하지 않음", "BMS·충전계 확인"],
  },
  {
    id: "90r-to-100r",
    fromCode: "90R",
    toCode: "100R",
    feasibility: "conditional",
    summary: "포터2 등 상용 — 연식·장착 공간·홀 패턴에 따라 갈림",
    conditions: ["R타입 유지", "상용 트레이·홀", "연식·라벨 확인"],
    cautions: ["연식만으로 단정 금지", "AGM95L과 혼동 금지"],
  },
  {
    id: "cmf80-to-cmf90",
    fromCode: "CMF80L",
    toCode: "CMF90L",
    feasibility: "conditional",
    summary: "일반 CMF 계열 내 용량 상향 — 단자·트레이·고정쇠 확인",
    conditions: ["L타입", "JIS/GB 단자", "트레이·고정쇠"],
    cautions: ["ISG 차량은 AGM 여부 우선", "AGM80L과 타입 다름"],
  },
  {
    id: "agm60-to-agm70",
    fromCode: "AGM60L",
    toCode: "AGM70L",
    feasibility: "not_recommended",
    summary: "하이브리드 보조·ISG 소형과 중형 ISG 용도가 다를 수 있음",
    conditions: ["차종·연료·보조 12V 여부"],
    cautions: ["무리한 Ah 상향 비권장", "사진·차량 데이터 우선"],
  },
  {
    id: "agm80-to-agm95",
    fromCode: "AGM80L",
    toCode: "AGM95L",
    feasibility: "conditional",
    summary: "대형 SUV·승합 — 트레이·무게·충전계 여유 필요",
    conditions: ["L타입", "AGM 유지", "트레이·고정쇠"],
    cautions: ["BMS·IBS 등록 여부", "100R·상용과 혼동 금지"],
  },
];

export const UPGRADE_PRINCIPLES: string[] = [
  "같은 단자 방향(L/R)이어야 합니다.",
  "같은 단자 타입(일반 JIS/GB, DIN, AGM DIN)을 맞춥니다.",
  "트레이 길이·폭·높이 여유와 고정쇠·케이블 길이를 봅니다.",
  "ISG·스마트충전 차량은 AGM 유지 여부를 먼저 확인합니다.",
  "하이브리드·EV 보조 12V는 일반 메인 배터리처럼 보지 않습니다.",
  "용량이 크다고 항상 좋은 것은 아닙니다. 충전 시스템·장착 공간이 맞아야 합니다.",
];

export function getUpgradeRulesForCode(code: string): UpgradeRule[] {
  const norm = code.trim().toUpperCase();
  return UPGRADE_RULES.filter((r) => r.fromCode.toUpperCase() === norm || r.toCode.toUpperCase() === norm);
}
