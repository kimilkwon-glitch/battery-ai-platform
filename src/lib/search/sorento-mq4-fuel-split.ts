/** 쏘렌토 MQ4 — 연료별 추천 분리 (검색 UX, 매칭 로직 변경 없음) */

export type FuelVariantCard = {
  fuelLabel: string;
  spec: string;
  status: string;
  statusTone: "confirmed" | "candidate";
  summary: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

export function isSorentoMq4AmbiguousQuery(query: string): boolean {
  const q = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (!/쏘렌토|sorento/.test(q)) return false;
  if (!/mq4|4세대|4\s*세대/.test(q)) return false;
  if (/하이브|hev|hybrid|하브/.test(q)) return false;
  return true;
}

export const SORENTO_MQ4_FUEL_VARIANTS: FuelVariantCard[] = [
  {
    fuelLabel: "쏘렌토 MQ4 하이브리드",
    spec: "AGM60L",
    status: "DB 기준 확정",
    statusTone: "confirmed",
    summary: "하이브리드 보조 12V는 AGM60L이 대표입니다. 현재 장착 라벨·단자를 사진으로 한 번 더 확인하세요.",
    primaryHref: "/batteries/AGM60L",
    primaryLabel: "AGM60L 상세 보기",
    secondaryHref: "/photo-check",
    secondaryLabel: "사진으로 최종 확인",
  },
  {
    fuelLabel: "쏘렌토 MQ4 디젤·가솔린",
    spec: "AGM80L",
    status: "연식·ISG·BMS에 따라 확인 필요",
    statusTone: "candidate",
    summary: "내연 메인 배터리는 AGM80L 후보가 많습니다. 연식·스마트충전·현재 라벨을 함께 보세요.",
    primaryHref: "/photo-check",
    primaryLabel: "사진으로 확인",
    secondaryHref: "/vehicle/sorento-mq4",
    secondaryLabel: "차량 상세 보기",
  },
];
