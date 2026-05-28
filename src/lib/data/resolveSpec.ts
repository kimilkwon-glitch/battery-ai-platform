import legacyDbJson from "@/data/vehicle-battery-db.json";
import specMappingsJson from "@/data/batteries/specMappings.json";
import { getCanonicalBatteryCode, batteryAliasMap } from "@/lib/battery-alias-map";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { normalizeBatteryCode } from "@/lib/batteryNormalize";

type NormalizationRules = Record<string, string>;
type SpecMappingEntry = { standardSpec: string; aliases: string[]; note?: string };
type SpecMappingsRoot = Record<string, SpecMappingEntry>;

const dbRules = (legacyDbJson as { normalizationRules?: NormalizationRules }).normalizationRules ?? {};
const specMappings = specMappingsJson as SpecMappingsRoot;

function norm(s: string) {
  return s.trim().toUpperCase().replace(/\s+/g, "");
}

/** 제품코드·별칭 → 표준 규격 (기존 DB normalizationRules + alias map 우선) */
export function resolveSpec(input: string): string {
  if (!input?.trim) return "";
  const raw = input.trim();
  if (!raw) return "";

  const fromCanonical = getCanonicalBatteryCode(raw);
  if (fromCanonical) return fromCanonical;

  const key = norm(raw);
  if (dbRules[key]) return dbRules[key];
  if (dbRules[raw]) return dbRules[raw];

  for (const [alias, entry] of Object.entries(specMappings)) {
    if (norm(alias) === key) return entry.standardSpec;
    if (entry.aliases.some((a) => norm(a) === key)) return entry.standardSpec;
  }

  for (const [canonical, entry] of Object.entries(batteryAliasMap)) {
    if (entry.aliases.some((a) => norm(a) === key)) return canonical;
    const brandCodes = Object.values(entry.brandCodes).flat();
    if (brandCodes.some((c) => norm(c) === key)) return canonical;
  }

  return canonicalBatteryCode(raw) || normalizeBatteryCode(raw);
}

export function resolveSpecWithMeta(input: string) {
  const standard = resolveSpec(input);
  const mappingHit = Object.entries(specMappings).find(
    ([k, v]) => norm(k) === norm(input) || v.aliases.some((a) => norm(a) === norm(input)),
  );
  return {
    input,
    standardSpec: standard,
    note: mappingHit?.[1].note ?? "",
    fromLegacyRules: Boolean(dbRules[norm(input)]),
  };
}

export { dbRules as legacyNormalizationRules, specMappings };
