import type { BatteryBrandSpec, BatteryBrand, BatteryFamily, TerminalLayout } from "./types";

function dims(length: number, width = 175, height = 169, totalHeight = 190) {
  return { length, width, height, totalHeight };
}

function rocketAgm(
  code: string,
  normalizedCode: string,
  aliases: string[],
  series: string,
  ah20: number,
  ah5: number,
  len: number,
  rc: number,
  cca: number,
  kg: number,
  commonUse: string[],
): BatteryBrandSpec {
  return {
    code,
    normalizedCode,
    brand: "ROCKET",
    productName: code,
    aliases,
    family: "AGM",
    voltage: 12,
    capacityAh20Hr: ah20,
    capacityAh5Hr: ah5,
    cca,
    rc,
    weightKg: kg,
    dimensionsMm: dims(len),
    terminalLayout: "L",
    terminalPolarity: "-+",
    terminalType: "AGM_DIN",
    commonUse,
    sourceNote: "로케트 AGM Series 제원표",
  };
}

function soliteAgmPending(
  code: string,
  normalizedCode: string,
  aliases: string[],
  series: string,
  len: number,
  ah20: number,
  ah5: number | null,
  commonUse: string[],
): BatteryBrandSpec {
  return {
    code,
    normalizedCode,
    brand: "SOLITE",
    productName: code,
    aliases,
    family: "AGM",
    voltage: 12,
    capacityAh20Hr: ah20,
    capacityAh5Hr: ah5,
    cca: null,
    rc: null,
    weightKg: null,
    dimensionsMm: dims(len),
    terminalLayout: "L",
    terminalPolarity: "-+",
    terminalType: "AGM_DIN",
    commonUse,
    sourceNote: "쏠라이트 AGM — 치수·용량은 L계열 표준, CCA/RC/중량은 제원표 이미지 확인 후 보강",
    cautionNotes: ["브랜드별 CCA·중량은 로케트와 다를 수 있음"],
  };
}

function rocketGbStub(
  code: string,
  normalizedCode: string,
  aliases: string[],
  terminal: TerminalLayout,
  family: BatteryFamily = "GB",
  partial?: Partial<BatteryBrandSpec>,
): BatteryBrandSpec {
  return {
    code,
    normalizedCode,
    brand: "ROCKET",
    productName: code,
    aliases,
    family,
    voltage: 12,
    terminalLayout: terminal,
    terminalPolarity: "-+",
    terminalType: "JIS",
    sourceNote: "로케트 GB/CMF 계열 — 상세 수치는 제원표·라벨 확인",
    cautionNotes: ["제원표에 없는 항목은 null"],
    ...partial,
  };
}

