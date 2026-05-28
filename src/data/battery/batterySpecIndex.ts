import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { resolveNormalizedCode } from "./batterySpecAliases";
import { BATTERY_SPECS_BY_BRAND } from "./batterySpecsByBrand";
import type {
  BatteryBrand,
  BatteryBrandSpec,
  NormalizedBatterySummary,
  TerminalLayout,
  TerminalType,
} from "./types";
import {
  formatDimensionsDisplay,
  formatTerminalDisplay,
  terminalTypeLabel,
} from "./spec-helpers";

const BRAND_ORDER: BatteryBrand[] = ["ROCKET", "DELKOR", "ATLASBX", "SOLITE"];

const SERIES_BY_NORM: Record<string, string> = {
  AGM60L: "L2",
  AGM70L: "L3",
  AGM80L: "L4",
  AGM95L: "L5",
  AGM105L: "L6",
  DIN74L: "DIN H6",
  DIN78L: "DIN H6 (78Ah)",
  DIN62L: "DIN H5",
};

const CONFUSION: Record<string, string[]> = {
  AGM60L: ["AGM70L", "EV 12V", "DIN74L"],
  AGM70L: ["AGM80L", "AGM60L", "DIN74L"],
  AGM80L: ["AGM95L", "80L", "DIN74L", "AGM70L"],
  AGM95L: ["AGM105L", "AGM80L"],
  AGM105L: ["AGM95L"],
  "100R": ["90R", "100L"],
  "90R": ["100R"],
  "80L": ["AGM80L", "CMF80L"],
  DIN74L: ["AGM80L", "57412", "DIN78L"],
  DIN78L: ["DIN74L", "57820", "GB57820"],
  "EV 12V": ["AGM60L"],
};

/** 메인·검색 카드용 짧은 첨언 (2줄 이내) */
export const HOME_CARD_COPY: Record<string, string> = {
  AGM60L: "소형·준중형 ISG 차량에서 자주 만나는 작은 AGM 규격입니다.",
  AGM70L: "중형 승용·ISG 차량에서 확인되는 AGM L3급 규격입니다.",
  AGM80L: "스탑앤고·스마트충전 차량에서 자주 보이는 중대형 AGM 규격입니다.",
  AGM95L: "대형 SUV·승합에서 확인되는 L5급 AGM 대용량 규격입니다.",
  AGM105L: "대형 세단·고급차급에서 확인되는 대용량 AGM 규격입니다.",
  "80L": "일반 충전계통 차량에 쓰이는 80Ah급 L타입 배터리입니다.",
  CMF80L: "일반 충전계통 차량에 쓰이는 80Ah급 L타입 배터리입니다.",
  "100R": "상용차에서 많이 쓰이는 R타입 대용량 일반 배터리입니다.",
  DIN74L: "DIN 74Ah 계열입니다. 숫자 표기명과 함께 쓰이는 경우가 있습니다.",
  DIN78L: "DIN 78Ah(57820) 계열입니다. 57412(74Ah)와 Ah·품번이 다를 수 있습니다.",
  "EV 12V": "전기차 보조 12V — 고전압 메인 배터리와 별도입니다.",
};

const EXPERT_MEMO: Record<string, string> = {
  AGM60L:
    "L2급 AGM입니다. 하이브리드 보조 12V와 혼동될 수 있어 차종·라벨을 함께 봅니다. 로케트 기준 CCA 640A이며, 델코·아트라스·쏠라이트는 CCA·RC·높이가 조금씩 다를 수 있습니다.",
  AGM70L: "L3급 AGM — ISG·중형 승용. 디젤·SUV는 AGM80L 후보가 있을 수 있습니다.",
  AGM80L:
    "L4급 AGM — ISG·스마트충전·디젤 SUV에서 자주 확인됩니다. 브랜드별 CCA·RC·치수 차이는 상세 비교표에서 확인하세요.",
  AGM95L: "L5급 AGM — 트레이·충전계·BMS 조건을 함께 확인하세요.",
  AGM105L: "L6급 AGM — 트레이·무게·충전계 여유가 필요합니다.",
  "100R": "R타입 상용 대용량 — 포터2 연식·90R·100L 구분이 중요합니다.",
  "90R": "R타입 90Ah급 상용 — 100R과 트레이·홀 패턴이 다를 수 있습니다.",
  "80L": "일반 CMF/GB 80Ah L타입 — AGM80L과 충전계·타입이 다릅니다.",
  DIN74L: "DIN H6(74Ah) — CMF57412 등 74Ah 품번. ISG는 AGM 우선 검토.",
  DIN78L: "로케트 GB57820(78Ah) — 57412와 Ah 체급이 다릅니다. CCA·RC는 제원표 기준, 중량은 확인 필요.",
  "EV 12V": "EV 보조 12V — 메인 고전압 팩과 별개입니다.",
};

