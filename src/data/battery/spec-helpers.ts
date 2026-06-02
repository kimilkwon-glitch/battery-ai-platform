import type {
  BatteryBrand,
  BatteryBrandSpec,
  BatteryDimensionsMm,
  FieldConfidenceLevel,
  TerminalLayout,
  TerminalPolarity,
  TerminalType,
} from "./types";

export function dims(
  length: number,
  width: number,
  height: number,
  totalHeight?: number,
): BatteryDimensionsMm {
  return { length, width, height, ...(totalHeight != null ? { totalHeight } : {}) };
}

export function polarityForLayout(layout: TerminalLayout): TerminalPolarity {
  if (layout === "R") return "+-";
  if (layout === "L") return "-+";
  return "UNKNOWN";
}

export type SpecInput = Omit<
  BatteryBrandSpec,
  "voltage" | "aliases" | "exposeToCustomer" | "terminalPolarity"
> & {
  aliases?: string[];
  exposeToCustomer?: boolean;
  voltage?: number;
  terminalPolarity?: TerminalPolarity;
  capacityAh5Hr?: number | null;
  rc?: number | null;
  weightKg?: number | null;
  holdDown?: string | null;
  terminalType?: TerminalType | null;
};

function omitNullishOptional<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

/** 브랜드별 제원 레코드 — null은 저장하지 않고 optional 생략 */
export function makeSpec(input: SpecInput): BatteryBrandSpec {
  const layout = input.terminalLayout ?? "UNKNOWN";
  const base: BatteryBrandSpec = {
    code: input.code,
    normalizedCode: input.normalizedCode,
    brand: input.brand,
    productName: input.productName,
    aliases: input.aliases ?? [],
    family: input.family,
    voltage: input.voltage ?? 12,
    capacityAh20Hr: input.capacityAh20Hr,
    cca: input.cca,
    terminalLayout: layout,
    terminalPolarity: input.terminalPolarity ?? polarityForLayout(layout),
    sourceNote: input.sourceNote,
    exposeToCustomer: input.exposeToCustomer ?? true,
    cautionNotes: input.cautionNotes,
    fieldConfidence: input.fieldConfidence,
    missingFields: input.missingFields ? [...input.missingFields] : undefined,
    commonUse: input.commonUse,
    layoutRaw: input.layoutRaw ?? undefined,
  };

  const optional = omitNullishOptional({
    capacityAh5Hr: input.capacityAh5Hr,
    rc: input.rc,
    weightKg: input.weightKg,
    dimensionsMm: input.dimensionsMm,
    terminalType: input.terminalType === "UNKNOWN" ? undefined : input.terminalType,
    holdDown: input.holdDown,
  });

  return { ...base, ...optional };
}

export const BRAND_LABEL: Record<BatteryBrand, string> = {
  ROCKET: "로케트",
  SOLITE: "쏠라이트",
  DELKOR: "델코",
  ATLASBX: "아트라스BX",
  UNKNOWN: "기타",
};

export function formatSpecValue(
  value: string | number | null | undefined,
  unit = "",
): string {
  if (value === undefined || value === null || value === "") return "확인 필요";
  return `${value}${unit}`;
}

export function hasSpecValue(value: string | number | null | undefined): boolean {
  return value !== undefined && value !== null && value !== "";
}

export function isFieldListedMissing(spec: BatteryBrandSpec, field: string): boolean {
  return spec.missingFields?.includes(field) ?? false;
}

export function confidenceNote(level: FieldConfidenceLevel | undefined): string | null {
  if (level === "inferred_from_same_series") return "동일 계열 정규화";
  if (level === "public_spec") return "공개 제원";
  if (level === "provided_screenshot") return "제공 자료";
  return null;
}

export function terminalTypeLabel(t: TerminalType | undefined): string {
  switch (t) {
    case "SMALL":
      return "소형단자";
    case "STD":
      return "일반단자";
    case "JIS":
      return "JIS형";
    case "DIN":
      return "DIN형";
    case "AGM_DIN":
      return "AGM DIN형";
    default:
      return "확인 필요";
  }
}

/** L×W×H mm — 고객 노출용 (총 높이 괄호 표기 없음) */
export function formatDimensionsDisplay(d: BatteryDimensionsMm | undefined): string | undefined {
  if (!d) return undefined;
  return `${d.length} × ${d.width} × ${d.height} mm`;
}

/** 비교표 — 참고 필드 열 표시 여부 */
export function specsShowWeightColumn(specs: BatteryBrandSpec[]): boolean {
  return specs.some((s) => s.weightKg != null && !isFieldListedMissing(s, "weightKg"));
}

export function specsShowRcColumn(specs: BatteryBrandSpec[]): boolean {
  return specs.some((s) => s.rc != null);
}

export function formatTerminalDisplay(spec: BatteryBrandSpec): string {
  const parts = [terminalLayoutLabel(spec.terminalLayout)];
  const tt = terminalTypeLabel(spec.terminalType);
  if (tt !== "확인 필요") {
    const note = confidenceNote(spec.fieldConfidence?.terminalType);
    parts.push(note ? `${tt} (${note})` : tt);
  }
  return parts.join(" · ");
}

function terminalLayoutLabel(layout: TerminalLayout): string {
  if (layout === "L") return "L타입";
  if (layout === "R") return "R타입";
  return "확인 필요";
}
