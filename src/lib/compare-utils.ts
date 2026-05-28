import type { Battery } from "./platform-types";

export const compareDefaultVisibleCodes = [
  "AGM60L",
  "AGM70L",
  "AGM80L",
  "AGM95L",
  "AGM105L",
  "DIN74L",
  "CMF90R",
  "CMF100R",
] as const;

export const compareRecommendedPairs: { label: string; a: string; b: string }[] = [
  { label: "90R vs 100R", a: "CMF90R", b: "CMF100R" },
  { label: "100L vs 100R", a: "100L", b: "100R" },
  { label: "AGM70L vs AGM80L", a: "AGM70L", b: "AGM80L" },
  { label: "AGM60L vs EV12V", a: "AGM60L", b: "AGM70L" },
  { label: "DIN74L vs CMF80L", a: "DIN74L", b: "CMF80L" },
  { label: "AGM80L vs AGM95L", a: "AGM80L", b: "AGM95L" },
  { label: "CMF80L vs 100R", a: "CMF80L", b: "100R" },
  { label: "AGM80L vs DIN74L", a: "AGM80L", b: "DIN74L" },
];

export const compareNextActions = [
  { title: "내 차에 맞는지 확인", description: "차종·연식·연료별 규격", href: "/vehicles" },
  { title: "AGM/DIN 가이드 보기", description: "호환·오주문 방지", href: "/guide/spec?guide=agm-vs-din" },
  { title: "규격 문의하기", description: "실무 기준 답변", href: "/ai" },
] as const;

export const BRAND_COMPARE_LABEL = "BATTERY MANAGER · 배터리 비교";

