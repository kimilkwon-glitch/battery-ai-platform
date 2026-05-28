export type TerminalLayout = "L" | "R" | "UNKNOWN";

export type BatteryBrand = "ROCKET" | "SOLITE" | "DELKOR" | "ATLASBX" | "UNKNOWN";

export type BatteryFamily =
  | "GB"
  | "CMF"
  | "DIN"
  | "AGM"
  | "EV_12V"
  | "EV"
  | "COMMERCIAL"
  | "OTHER";

export type TerminalPolarity = "-+" | "+-" | "UNKNOWN";

export type TerminalType = "JIS" | "DIN" | "AGM_DIN" | "OTHER" | "UNKNOWN";

export type BatteryDimensionsMm = {
  length: number;
  width: number;
  height: number;
  totalHeight?: number | null;
};

/** 브랜드별 실제 제원 (로케트·쏠라이트 제원표 출처) */
export type BatteryBrandSpec = {
  code: string;
  normalizedCode: string;
  brand: BatteryBrand;
  productName?: string;
  aliases: string[];
  family: BatteryFamily;
  voltage: number;
  capacityAh20Hr?: number | null;
  capacityAh5Hr?: number | null;
  cca?: number | null;
  rc?: number | null;
  weightKg?: number | null;
  dimensionsMm?: BatteryDimensionsMm | null;
  terminalLayout?: TerminalLayout;
  terminalPolarity?: TerminalPolarity;
  terminalType?: TerminalType;
  commonUse?: string[];
  sourceNote?: string;
  cautionNotes?: string[];
};

/** normalizedCode 기준 대표 요약 (브랜드 중립) */
export type NormalizedBatterySummary = {
  normalizedCode: string;
  family: BatteryFamily;
  voltage: number;
  capacityAh20Hr: number | null;
  capacityAh5Hr: number | null;
  cca: number | null;
  rc: number | null;
  weightKg: number | null;
  dimensionsMm: BatteryDimensionsMm | null;
  terminalLayout: TerminalLayout;
  terminalPolarity: TerminalPolarity;
  terminalType: TerminalType;
  seriesLabel: string | null;
  commonUse: string[];
  confusionSpecs: string[];
  expertMemo: string;
  brandVarianceNote: string;
};

/** @deprecated use BatteryFamily — kept for baseSpecs compat */
export type LegacyBatteryFamily = "AGM" | "CMF" | "DIN" | "GB" | "EV" | "EFB" | "MF" | "OTHER";

export type BaseBatterySpec = {
  code: string;
  aliases: string[];
  family: BatteryFamily;
  voltage: number;
  capacityAh20Hr: number | null;
  capacityAh5Hr: number | null;
  cca: number | null;
  rc: number | null;
  dimensionsMm: {
    length: number | null;
    width: number | null;
    height: number | null;
    totalHeight: number | null;
  };
  weightKg: number | null;
  terminalLayout: TerminalLayout;
  terminalPolarity: string | null;
  terminalType: string | null;
  commonUse: string[];
  notes: string[];
  /** 제원은 브랜드·제조 시기에 따라 달라질 수 있음 */
  brandVariancePossible?: boolean;
};

export type BatteryKnowledgeTopic = {
  id: string;
  title: string;
  hook: string;
  summary: string;
  keyPoints: string[];
  caution: string;
  body: string;
  checkPoints: string[];
  relatedSpecs?: string[];
  relatedBatteryCodes?: string[];
  relatedGuideIds?: string[];
  ctaType?: "vehicle" | "spec" | "photo" | "compare" | "guides";
};

export type UpgradeRule = {
  id: string;
  fromCode: string;
  toCode: string;
  feasibility: "possible" | "conditional" | "not_recommended";
  summary: string;
  conditions: string[];
  cautions: string[];
};

export type BrandNote = {
  id: string;
  displayName: string;
  positioning: string;
  checkReminder: string;
};

export type ContentGuideCta = {
  label: string;
  href: string;
};

export type ContentGuide = {
  id: string;
  title: string;
  hook: string;
  paragraphs: string[];
  checkPoints: string[];
  ctas: ContentGuideCta[];
  imageSlotPurpose: string;
  imageSlotCaption: string;
  relatedBatteryCodes?: string[];
  tags?: string[];
};

export type CompareDeepNote = {
  pairKey: string;
  headline: string;
  summary: string;
  bullets: string[];
  notInterchangeable?: boolean;
};