/** 로케트·쏠라이트 브랜드별 제원 — 검색 매칭과 분리, 상세·비교·카드 설명용 */
export const BATTERY_SPECS_BY_BRAND: BatteryBrandSpec[] = [
  // ── ROCKET AGM (제공 제원표) ──
  rocketAgm("AGM60", "AGM60L", ["AGM60L", "AGM L2", "LN2 AGM"], "L2", 60, 48, 242, 100, 640, 18, [
    "ISG 소형",
    "하이브리드 보조 12V",
  ]),
  rocketAgm("AGM60L", "AGM60L", ["AGM60", "AGM L2"], "L2", 60, 48, 242, 100, 640, 18, ["ISG 소형", "HEV 보조 12V"]),
  rocketAgm("AGM70", "AGM70L", ["AGM70L", "AGM L3", "LN3 AGM"], "L3", 70, 56, 278, 120, 760, 21, ["ISG 중형 승용"]),
  rocketAgm("AGM70L", "AGM70L", ["AGM70", "AGM L3"], "L3", 70, 56, 278, 120, 760, 21, ["ISG", "중형 세단"]),
  rocketAgm("AGM80", "AGM80L", ["AGM80L", "AGM L4", "LN4 AGM"], "L4", 80, 64, 315, 140, 800, 23.5, [
    "ISG",
    "디젤 SUV",
    "스마트충전",
  ]),
  rocketAgm("AGM80L", "AGM80L", ["AGM80", "AGM L4"], "L4", 80, 64, 315, 140, 800, 23.5, ["ISG 세단·SUV"]),
  rocketAgm("AGM95", "AGM95L", ["AGM95L", "AGM L5", "LN5 AGM"], "L5", 95, 74, 353, 160, 850, 27, ["대형 SUV", "ISG"]),
  rocketAgm("AGM95L", "AGM95L", ["AGM95", "AGM L5"], "L5", 95, 74, 353, 160, 850, 27, ["대형·승합"]),
  rocketAgm("AGM105", "AGM105L", ["AGM105L", "AGM L6", "LN6 AGM"], "L6", 105, 84, 394, 190, 950, 29.8, [
    "대형 SUV",
    "승합",
  ]),
  rocketAgm("AGM105L", "AGM105L", ["AGM105", "AGM L6"], "L6", 105, 84, 394, 190, 950, 29.8, ["프리미엄 대형"]),

  // ── SOLITE AGM (치수·Ah는 L계열, CCA/RC/중량은 자료 확인 전 null) ──
  soliteAgmPending("AGM60L", "AGM60L", ["AGM60", "AGM L2"], "L2", 242, 60, 48, ["하이브리드", "ISG 소형"]),
  soliteAgmPending("AGM70L", "AGM70L", ["AGM70", "AGM L3"], "L3", 278, 70, 56, ["ISG 중형"]),
  soliteAgmPending("AGM80L", "AGM80L", ["AGM80", "AGM L4"], "L4", 315, 80, 64, ["ISG·SUV"]),
  soliteAgmPending("AGM95L", "AGM95L", ["AGM95", "AGM L5"], "L5", 353, 95, 74, ["대형 SUV"]),

  // ── ROCKET DIN / GB (57820 = DIN74L — catalog·제원표 병행) ──
  {
    code: "GB57820",
    normalizedCode: "DIN74L",
    brand: "ROCKET",
    productName: "로케트 GB57820",
    aliases: ["57820", "DIN74L", "DIN H6"],
    family: "DIN",
    voltage: 12,
    capacityAh20Hr: 74,
    capacityAh5Hr: null,
    cca: 680,
    rc: null,
    weightKg: null,
    dimensionsMm: dims(278, 175, 190),
    terminalLayout: "L",
    terminalPolarity: "-+",
    terminalType: "DIN",
    commonUse: ["일반 승용 H6", "비ISG"],
    sourceNote: "로케트 GB57820 — 표준 DIN74L(H6)",
    cautionNotes: ["ISG 차량 AGM 유지 여부 우선"],
  },
  {
    code: "CMF57412",
    normalizedCode: "DIN74L",
    brand: "SOLITE",
    productName: "쏠라이트 CMF57412",
    aliases: ["57412", "DIN74L"],
    family: "DIN",
    voltage: 12,
    capacityAh20Hr: 74,
    capacityAh5Hr: null,
    cca: 680,
    rc: null,
    weightKg: null,
    dimensionsMm: dims(278, 175, 190),
    terminalLayout: "L",
    terminalPolarity: "-+",
    terminalType: "DIN",
    commonUse: ["일반 승용 H6"],
    sourceNote: "쏠라이트 CMF57412 — DIN74L 표기",
    cautionNotes: ["로케트 57820과 표기만 다름 — CCA·중량은 제원표별 확인"],
  },

  // ── 상용 R타입 (로케트 표기, 상세 수치는 라벨·연식 우선) ──
  rocketGbStub("GB90R", "90R", ["90R", "CMF90R"], "R", "COMMERCIAL", {
    capacityAh20Hr: 90,
    cca: 820,
    dimensionsMm: dims(353),
    commonUse: ["포터2 구형", "상용 R"],
  }),
  rocketGbStub("GB100R", "100R", ["100R", "CMF100R", "GB100R"], "R", "COMMERCIAL", {
    capacityAh20Hr: 100,
    cca: null,
    dimensionsMm: dims(353),
    commonUse: ["포터2 2020년 이후", "상용 R"],
    cautionNotes: ["90R과 연식·트레이 구분", "AGM95L과 단순 대체 불가"],
  }),
  rocketGbStub("GB100R", "CMF100R", ["100R", "GB100R"], "R", "CMF", {
    capacityAh20Hr: 100,
    cca: 860,
    dimensionsMm: dims(353),
    commonUse: ["상용 R타입"],
  }),

  rocketGbStub("GB80L", "CMF80L", ["CMF80L", "80L"], "L", "CMF", {
    capacityAh20Hr: 80,
    cca: 780,
    dimensionsMm: dims(315),
    commonUse: ["일반 중대형", "스타리아 디젤 후보"],
    cautionNotes: ["AGM80L과 타입·충전계 다름"],
  }),
  rocketGbStub("GB80R", "AGM80R", ["AGM80R", "80R"], "R", "AGM", {
    capacityAh20Hr: 80,
    cca: 800,
    dimensionsMm: dims(315),
    terminalType: "AGM_DIN",
    commonUse: ["스타리아", "R단자 AGM"],
  }),

  // GB 계열 코드 스텁 (제원표 수치 보강 예정)
  ...[
    ["GB40L", "40L"],
    ["GB40R", "40R"],
    ["GB50L", "50L"],
    ["GB60R", "60R"],
    ["GB60AL", "60R"],
    ["GB90L", "90L"],
    ["GB95R", "AGM95R"],
    ["GB100L", "100L"],
    ["GB100BR", "100R"],
    ["GB54459", "54459"],
    ["GB55457", "55457"],
    ["GB56219", "DIN62L"],
    ["GB56318", "56318"],
    ["GB57219", "57219"],
    ["GB57220", "57220"],
    ["GB58014", "58014"],
    ["GB59042", "59042"],
    ["GB60044", "60044"],
    ["GB55066", "55066"],
    ["GB55065", "55065"],
    ["GB78-84", "78-84"],
    ["GB65-114", "65-114"],
  ].map(([code, norm]) => {
    const terminal: TerminalLayout = /R$/.test(code) || code.includes("R") ? "R" : "L";
    return rocketGbStub(code, norm, [code], terminal);
  }),

  // DELKOR / ATLASBX — 구조만 (제원 미확정)
  {
    code: "AGM80L",
    normalizedCode: "AGM80L",
    brand: "DELKOR",
    productName: "델코 AGM80",
    aliases: ["AGM80"],
    family: "AGM",
    voltage: 12,
    capacityAh20Hr: 80,
    cca: null,
    dimensionsMm: dims(315),
    terminalLayout: "L",
    terminalType: "AGM_DIN",
    sourceNote: "델코 — 차종별 순정·BMS 확인",
    cautionNotes: ["수입차·ISG — 등록 여부 확인"],
  },
  {
    code: "AGM80L",
    normalizedCode: "AGM80L",
    brand: "ATLASBX",
    productName: "아트라스BX AGM80",
    aliases: ["AGM80"],
    family: "AGM",
    voltage: 12,
    capacityAh20Hr: 80,
    cca: null,
    dimensionsMm: dims(315),
    terminalLayout: "L",
    terminalType: "AGM_DIN",
    sourceNote: "아트라스BX — 브랜드별 제원표 확인",
  },
];
