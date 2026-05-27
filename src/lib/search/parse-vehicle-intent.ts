import { normalizeQuery } from "@/lib/search/normalize-query";
import { isPorter2Query, parseVehicleYearHint } from "@/lib/search/parse-vehicle-year";
import {
  VEHICLE_CANONICAL_REGISTRY,
  canonicalAliasMatches,
  type VehicleCanonicalEntry,
} from "@/lib/search/vehicle-canonical-registry";

export type VehicleIntent = {
  hasVehicle: boolean;
  brand: string | null;
  model: string | null;
  generation: string | null;
  fuel: string | null;
  year: number | null;
  canonicalKey: string | null;
  displayName: string | null;
  confidence: number;
  assetId?: string;
  catalogId?: string;
  dbQuery: string;
  /** 레거시 alias label */
  label: string;
};

const FUEL_SIGNALS = /하이브리드|HEV|하브|전기|EV|디젤|가솔린|LPG/i;

function detectFuelInQuery(q: string): string | null {
  if (/하이브리드|hev|하브/i.test(q)) return "하이브리드";
  if (/전기|ev|electric|일렉트릭/i.test(q)) return "전기";
  if (/디젤|diesel/i.test(q)) return "디젤";
  if (/가솔린|gasoline|휘발유/i.test(q)) return "가솔린";
  if (/lpg/i.test(q)) return "LPG";
  return null;
}

function scoreEntry(query: string, entry: VehicleCanonicalEntry, queryFuel: string | null): number {
  if (!canonicalAliasMatches(query, entry)) return -1;
  let score = entry.specificity;
  const longestAlias = entry.aliases.reduce((a, b) => (a.length >= b.length ? a : b), "");
  score += longestAlias.length * 0.1;
  if (queryFuel) {
    if (entry.fuel === queryFuel) score += 40;
    else if (entry.fuel === null) score -= 25;
    else score -= 50;
  }
  return score;
}

export function parseVehicleIntent(normalizedQuery: string): VehicleIntent {
  const empty: VehicleIntent = {
    hasVehicle: false,
    brand: null,
    model: null,
    generation: null,
    fuel: null,
    year: null,
    canonicalKey: null,
    displayName: null,
    confidence: 0,
    dbQuery: "",
    label: "",
  };

  const q = normalizedQuery.replace(/\s*배터리\s*$/i, "").trim();
  if (!q) return empty;

  const queryFuel = detectFuelInQuery(q);
  let best: { entry: VehicleCanonicalEntry; score: number } | null = null;

  for (const entry of VEHICLE_CANONICAL_REGISTRY) {
    const score = scoreEntry(q, entry, queryFuel);
    if (score < 0) continue;
    if (!best || score > best.score) {
      best = { entry, score };
    }
  }

  if (!best) return empty;

  let { entry } = best;
  const yearHint = parseVehicleYearHint(q);

  if (isPorter2Query(q) && entry.canonicalKey === "hyundai-porter2") {
    if (yearHint.era === "from2020") {
      entry =
        VEHICLE_CANONICAL_REGISTRY.find((e) => e.canonicalKey === "hyundai-porter2-from2020") ?? entry;
    } else if (yearHint.era === "until2019") {
      entry =
        VEHICLE_CANONICAL_REGISTRY.find((e) => e.canonicalKey === "hyundai-porter2-until2019") ?? entry;
    }
  }

  const fuel = entry.fuel ?? queryFuel;
  const label =
    entry.generation && fuel
      ? `${entry.model} ${entry.generation} ${fuel}`
      : entry.generation
        ? `${entry.model} ${entry.generation}`
        : entry.model;

  const confidence = Math.min(0.98, 0.5 + best.score / 200);

  return {
    hasVehicle: true,
    brand: entry.brand,
    model: entry.model,
    generation: entry.generation,
    fuel,
    year: yearHint.year,
    canonicalKey: entry.canonicalKey,
    displayName: entry.displayName,
    confidence,
    assetId: entry.assetId,
    catalogId: entry.catalogId,
    dbQuery: entry.dbQuery,
    label,
  };
}

export function parseVehicleIntentFromRaw(rawQuery: string): VehicleIntent {
  const { normalizedQuery } = normalizeQuery(rawQuery);
  return parseVehicleIntent(normalizedQuery);
}
