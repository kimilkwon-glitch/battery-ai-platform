export type TerminalLayout = "L" | "R" | null;

export type BatteryFamily = "AGM" | "CMF" | "DIN" | "GB" | "EV" | "EFB" | "MF" | "OTHER";

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
  summary: string;
  body: string;
  checkPoints: string[];
  relatedBatteryCodes?: string[];
  relatedGuideIds?: string[];
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
