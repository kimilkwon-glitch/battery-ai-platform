import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { BATTERY_SPECS_BY_BRAND } from "./batterySpecsByBrand";
import type {
  BatteryBrand,
  BatteryBrandSpec,
  NormalizedBatterySummary,
  TerminalLayout,
} from "./types";

const SERIES_BY_NORM: Record<string, string> = {
  AGM60L: "L2",
  AGM70L: "L3",
  AGM80L: "L4",
  AGM95L: "L5",
  AGM105L: "L6",
  DIN74L: "DIN H6",
  DIN62L: "DIN H5",
};

const CONFUSION: Record<string, string[]> = {
  AGM60L: ["AGM70L", "EV 12V", "DIN74L"],
  AGM70L: ["AGM80L", "AGM60L", "DIN74L"],
  AGM80L: ["AGM95L", "CMF80L", "DIN74L", "AGM70L"],
  AGM95L: ["AGM105L", "100R", "AGM95R"],
  AGM105L: ["AGM95L"],
  "100R": ["90R", "AGM95L", "CMF100R"],
  "90R": ["100R", "CMF90R"],
  CMF80L: ["AGM80L", "80L", "CMF90L"],
  DIN74L: ["AGM80L", "CMF57412", "GB57820"],
  "EV 12V": ["AGM60L"],
};

const EXPERT_MEMO: Record<string, string> = {
  AGM60L:
    "L2급 AGM 규격입니다. 하이브리드·보조 12V와 혼동되는 경우가 있어, 차종·연료·현재 장착 라벨을 함께 보는 것이 안전합니다. 로케트 AGM60 기준 CCA 640A이며, 브랜드별 CCA·중량은 조금씩 다를 수 있습니다.",
  AGM70L:
    "L3급 AGM으로 ISG·중형 승용에서 자주 확인됩니다. 디젤·SUV는 AGM80L 후보가 있을 수 있어 트레이·연료를 함께 봅니다.",
  AGM80L:
    "L4급 AGM 규격으로, ISG·스마트충전·일부 디젤 SUV에서 자주 확인됩니다. 로케트 AGM80 기준 CCA 800A이며, 브랜드에 따라 CCA·표기명이 조금 달라질 수 있습니다. 같은 L4급이라도 트레이·고정쇠 여유를 함께 보는 것이 안전합니다.",
  AGM95L:
    "L5급 AGM 대형 규격입니다. 승합·대형 SUV·ISG에서 확인되며, 100R·상용 R타입과 단순 대체 관계가 아닙니다.",
  AGM105L: "L6급 AGM — 대형 SUV·승합. 트레이·무게·충전계 여유가 필요합니다.",
  "100R":
    "R타입 일반·상용 대용량 계열입니다. 포터2 등에서 연식별로 90R과 구분이 필요하며, AGM95L과는 단자 방향·배터리 타입이 달라 단순 대체로 보지 않습니다.",
  "90R": "R타입 상용 90Ah급 — 포터2 구형·연식 확인이 중요합니다. 100R과 크기가 비슷해도 트레이·홀이 다를 수 있습니다.",
  CMF80L:
    "일반 CMF 80Ah L타입입니다. AGM80L과 표기가 비슷해도 타입·충전계가 다르며, ISG 차량은 AGM 유지 여부를 먼저 확인합니다.",
  DIN74L:
    "DIN H6(74Ah급) 일반 계열입니다. 로케트 GB57820·쏠라이트 CMF57412가 같은 표준 규격으로 연결되는 경우가 많습니다. ISG 차량은 AGM 검토가 우선입니다.",
  "EV 12V":
    "전기차·PHEV 보조 12V 계열입니다. 고전압 메인 팩과 별개이며, AGM60L과 혼동되지 않도록 차종별 위치·라벨을 확인합니다.",
};

export function normalizeSpecCode(raw: string): string {
  const c = canonicalBatteryCode(raw) || raw.trim().toUpperCase().replace(/\s+/g, " ");
  const aliasMap: Record<string, string> = {
    AGM60: "AGM60L",
    AGM70: "AGM70L",
    AGM80: "AGM80L",
    AGM95: "AGM95L",
    AGM105: "AGM105L",
    "AGM L2": "AGM60L",
    "AGM L3": "AGM70L",
    "AGM L4": "AGM80L",
    "AGM L5": "AGM95L",
    "AGM L6": "AGM105L",
    GB57820: "DIN74L",
    GB100R: "100R",
    GB90R: "90R",
    CMF57412: "DIN74L",
    CMF100R: "100R",
    CMF90R: "90R",
    "57820": "DIN74L",
    "57412": "DIN74L",
  };
  return aliasMap[c] ?? c;
}

const byNorm = new Map<string, BatteryBrandSpec[]>();
const byCode = new Map<string, BatteryBrandSpec>();

for (const s of BATTERY_SPECS_BY_BRAND) {
  const norm = s.normalizedCode;
  const list = byNorm.get(norm) ?? [];
  list.push(s);
  byNorm.set(norm, list);
  byCode.set(s.code.toUpperCase(), s);
  for (const a of s.aliases) byCode.set(a.toUpperCase(), s);
}

export function getBrandSpecsForNormalizedCode(raw: string): BatteryBrandSpec[] {
  const norm = normalizeSpecCode(raw);
  return byNorm.get(norm) ?? [];
}

export function getBrandSpecsByBrand(raw: string, brand: BatteryBrand): BatteryBrandSpec[] {
  return getBrandSpecsForNormalizedCode(raw).filter((s) => s.brand === brand);
}