export function normalizeSpecCode(raw: string): string {
  const c = canonicalBatteryCode(raw) || raw.trim().toUpperCase().replace(/\s+/g, " ");
  return resolveNormalizedCode(c);
}

const byNorm = new Map<string, BatteryBrandSpec[]>();

for (const s of BATTERY_SPECS_BY_BRAND) {
  const norm = s.normalizedCode;
  const list = byNorm.get(norm) ?? [];
  list.push(s);
  byNorm.set(norm, list);
}

/** 브랜드당 1행 — 고객 노출용 우선 */
export function getCustomerBrandSpecs(
  raw: string,
  options?: { includeHidden?: boolean },
): BatteryBrandSpec[] {
  const norm = normalizeSpecCode(raw);
  const specs = byNorm.get(norm) ?? [];
  const filtered = specs.filter(
    (s) => options?.includeHidden || s.exposeToCustomer !== false,
  );
  const byBrand = new Map<BatteryBrand, BatteryBrandSpec>();
  for (const s of filtered) {
    const prev = byBrand.get(s.brand);
    if (!prev || (s.exposeToCustomer && !prev.exposeToCustomer)) {
      byBrand.set(s.brand, s);
    }
  }
  return BRAND_ORDER.map((b) => byBrand.get(b)).filter((s): s is BatteryBrandSpec => !!s);
}

/** @deprecated — getCustomerBrandSpecs 사용 */
export function getBrandSpecsForNormalizedCode(raw: string): BatteryBrandSpec[] {
  return getCustomerBrandSpecs(raw);
}

export function getBrandSpecsByBrand(raw: string, brand: BatteryBrand): BatteryBrandSpec[] {
  return getCustomerBrandSpecs(raw, { includeHidden: true }).filter((s) => s.brand === brand);
}

export function getPrimaryBrandSpec(raw: string): BatteryBrandSpec | null {
  const specs = getCustomerBrandSpecs(raw, { includeHidden: true });
  if (!specs.length) return null;
  return specs.find((s) => s.brand === "ROCKET") ?? specs[0]!;
}

function pickTerminal(specs: BatteryBrandSpec[]): TerminalLayout {
  const t = specs.find((s) => s.terminalLayout && s.terminalLayout !== "UNKNOWN")?.terminalLayout;
  return t ?? "UNKNOWN";
}

function pickTerminalType(specs: BatteryBrandSpec[]): TerminalType {
  const rocket = specs.find((s) => s.brand === "ROCKET");
  const t =
    rocket?.terminalType ??
    specs.find((s) => s.terminalType != null && s.terminalType !== "UNKNOWN")?.terminalType;
  return t ?? "UNKNOWN";
}

function maxCca(specs: BatteryBrandSpec[]): number | null {
  const vals = specs.map((s) => s.cca).filter((v): v is number => v != null);
  return vals.length ? Math.max(...vals) : null;
}

/** 참고 필드 — 매칭에 사용하지 않음 */
function pickRc(specs: BatteryBrandSpec[]): number | undefined {
  const rocket = specs.find((s) => s.brand === "ROCKET");
  if (rocket?.rc != null) return rocket.rc;
  return specs.find((s) => s.rc != null)?.rc;
}

function pickWeightKg(specs: BatteryBrandSpec[]): number | undefined {
  const withWeight = specs.filter(
    (s) => s.weightKg != null && !s.missingFields?.includes("weightKg"),
  );
  const rocket = withWeight.find((s) => s.brand === "ROCKET");
  return rocket?.weightKg ?? withWeight[0]?.weightKg;
}

