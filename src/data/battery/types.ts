export type TerminalLayout = "L" | "R" | "UNKNOWN";

export type BatteryBrand = "ROCKET" | "SOLITE" | "DELKOR" | "ATLASBX" | "UNKNOWN";

export type BatteryFamily =
  | "GB"
  | "CMF"
  | "JIS"
  | "DIN"
  | "AGM"
  | "EV_12V"
  | "EV"
  | "COMMERCIAL"
  | "OTHER";

export type TerminalPolarity = "-+" | "+-" | "UNKNOWN";

export type TerminalType =
  | "SMALL"
  | "STD"
  | "JIS"
  | "DIN"
  | "AGM_DIN"
  | "OTHER"
  | "UNKNOWN";

export type BatteryDimensionsMm = {
  length: number;
  width: number;
  height: number;
  totalHeight?: number;
};

export type FieldConfidenceLevel =
  | "official"
  | "provided_screenshot"
  | "inferred_from_same_series"
  | "public_spec"
  | "unknown";

export type FieldConfidence = {
  terminalType?: FieldConfidenceLevel;
  holdDown?: FieldConfidenceLevel;
  weightKg?: FieldConfidenceLevel;
  rc?: FieldConfidenceLevel;
  cca?: FieldConfidenceLevel;
  capacityAh20Hr?: FieldConfidenceLevel;
};

/** 매칭 핵심 — 없으면 매칭 로직에서 해당 필드 미사용 */
export const SPEC_MATCHING_FIELDS = [
  "normalizedCode",
  "terminalLayout",
  "terminalPolarity",
  "terminalType",
  "dimensionsMm",
  "capacityAh20Hr",
  "cca",
] as const;

/** 참고용 — 없어도 매칭·페이지 동작 유지 */
export const SPEC_REFERENCE_FIELDS = [
  "rc",
  "weightKg",
  "holdDown",
  "commonUse",
  "sourceNote",
] as const;

/** 브랜드별 실제 제원 (4브랜드 제원표·스크린 출처) */
export type BatteryBrandSpec = {
  code: string;
  normalizedCode: string;
  brand: BatteryBrand;
  productName: string;
  aliases: string[];
  family: BatteryFamily;
  voltage: number;
  capacityAh20Hr: number | null;
  capacityAh5Hr?: number;
  cca: number | null;
  /** 참고 필드 — 미확정 시 생략 (null 금지) */
  rc?: number;
  dimensionsMm?: BatteryDimensionsMm;
  weightKg?: number;
  layoutRaw?: string;
  terminalLayout: TerminalLayout;
  terminalPolarity: TerminalPolarity;
  /** 미확정 시 생략 — 화면은 "확인 필요", 매칭 단독 확정에 사용 안 함 */
  terminalType?: TerminalType;
  holdDown?: string;
  commonUse?: string[];
  sourceNote: string;
  fieldConfidence?: FieldConfidence;
  missingFields?: string[];
  cautionNotes?: string[];
  /** false면 메인·검색 카드·대표 비교표에서 숨김 (DB·alias용) */
  exposeToCustomer: boolean;
};

/** normalizedCode 기준 대표 요약 (브랜드 중립) */
export type NormalizedBatterySummary = {
  normalizedCode: string;
  family: BatteryFamily;
  voltage: number;
  capacityAh20Hr: number | null;
  capacityAh5Hr: number | null;
  cca: number | null;
  rc?: number;
  weightKg?: number;
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
