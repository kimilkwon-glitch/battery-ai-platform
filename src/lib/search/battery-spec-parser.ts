import { getCanonicalBatteryCode } from "@/lib/battery-alias-map";
import { terminalFromCode } from "@/lib/batteryNormalize";

const SPEC_TOKENS = [
  "AGM105L",
  "AGM95R",
  "AGM95L",
  "AGM80R",
  "AGM80L",
  "AGM70L",
  "AGM60L",
  "115D31R",
  "115D31L",
  "DIN90L",
  "DIN80L",
  "DIN74L",
  "DIN62L",
  "DIN60L",
  "DIN50L",
  "CMF80L",
  "CMF60L",
  "100R",
  "90R",
] as const;

export type BatterySpecIntent = {
  hasSpec: boolean;
  specs: string[];
  primarySpec: string | null;
  terminalDirection: "L타입" | "R타입" | null;
};

function terminalFromSpec(spec: string): "L타입" | "R타입" | null {
  const canonical = getCanonicalBatteryCode(spec) || spec.replace(/\s+/g, "").toUpperCase();
  const side = terminalFromCode(canonical);
  if (side === "L") return "L타입";
  if (side === "R") return "R타입";
  if (/L$/i.test(canonical)) return "L타입";
  if (/R$/i.test(canonical)) return "R타입";
  return null;
}

function extractSpecsFromText(text: string): string[] {
  const upper = text.toUpperCase().replace(/\s+/g, "");
  const found: string[] = [];
  for (const token of SPEC_TOKENS) {
    if (upper.includes(token)) {
      found.push(token);
    }
  }
  const loose = text.match(
    /\b(AGM\d{2,3}[LR]|DIN\d{2}L|CMF\d{2}L|115D31[LR]|100R|90R)\b/gi,
  );
  if (loose) {
    for (const m of loose) {
      const t = m.toUpperCase();
      if (!found.includes(t)) found.push(t);
    }
  }
  return found;
}

export function parseBatterySpecIntent(normalizedQuery: string): BatterySpecIntent {
  const specs = extractSpecsFromText(normalizedQuery);
  const primarySpec = specs[0] ?? null;
  return {
    hasSpec: specs.length > 0,
    specs,
    primarySpec,
    terminalDirection: primarySpec ? terminalFromSpec(primarySpec) : null,
  };
}

export const SEARCH_SPEC_TOKENS = SPEC_TOKENS;
