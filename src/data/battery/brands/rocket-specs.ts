import type { BatteryBrandSpec, BatteryFamily, TerminalLayout } from "../types";
import { dims, makeSpec } from "../spec-helpers";

const SRC = "사용자 제공 로케트 제원표 기준";

function rocketAgm(
  code: string,
  normalizedCode: string,
  aliases: string[],
  ah20: number,
  ah5: number,
  len: number,
  rc: number,
  cca: number,
  kg: number,
): BatteryBrandSpec {
  return makeSpec({
    code,
    normalizedCode,
    brand: "ROCKET",
    productName: code,
    aliases,
    family: "AGM",
    capacityAh20Hr: ah20,
    capacityAh5Hr: ah5,
    cca,
    rc,
    weightKg: kg,
    dimensionsMm: dims(len, 175, 169, 190),
    terminalLayout: "L",
    terminalType: "AGM_DIN",
    sourceNote: SRC,
  });
}

function rocketGbStub(
  code: string,
  normalizedCode: string,
  aliases: string[],
  terminal: TerminalLayout,
  family: BatteryFamily = "GB",
  partial?: Partial<BatteryBrandSpec>,
): BatteryBrandSpec {
  return makeSpec({
    code,
    normalizedCode,
    brand: "ROCKET",
    productName: code,
    aliases: [...aliases, code],
    family,
    capacityAh20Hr: null,
    cca: null,
    rc: null,
    terminalLayout: terminal,
    terminalType: "JIS",
    sourceNote: SRC,
    cautionNotes: ["제원표 미입력 항목은 null — 라벨·사진 확인"],
    exposeToCustomer: false,
    ...partial,
  });
}

export const ROCKET_SPECS: BatteryBrandSpec[] = [
  rocketAgm("AGM60", "AGM60L", ["AGM60L", "AGM L2", "LN2 AGM"], 60, 48, 242, 100, 640, 18),
  rocketAgm("AGM60L", "AGM60L", ["AGM60", "AGM L2"], 60, 48, 242, 100, 640, 18),
  rocketAgm("AGM70", "AGM70L", ["AGM70L", "AGM L3", "LN3 AGM"], 70, 56, 278, 120, 760, 21),
  rocketAgm("AGM70L", "AGM70L", ["AGM70", "AGM L3"], 70, 56, 278, 120, 760, 21),
  rocketAgm("AGM80", "AGM80L", ["AGM80L", "AGM L4", "LN4 AGM"], 80, 64, 315, 140, 800, 23.5),
  rocketAgm("AGM80L", "AGM80L", ["AGM80", "AGM L4"], 80, 64, 315, 140, 800, 23.5),
  rocketAgm("AGM95", "AGM95L", ["AGM95L", "AGM L5", "LN5 AGM"], 95, 74, 353, 160, 850, 27),
  rocketAgm("AGM95L", "AGM95L", ["AGM95", "AGM L5"], 95, 74, 353, 160, 850, 27),
  rocketAgm("AGM105", "AGM105L", ["AGM105L", "AGM L6", "LN6 AGM"], 105, 84, 394, 190, 950, 29.8),
  rocketAgm("AGM105L", "AGM105L", ["AGM105", "AGM L6"], 105, 84, 394, 190, 950, 29.8),

  makeSpec({
    code: "GB57820",
    normalizedCode: "DIN74L",
    brand: "ROCKET",
    productName: "로케트 GB57820",
    aliases: ["57820", "DIN74L", "DIN H6"],
    family: "DIN",
    capacityAh20Hr: 74,
    capacityAh5Hr: null,
    cca: 680,
    rc: null,
    weightKg: null,
    dimensionsMm: dims(278, 175, 190),
    terminalLayout: "L",
    terminalType: "DIN",
    sourceNote: SRC,
    cautionNotes: ["ISG 차량 AGM 유지 여부 우선"],
  }),

  rocketGbStub("GB90R", "90R", ["90R", "CMF90R"], "R", "COMMERCIAL", {
    capacityAh20Hr: 90,
    cca: 820,
    dimensionsMm: dims(353, 175, 169),
    exposeToCustomer: true,
    commonUse: ["포터2 구형"],
  }),
  rocketGbStub("GB100R", "100R", ["100R", "CMF100R", "GB100R"], "R", "COMMERCIAL", {
    capacityAh20Hr: 100,
    dimensionsMm: dims(353, 175, 169),
    exposeToCustomer: true,
    cautionNotes: ["90R과 연식·트레이 구분", "AGM95L과 단순 대체 불가"],
  }),
  rocketGbStub("GB80L", "80L", ["CMF80L", "80L"], "L", "CMF", {
    capacityAh20Hr: 80,
    cca: 780,
    dimensionsMm: dims(315, 175, 169),
    exposeToCustomer: true,
  }),
  rocketGbStub("GB80R", "80R", ["AGM80R"], "R", "AGM", {
    capacityAh20Hr: 80,
    cca: 800,
    dimensionsMm: dims(315, 175, 169),
    terminalType: "AGM_DIN",
    exposeToCustomer: false,
  }),

  ...[
    ["GB40L", "40L", "L"],
    ["GB40R", "40R", "R"],
    ["GB40AL", "40AL", "L"],
    ["GB50L", "50L", "L"],
    ["GB60R", "60R", "R"],
    ["GB60AL", "60L", "L"],
    ["GB90L", "90L", "L"],
    ["GB95R", "AGM95R", "R"],
    ["GB100L", "100L", "L"],
    ["GB100BR", "100R", "R"],
    ["GB54459", "DIN44L", "L"],
    ["GB55457", "DIN50L", "L"],
    ["GB56219", "DIN62L", "L"],
    ["GB56318", "DIN62L", "L"],
    ["GB57219", "DIN62L", "L"],
    ["GB57220", "DIN62L", "L"],
    ["GB58014", "DIN80L", "L"],
    ["GB59042", "DIN90L", "L"],
    ["GB60044", "DIN100L", "L"],
    ["GB55066", "DIN50L", "L"],
    ["GB55065", "DIN50L", "L"],
    ["GB78-84", "78-84", "L"],
    ["GB65-114", "65-114", "L"],
  ].map(([code, norm, t]) =>
    rocketGbStub(code, norm, [code], t as TerminalLayout, norm.startsWith("DIN") ? "DIN" : "GB"),
  ),
];
