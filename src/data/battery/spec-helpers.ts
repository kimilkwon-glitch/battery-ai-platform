import type {
  BatteryBrand,
  BatteryBrandSpec,
  BatteryDimensionsMm,
  BatteryFamily,
  TerminalLayout,
  TerminalPolarity,
  TerminalType,
} from "./types";

export function dims(
  length: number,
  width: number,
  height: number,
  totalHeight?: number | null,
): BatteryDimensionsMm {
  return { length, width, height, totalHeight: totalHeight ?? null };
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
};

/** 브랜드별 제원 레코드 생성 — 불확실한 값은 호출부에서 null */
export function makeSpec(input: SpecInput): BatteryBrandSpec {
  const layout = input.terminalLayout ?? "UNKNOWN";
  return {
    ...input,
    aliases: input.aliases ?? [],
    voltage: input.voltage ?? 12,
    terminalLayout: layout,
    terminalPolarity: input.terminalPolarity ?? polarityForLayout(layout),
    exposeToCustomer: input.exposeToCustomer ?? true,
    cautionNotes: input.cautionNotes,
  };
}

export const BRAND_LABEL: Record<BatteryBrand, string> = {
  ROCKET: "로케트",
  SOLITE: "쏠라이트",
  DELKOR: "델코",
  ATLASBX: "아트라스BX",
  UNKNOWN: "기타",
};

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
