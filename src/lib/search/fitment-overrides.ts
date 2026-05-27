import { normalizeBatteryCode } from "@/lib/batteryNormalize";
import {
  isPorter2Query,
  parseVehicleYearHint,
  type VehicleYearEra,
} from "@/lib/search/parse-vehicle-year";

export type FitmentOverrideResult = {
  specificity: number;
  displayName: string;
  assetId: string;
  recommendedSpecs: string[];
  fieldLabel: string;
  note: string;
  confidenceLabel: string;
  yearChipId?: string;
};

type FitmentOverrideRule = {
  yearEra: VehicleYearEra | "any";
  specificity: number;
  displayName: string;
  assetId: string;
  recommendedSpecs: string[];
  fieldLabel: string;
  note: string;
  confidenceLabel: string;
  yearChipId?: string;
};

const PORTER2_NOTE =
  "포터2는 2020년 전후로 90R/100R 확인이 갈릴 수 있어 연식 확인이 필요합니다.";
const PORTER2_UNTIL_NOTE = "2020년 이후 차량은 100R 기준으로 확인될 수 있습니다.";

const PORTER2_OVERRIDE_RULES: FitmentOverrideRule[] = [
  {
    yearEra: "from2020",
    specificity: 120,
    displayName: "현대 포터2 2020년형 이후",
    assetId: "porter2-new",
    recommendedSpecs: ["100R"],
    fieldLabel: "추천 규격",
    note: PORTER2_NOTE,
    confidenceLabel: "연식 기준",
    yearChipId: "from2020",
  },
  {
    yearEra: "until2019",
    specificity: 115,
    displayName: "현대 포터2 2020년 이전",
    assetId: "porter2-old",
    recommendedSpecs: ["90R"],
    fieldLabel: "추천 규격",
    note: PORTER2_UNTIL_NOTE,
    confidenceLabel: "연식 기준",
    yearChipId: "to2019",
  },
  {
    yearEra: "any",
    specificity: 60,
    displayName: "현대 포터2",
    assetId: "porter2-new",
    recommendedSpecs: ["90R", "100R"],
    fieldLabel: "대표 확인 후보",
    note: "2020년 전후 연식에 따라 90R/100R이 달라질 수 있습니다.",
    confidenceLabel: "연식 확인 필요",
  },
];

function isPorter2Context(
  query: string,
  model: string | null,
  canonicalKey: string | null,
): boolean {
  return (
    isPorter2Query(query) ||
    model === "포터2" ||
    Boolean(canonicalKey?.includes("porter2"))
  );
}

/**
 * 연식/연료/세대가 구체적인 fitment override (DB 기본값보다 우선, exact spec 다음)
 */
export function resolveFitmentOverride(options: {
  normalizedQuery: string;
  model: string | null;
  canonicalKey: string | null;
  year?: number | null;
}): FitmentOverrideResult | null {
  const q = options.normalizedQuery.replace(/\s*배터리\s*$/i, "").trim();
  if (!isPorter2Context(q, options.model, options.canonicalKey)) return null;

  const yearHint = parseVehicleYearHint(q);
  const era = yearHint.era;

  let best: FitmentOverrideRule | null = null;
  for (const rule of PORTER2_OVERRIDE_RULES) {
    if (rule.yearEra !== "any" && rule.yearEra !== era) continue;
    if (rule.yearEra === "any" && era != null) continue;
    if (!best || rule.specificity > best.specificity) best = rule;
  }

  if (!best) {
    best = PORTER2_OVERRIDE_RULES.find((r) => r.yearEra === "any") ?? null;
  }
  if (!best) return null;

  return {
    specificity: best.specificity,
    displayName: best.displayName,
    assetId: best.assetId,
    recommendedSpecs: best.recommendedSpecs.map((c) => normalizeBatteryCode(c)).filter(Boolean),
    fieldLabel: best.fieldLabel,
    note: best.note,
    confidenceLabel: best.confidenceLabel,
    yearChipId: best.yearChipId,
  };
}