function parseNumber(text: string): number {
  const m = text.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export function getKeyDiffs(a: Battery, b: Battery): string[] {
  const diffs: string[] = [];
  const ahA = parseNumber(a.capacity);
  const ahB = parseNumber(b.capacity);
  const ccaA = parseNumber(a.cca);
  const ccaB = parseNumber(b.cca);

  if (ahB > ahA) diffs.push(`용량은 ${b.code}이 ${ahB - ahA}Ah 높음`);
  else if (ahA > ahB) diffs.push(`용량은 ${a.code}이 ${ahA - ahB}Ah 높음`);
  else diffs.push("용량 동일");

  if (ccaA > ccaB) diffs.push(`CCA는 ${a.code}이 약 ${ccaA - ccaB}A 높음`);
  else if (ccaB > ccaA) diffs.push(`CCA는 ${b.code}이 약 ${ccaB - ccaA}A 높음`);
  else diffs.push("CCA 유사");

  if (a.type !== b.type) diffs.push(`타입은 ${a.type} vs ${b.type}으로 다름`);
  if (a.terminal !== b.terminal) diffs.push(`단자: ${a.terminal}타입 vs ${b.terminal}타입`);
  if (a.size !== b.size) diffs.push("크기·트레이 공간 확인 필요");

  if (a.type === "DIN" || b.type === "DIN") {
    diffs.push("ISG/BMS 차량은 DIN 다운그레이드 주의");
  } else if (a.isgFit.includes("적합") || b.isgFit.includes("적합") || a.bmsNote || b.bmsNote) {
    diffs.push("ISG/BMS 차량은 교체 후 학습·등록 여부 확인");
  }

  return diffs.slice(0, 6);
}

export function getComparisonDescription(a: Battery, b: Battery): string {
  const parts: string[] = [];
  const ahA = parseNumber(a.capacity);
  const ahB = parseNumber(b.capacity);
  const ccaA = parseNumber(a.cca);
  const ccaB = parseNumber(b.cca);

  if (ahB > ahA) parts.push(`용량은 ${b.code}이 ${ahB - ahA}Ah 높음`);
  else if (ahA > ahB) parts.push(`용량은 ${a.code}이 ${ahA - ahB}Ah 높음`);
  else parts.push("용량 동일");

  if (ccaA > ccaB) parts.push(`CCA는 ${a.code}이 약 ${ccaA - ccaB}A 높음`);
  else if (ccaB > ccaA) parts.push(`CCA는 ${b.code}이 약 ${ccaB - ccaA}A 높음`);
  else parts.push("CCA 유사");

  if (a.type !== b.type) parts.push(`타입은 ${a.type} vs ${b.type}으로 다름`);
  else parts.push(`타입 ${a.type} 동일`);

  if (a.terminal !== b.terminal) parts.push(`${a.terminal}타입 vs ${b.terminal}타입`);
  if (a.size !== b.size) parts.push("크기·장착 공간 확인 필요");

  if (a.type === "DIN" || b.type === "DIN") {
    parts.push("ISG/BMS 차량은 DIN 다운그레이드 주의");
  }

  return `${parts.join(" · ")}.`;
}

export type CompareTableRow = {
  label: string;
  a: string;
  b: string;
  highlight?: boolean;
  caution?: boolean;
  higherSide?: "a" | "b" | "equal" | "none";
};

export function buildCompareTableRows(a: Battery, b: Battery): CompareTableRow[] {
  const ahA = parseNumber(a.capacity);
  const ahB = parseNumber(b.capacity);
  const ccaA = parseNumber(a.cca);
  const ccaB = parseNumber(b.cca);

  return [
    {
      label: "용량",
      a: a.capacity,
      b: b.capacity,
      highlight: true,
      higherSide: ahB > ahA ? "b" : ahA > ahB ? "a" : "equal",
    },
    {
      label: "CCA",
      a: a.cca,
      b: b.cca,
      highlight: true,
      higherSide: ccaB > ccaA ? "b" : ccaA > ccaB ? "a" : "equal",
    },
    { label: "타입", a: a.type, b: b.type, highlight: a.type !== b.type },
    {
      label: "단자",
      a: `${a.terminal}타입`,
      b: `${b.terminal}타입`,
      highlight: a.terminal !== b.terminal,
      caution: a.terminal !== b.terminal,
    },
    { label: "크기", a: a.size, b: b.size, highlight: a.size !== b.size },
    {
      label: "추천 차종",
      a: a.pros,
      b: b.pros,
      highlight: true,
    },
    {
      label: "주의점",
      a: a.cons,
      b: b.cons,
      highlight: true,
      caution: true,
    },
    {
      label: "ISG/BMS",
      a: a.isgFit,
      b: b.isgFit,
      highlight: a.isgFit !== b.isgFit,
      caution: a.type === "DIN" || b.type === "DIN",
    },
    {
      label: "교체 시",
      a: a.bmsNote,
      b: b.bmsNote,
      highlight: a.bmsNote !== b.bmsNote,
      caution: true,
    },
  ];
}

export function getPickGuideItems(b: Battery): string[] {
  const items: string[] = [];
  if (b.type === "AGM") {
    if (parseNumber(b.capacity) <= 70) items.push("중형 세단·소형 SUV", "순정 규격 유지", "장착 공간 제한 시 검토");
    else if (parseNumber(b.capacity) <= 80) items.push("SUV·대형 세단", "높은 CCA 필요", "트레이 공간 충분");
    else items.push("대형 SUV·승합", "ISG·대기전류 많은 차량", "무게·가격 여유 확인");
  } else if (b.type === "DIN") {
    items.push("일반(비ISG) 차량", "가격·호환 우선", "ISG 차량은 AGM 유지 권장");
  } else if (b.type === "CMF") {
    items.push("상용·일반 차량", "단자 L/R 확인", "연식·트림별 확인");
  } else {
    items.push(b.pros, "순정 규격 확인", b.cons);
  }
  return items.slice(0, 3);
}

export const compareCautions = [
  "L/R·단자 타입이 다르면 단순 대체 불가",
  "트레이·고정쇠·케이블 여유 확인",
  "ISG·BMS 차량은 AGM·등록 여부 확인",
] as const;