/** 대표 제원 — 로케트 우선, 없으면 첫 브랜드 */
export function getPrimaryBrandSpec(raw: string): BatteryBrandSpec | null {
  const specs = getBrandSpecsForNormalizedCode(raw);
  if (!specs.length) return null;
  return specs.find((s) => s.brand === "ROCKET") ?? specs[0]!;
}

function pickTerminal(specs: BatteryBrandSpec[]): TerminalLayout {
  const t = specs.find((s) => s.terminalLayout && s.terminalLayout !== "UNKNOWN")?.terminalLayout;
  return t ?? "UNKNOWN";
}

function maxCca(specs: BatteryBrandSpec[]): number | null {
  const vals = specs.map((s) => s.cca).filter((v): v is number => v != null);
  return vals.length ? Math.max(...vals) : null;
}

export function getNormalizedBatterySummary(raw: string): NormalizedBatterySummary | null {
  const normalizedCode = normalizeSpecCode(raw);
  const specs = getBrandSpecsForNormalizedCode(normalizedCode);
  if (!specs.length) return null;

  const primary = getPrimaryBrandSpec(normalizedCode)!;
  const rocket = specs.find((s) => s.brand === "ROCKET");

  return {
    normalizedCode,
    family: primary.family,
    voltage: primary.voltage,
    capacityAh20Hr: rocket?.capacityAh20Hr ?? primary.capacityAh20Hr ?? null,
    capacityAh5Hr: rocket?.capacityAh5Hr ?? primary.capacityAh5Hr ?? null,
    cca: rocket?.cca ?? maxCca(specs),
    rc: rocket?.rc ?? specs.find((s) => s.rc != null)?.rc ?? null,
    weightKg: rocket?.weightKg ?? specs.find((s) => s.weightKg != null)?.weightKg ?? null,
    dimensionsMm: rocket?.dimensionsMm ?? primary.dimensionsMm ?? null,
    terminalLayout: pickTerminal(specs),
    terminalPolarity: rocket?.terminalPolarity ?? primary.terminalPolarity ?? "UNKNOWN",
    terminalType: rocket?.terminalType ?? primary.terminalType ?? "UNKNOWN",
    seriesLabel: SERIES_BY_NORM[normalizedCode] ?? null,
    commonUse: [...new Set(specs.flatMap((s) => s.commonUse ?? []))].slice(0, 4),
    confusionSpecs: CONFUSION[normalizedCode] ?? [],
    expertMemo:
      EXPERT_MEMO[normalizedCode] ??
      `${normalizedCode} 규격입니다. 브랜드별 CCA·중량·표기명은 조금씩 다를 수 있어 라벨·차종 기준 확인이 필요합니다.`,
    brandVarianceNote:
      specs.length > 1
        ? "같은 규격이라도 로케트·쏠라이트 등 브랜드별 CCA·RC·중량·표기명이 조금씩 다를 수 있습니다."
        : "제조 시기·브랜드에 따라 수치 차이가 있을 수 있습니다.",
  };
}

export function formatDimensions(d: NormalizedBatterySummary["dimensionsMm"]): string | null {
  if (!d) return null;
  const th = d.totalHeight ? ` (총 ${d.totalHeight})` : "";
  return `${d.length}×${d.width}×${d.height}mm${th}`;
}

export function terminalLayoutLabel(layout: TerminalLayout): string {
  if (layout === "L") return "L타입";
  if (layout === "R") return "R타입";
  return "확인 필요";
}

/** 검색·카드용 한 줄 + 보조 줄 */
export function getSpecCardCopy(raw: string): { primary: string; secondary?: string } | null {
  const norm = normalizeSpecCode(raw);
  const summary = getNormalizedBatterySummary(norm);
  if (!summary) return null;

  const t = terminalLayoutLabel(summary.terminalLayout);
  const series = summary.seriesLabel ? `${summary.seriesLabel}급 ` : "";

  if (summary.family === "AGM") {
    return {
      primary: `${series}AGM 규격입니다. ${summary.capacityAh20Hr ?? ""}Ah·${t} — ISG·디젤 SUV에서 자주 확인되며, 브랜드별 CCA 차이가 있을 수 있습니다.`,
      secondary: summary.expertMemo,
    };
  }
  if (summary.family === "COMMERCIAL" || norm === "100R" || norm === "90R") {
    return {
      primary: `${t} 대용량 ${summary.family === "COMMERCIAL" ? "상용" : ""} 계열입니다. 포터 계열은 연식·트레이 확인이 중요합니다.`,
      secondary: "AGM L타입과 단순 대체 대상이 아닙니다.",
    };
  }
  if (summary.family === "CMF" || summary.family === "GB") {
    return {
      primary: `일반 ${summary.family === "CMF" ? "CMF" : "GB"} ${summary.capacityAh20Hr ?? ""}Ah급 ${t} 규격입니다. AGM 차량에는 단순 대체하지 않는 것이 안전합니다.`,
    };
  }
  if (summary.family === "DIN") {
    return {
      primary: `DIN ${summary.capacityAh20Hr ?? ""}Ah급 ${t} — 57820·57412 등 표기가 다를 수 있습니다.`,
      secondary: "ISG 차량은 AGM 유지 여부를 먼저 확인합니다.",
    };
  }
  if (summary.family === "EV_12V") {
    return {
      primary: "전기차 보조 12V 계열입니다. 고전압 메인 배터리와 별도로 봐야 합니다.",
    };
  }
  return { primary: summary.expertMemo };
}

export function hasBrandSpecData(raw: string): boolean {
  return getBrandSpecsForNormalizedCode(raw).length > 0;
}