export function getNormalizedBatterySummary(raw: string): NormalizedBatterySummary | null {
  const normalizedCode = normalizeSpecCode(raw);
  const specs = getCustomerBrandSpecs(normalizedCode, { includeHidden: true });
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
    rc: pickRc(specs),
    weightKg: pickWeightKg(specs),
    dimensionsMm: rocket?.dimensionsMm ?? primary.dimensionsMm ?? null,
    terminalLayout: pickTerminal(specs),
    terminalPolarity: rocket?.terminalPolarity ?? primary.terminalPolarity ?? "UNKNOWN",
    terminalType: pickTerminalType(specs),
    seriesLabel: SERIES_BY_NORM[normalizedCode] ?? null,
    commonUse: [...new Set(specs.flatMap((s) => s.commonUse ?? []))].slice(0, 4),
    confusionSpecs: CONFUSION[normalizedCode] ?? [],
    expertMemo:
      EXPERT_MEMO[normalizedCode] ??
      `${normalizedCode} 규격입니다. 로케트·델코·아트라스BX·쏠라이트별 CCA·RC·치수가 다를 수 있어 라벨·차종 기준 확인이 필요합니다.`,
    brandVarianceNote:
      specs.length > 1
        ? "같은 대표 규격이라도 로케트·델코·아트라스BX·쏠라이트별 CCA·RC·높이·표기명이 조금씩 다를 수 있습니다. 장착 기준은 브랜드명보다 규격·크기·단자·차량 조건입니다."
        : "제조 시기·브랜드에 따라 수치 차이가 있을 수 있습니다.",
  };
}

export function formatDimensions(d: NormalizedBatterySummary["dimensionsMm"]): string | null {
  const s = formatDimensionsDisplay(d ?? undefined);
  return s ?? null;
}

export function terminalLayoutLabel(layout: TerminalLayout): string {
  if (layout === "L") return "L타입";
  if (layout === "R") return "R타입";
  return "확인 필요";
}

export { formatTerminalDisplay } from "./spec-helpers";

/** 메인·인기 카드 */
export function getHomeCardCopy(raw: string): string | null {
  const norm = normalizeSpecCode(raw);
  return HOME_CARD_COPY[norm] ?? HOME_CARD_COPY[raw] ?? null;
}

/** 검색·추천 카드 */
export function getSpecCardCopy(raw: string): { primary: string; secondary?: string } | null {
  const norm = normalizeSpecCode(raw);
  const home = getHomeCardCopy(raw) ?? getHomeCardCopy(norm);
  const summary = getNormalizedBatterySummary(norm);
  if (!summary && !home) return null;

  if (home) {
    return {
      primary: home,
      secondary: summary
        ? `${summary.capacityAh20Hr ?? "—"}Ah급 · 브랜드별 CCA·크기 차이는 상세에서 확인`
        : undefined,
    };
  }

  const t = terminalLayoutLabel(summary!.terminalLayout);
  if (summary!.family === "AGM") {
    return {
      primary: `${summary!.capacityAh20Hr ?? ""}Ah급 AGM · ${t}. 브랜드별 CCA 차이는 상세 페이지에서 확인할 수 있습니다.`,
      secondary: summary!.expertMemo,
    };
  }
  if (summary!.family === "COMMERCIAL" || norm === "100R" || norm === "90R") {
    return {
      primary: `${t} 상용·대용량 계열입니다. 연식·트레이 확인이 중요합니다.`,
      secondary: "AGM L타입과 단순 대체 대상이 아닙니다.",
    };
  }
  if (summary!.family === "DIN") {
    return {
      primary: `DIN ${summary!.capacityAh20Hr ?? ""}Ah급 ${t}. 숫자 품번(57412·57820 등)과 함께 쓰이는 경우가 있습니다.`,
      secondary: "브랜드별 제원은 상세 비교표에서 확인",
    };
  }
  if (summary!.family === "CMF" || summary!.family === "GB" || summary!.family === "JIS") {
    return {
      primary: `일반 ${summary!.capacityAh20Hr ?? ""}Ah급 ${t} 배터리입니다. AGM 차량에는 단순 대체하지 않는 것이 안전합니다.`,
    };
  }
  return { primary: summary!.expertMemo };
}

export function hasBrandSpecData(raw: string): boolean {
  return getCustomerBrandSpecs(raw, { includeHidden: true }).length > 0;
}

export function listHiddenSpecCodes(): string[] {
  return BATTERY_SPECS_BY_BRAND.filter((s) => s.exposeToCustomer === false).map(
    (s) => `${s.brand}:${s.code}`,
  );
}
