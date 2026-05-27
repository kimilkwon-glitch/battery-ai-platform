import { normalizeQuery } from "@/lib/search/normalize-query";
import { parseBatterySpecIntent, type BatterySpecIntent } from "@/lib/search/battery-spec-parser";
import { parseVehicleIntent, type VehicleIntent } from "@/lib/search/parse-vehicle-intent";
import {
  detectQueryIntentFlags,
  resolveSearchIntentLabel,
  type QueryIntentFlags,
} from "@/lib/search/search-intent";

export type SymptomIntent = {
  hasSymptom: boolean;
  symptoms: string[];
  primarySymptom: string | null;
};

export type PurposeIntent = {
  hasPurpose: boolean;
  purposes: string[];
  primaryPurpose: string | null;
};

export type QueryPipelineIntent = {
  rawQuery: string;
  normalizedQuery: string;
  displayQuery: string;
  vehicle: VehicleIntent;
  batterySpec: BatterySpecIntent;
  symptom: SymptomIntent;
  purpose: PurposeIntent;
  flags: QueryIntentFlags;
  intentLabel: string;
};

const SYMPTOM_PATTERNS: [RegExp, string][] = [
  [/완전\s*방전|완전방전/i, "완전방전"],
  [/시동\s*지연|시동지연/i, "시동지연"],
  [/시동\s*안\s*걸림/i, "시동 안 걸림"],
  [/12\s*v\s*방전/i, "12V 방전"],
  [/블랙박스|블박/i, "블랙박스"],
  [/장기\s*주차/i, "장기주차"],
  [/겨울철\s*시동/i, "겨울철 시동 불량"],
  [/경고등/i, "경고등"],
  [/전압/i, "전압"],
  [/방전/i, "방전"],
];

const PURPOSE_PATTERNS: [RegExp, string][] = [
  [/가격\s*비교/i, "가격 비교"],
  [/업그레이드/i, "업그레이드"],
  [/검토/i, "검토"],
  [/단자\s*방향|단자방향/i, "단자방향"],
  [/호환/i, "호환"],
  [/\bvs\b/i, "vs"],
  [/차이/i, "차이"],
  [/비교/i, "비교"],
  [/대신/i, "대신"],
  [/순정/i, "순정"],
  [/교체/i, "교체"],
  [/문의/i, "문의"],
  [/사진/i, "사진"],
  [/주문/i, "주문"],
  [/배송/i, "배송"],
  [/매장/i, "매장"],
  [/출장/i, "출장"],
  [/플러스|마이너스|LR/i, "단자방향"],
];

export function parseSymptomIntent(normalizedQuery: string): SymptomIntent {
  const symptoms: string[] = [];
  for (const [re, label] of SYMPTOM_PATTERNS) {
    if (re.test(normalizedQuery) && !symptoms.includes(label)) {
      symptoms.push(label);
    }
  }
  return {
    hasSymptom: symptoms.length > 0,
    symptoms,
    primarySymptom: symptoms[0] ?? null,
  };
}

export function parsePurposeIntent(normalizedQuery: string): PurposeIntent {
  const purposes: string[] = [];
  for (const [re, label] of PURPOSE_PATTERNS) {
    if (re.test(normalizedQuery) && !purposes.includes(label)) {
      purposes.push(label);
    }
  }
  return {
    hasPurpose: purposes.length > 0,
    purposes,
    primaryPurpose: purposes[0] ?? null,
  };
}

export function buildSearchIntent(rawQuery: string): QueryPipelineIntent {
  const { rawQuery: raw, normalizedQuery, displayQuery } = normalizeQuery(rawQuery);
  const vehicle = parseVehicleIntent(normalizedQuery);
  const batterySpec = parseBatterySpecIntent(normalizedQuery);
  const symptom = parseSymptomIntent(normalizedQuery);
  const purpose = parsePurposeIntent(normalizedQuery);
  const flags = detectQueryIntentFlags(normalizedQuery);
  const intentLabel = resolveSearchIntentLabel(normalizedQuery, {
    hasVehicle: vehicle.hasVehicle,
    hasAlias: vehicle.hasVehicle,
  });

  return {
    rawQuery: raw,
    normalizedQuery,
    displayQuery,
    vehicle,
    batterySpec,
    symptom,
    purpose,
    flags,
    intentLabel,
  };
}
