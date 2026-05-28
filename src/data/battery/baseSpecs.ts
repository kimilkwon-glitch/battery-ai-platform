import type { BaseBatterySpec } from "./types";

/** 로케트·쏠라이트 제원표 기준 정리 — 설명·상세·비교용 (검색 매칭 로직과 분리) */
function spec(
  partial: Omit<BaseBatterySpec, "voltage" | "brandVariancePossible" | "capacityAh5Hr" | "rc" | "weightKg" | "terminalPolarity"> &
    Partial<Pick<BaseBatterySpec, "capacityAh5Hr" | "rc" | "weightKg" | "terminalPolarity">> & { voltage?: number },
): BaseBatterySpec {
  return {
    ...partial,
    voltage: partial.voltage ?? 12,
    brandVariancePossible: true,
    capacityAh5Hr: partial.capacityAh5Hr ?? null,
    rc: partial.rc ?? null,
    weightKg: partial.weightKg ?? null,
    terminalPolarity: partial.terminalPolarity ?? null,
  };
}

function dims(length: number, width = 175, height = 190, totalHeight: number | null = null) {
  return { length, width, height, totalHeight };
}

function parseCca(text: string): number | null {
  const m = text.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

/** platform-catalog Ah/CCA/크기와 동기 — 미확정 항목은 null */
export const BASE_BATTERY_SPECS: BaseBatterySpec[] = [
  spec({
    code: "AGM60L",
    aliases: ["AGM60", "AGM L2", "LN2 AGM"],
    family: "AGM",
    capacityAh20Hr: 60,
    cca: 640,
    dimensionsMm: dims(242),
    terminalLayout: "L",
    terminalType: "DIN",
    commonUse: ["하이브리드 보조 12V", "ISG 소형", "스마트충전"],
    notes: ["AGM L2 계열로 분류되는 경우가 많음", "하이브리드·EV 보조 12V와 용도가 다를 수 있음"],
  }),
  spec({
    code: "AGM70L",
    aliases: ["AGM70", "AGM L3", "LN3 AGM"],
    family: "AGM",
    capacityAh20Hr: 70,
    cca: 760,
    dimensionsMm: dims(278),
    terminalLayout: "L",
    terminalType: "DIN",
    commonUse: ["ISG", "중형 승용"],
    notes: ["AGM L3 계열", "SUV·디젤은 AGM80L일 수 있음"],
  }),
  spec({
    code: "AGM80L",
    aliases: ["AGM80", "AGM L4", "LN4 AGM"],
    family: "AGM",
    capacityAh20Hr: 80,
    cca: 800,
    dimensionsMm: dims(315),
    terminalLayout: "L",
    terminalType: "DIN",
    commonUse: ["ISG", "SUV", "디젤", "스마트충전"],
    notes: ["AGM L4 계열", "CMF80L·DIN74L과 혼동 주의"],
  }),
  spec({
    code: "AGM95L",
    aliases: ["AGM95", "AGM L5", "LN5 AGM"],
    family: "AGM",
    capacityAh20Hr: 95,
    cca: 850,
    dimensionsMm: dims(353),
    terminalLayout: "L",
    terminalType: "DIN",
    commonUse: ["대형 SUV", "ISG", "승합"],
    notes: ["AGM L5 계열", "100R·상용 R타입과 단순 대체 대상 아님"],
  }),
  spec({
    code: "AGM105L",
    aliases: ["AGM105", "AGM L6", "LN6 AGM"],
    family: "AGM",
    capacityAh20Hr: 105,
    cca: 900,
    dimensionsMm: dims(353),
    terminalLayout: "L",
    terminalType: "DIN",
    commonUse: ["대형 SUV", "승합", "프리미엄 세단"],
    notes: ["AGM L6 계열", "트레이·고정쇠 여유 확인"],
  }),
  spec({
    code: "AGM95R",
    aliases: ["AGM95 R"],
    family: "AGM",
    capacityAh20Hr: 95,
    cca: 850,
    dimensionsMm: dims(353),
    terminalLayout: "R",
    terminalType: "DIN",
    commonUse: ["R단자 대형 승용", "제네시스·SUV"],
    notes: ["AGM95L과 L/R만 다름 — 차량 트레이 기준 확인"],
  }),
  spec({
    code: "DIN74L",
    aliases: ["57412", "CMF57412", "GB57820", "57820", "DIN H6"],
    family: "DIN",
    capacityAh20Hr: 74,
    cca: 680,
    dimensionsMm: dims(278),
    terminalLayout: "L",
    terminalType: "DIN",
    commonUse: ["일반 승용", "비ISG"],
    notes: ["ISG 차량은 AGM 유지 여부 우선", "쏠라이트 57412·로케트 57820 등 별도 품번"],
  }),
  spec({
    code: "DIN62L",
    aliases: ["56219", "CMF56219", "DIN H5"],
    family: "DIN",
    capacityAh20Hr: 62,
    cca: 620,
    dimensionsMm: dims(242),
    terminalLayout: "L",
    terminalType: "DIN",
    commonUse: ["중형 일반"],
    notes: ["DIN74L 업그레이드 후보 — 트레이 여유 필요"],
  }),
  spec({
    code: "CMF80L",
    aliases: ["80L", "CMF 80L"],
    family: "CMF",
    capacityAh20Hr: 80,
    cca: 780,
    dimensionsMm: dims(315),
    terminalLayout: "L",
    terminalType: "JIS",
    commonUse: ["일반 중대형", "스타리아 디젤 등"],
    notes: ["L타입 CMF", "AGM80L과 타입·단자·충전계가 다름"],
  }),
  spec({
    code: "CMF90L",
    aliases: ["90L"],
    family: "CMF",
    capacityAh20Hr: 90,
    cca: 820,
    dimensionsMm: dims(353),
    terminalLayout: "L",
    terminalType: "JIS",
    commonUse: ["대형 일반"],
    notes: ["CMF80L 업그레이드 후보 — 트레이·고정쇠 확인"],
  }),
  spec({
    code: "CMF90R",
    aliases: ["90R", "GB90R"],
    family: "CMF",
    capacityAh20Hr: 90,
    cca: 820,
    dimensionsMm: dims(353),
    terminalLayout: "R",
    terminalType: "JIS",
    commonUse: ["포터2 구형", "상용 R타입"],
    notes: ["R타입 상용", "100R과 연식·트레이 기준으로 구분"],
  }),
  spec({
    code: "CMF100R",
    aliases: ["100R", "GB100R"],
    family: "CMF",
    capacityAh20Hr: 100,
    cca: 860,
    dimensionsMm: dims(353),
    terminalLayout: "R",
    terminalType: "JIS",
    commonUse: ["포터2 신형", "상용 R타입"],
    notes: ["R타입 상용 100Ah급", "AGM95L과 단순 대체 대상 아님"],
  }),
  spec({
    code: "100R",
    aliases: ["CMF100R", "GB100R"],
    family: "CMF",
    capacityAh20Hr: 100,
    cca: 860,
    dimensionsMm: dims(353),
    terminalLayout: "R",
    terminalType: "JIS",
    commonUse: ["포터2 2020년 이후", "상용"],
    notes: ["R타입 — 이름에서 방향 확인 가능", "90R과 용량·트레이가 다를 수 있음"],
  }),
  spec({
    code: "90R",
    aliases: ["CMF90R", "GB90R"],
    family: "CMF",
    capacityAh20Hr: 90,
    cca: 820,
    dimensionsMm: dims(353),
    terminalLayout: "R",
    terminalType: "JIS",
    commonUse: ["포터2 구형", "상용"],
    notes: ["R타입", "100R과 연식·장착 공간 기준으로 구분"],
  }),
  spec({
    code: "40L",
    aliases: ["CMF40L", "40R"],
    family: "CMF",
    capacityAh20Hr: 40,
    cca: 520,
    dimensionsMm: dims(207),
    terminalLayout: "L",
    terminalType: "JIS",
    commonUse: ["경차·소형"],
    notes: ["40R은 R타입 별도 확인"],
  }),
  spec({
    code: "50L",
    aliases: ["CMF50L", "54459"],
    family: "CMF",
    capacityAh20Hr: 50,
    cca: 580,
    dimensionsMm: dims(207),
    terminalLayout: "L",
    terminalType: "JIS",
    commonUse: ["소형 승용"],
    notes: ["품번 54459 등 브랜드별 표기"],
  }),
  spec({
    code: "60R",
    aliases: ["CMF60R"],
    family: "CMF",
    capacityAh20Hr: 60,
    cca: 640,
    dimensionsMm: dims(242),
    terminalLayout: "R",
    terminalType: "JIS",
    commonUse: ["R단자 소형·중형"],
    notes: ["60L과 L/R 구분"],
  }),
  spec({
    code: "80L",
    aliases: ["CMF80L"],
    family: "CMF",
    capacityAh20Hr: 80,
    cca: 780,
    dimensionsMm: dims(315),
    terminalLayout: "L",
    terminalType: "JIS",
    commonUse: ["중대형 일반"],
    notes: ["CMF80L과 동일 계열로 보는 경우가 많음 — 라벨 전체 코드 확인"],
  }),
  spec({
    code: "80R",
    aliases: ["CMF80R", "AGM80R"],
    family: "CMF",
    capacityAh20Hr: 80,
    cca: 780,
    dimensionsMm: dims(315),
    terminalLayout: "R",
    terminalType: "JIS",
    commonUse: ["R단자 중형", "스타리아 LPG AGM80R 등"],
    notes: ["AGM80R과 CMF80R 표기 혼동 주의"],
  }),
  spec({
    code: "EV 12V",
    aliases: ["EV12V", "EV-12V", "하이브리드 12V"],
    family: "EV",
    capacityAh20Hr: 60,
    cca: 620,
    dimensionsMm: dims(242),
    terminalLayout: "L",
    terminalType: "DIN",
    commonUse: ["EV·PHEV 보조 12V"],
    notes: ["고전압 메인 배터리와 별개", "AGM60L과 혼동 주의 — 차종별 위치·규격"],
  }),
];

const codeIndex = new Map<string, string>();
for (const s of BASE_BATTERY_SPECS) {
  codeIndex.set(s.code.toUpperCase().replace(/\s+/g, " "), s.code);
  codeIndex.set(s.code, s.code);
  for (const a of s.aliases) codeIndex.set(a.toUpperCase(), s.code);
}

export function getBaseBatterySpec(rawCode: string): BaseBatterySpec | null {
  const key = rawCode.trim().replace(/\s+/g, " ");
  const code = codeIndex.get(key) ?? codeIndex.get(key.toUpperCase());
  if (!code) return null;
  return BASE_BATTERY_SPECS.find((s) => s.code === code) ?? null;
}

export function listBaseBatterySpecCodes(): string[] {
  return BASE_BATTERY_SPECS.map((s) => s.code);
}

/** catalog CCA 문자열 보조 */
export function mergeCatalogCca(code: string, catalogCca?: string): number | null {
  const base = getBaseBatterySpec(code);
  if (base?.cca) return base.cca;
  return catalogCca ? parseCca(catalogCca) : null;
}
