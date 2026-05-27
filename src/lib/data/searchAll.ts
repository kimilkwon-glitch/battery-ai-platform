import vehicleAliases from "@/data/vehicles/vehicleAliases.json";
import { getFallback } from "@/data/common/fallback";
import { findVehicles, getVehicles, getVehiclesByBatterySpec } from "./getVehicles";
import { resolveSpec } from "./resolveSpec";
import { normalizeVehicleToken } from "./normalizeVehicle";
import {
  batteries,
  guides,
  questions,
  symptoms,
  brands,
  type Battery,
  type Guide,
  type Question,
  type Symptom,
  type Brand,
} from "@/lib/platform-data";
import type { VehicleBatteryRecord } from "@/data/vehicles/vehicles.schema";

export type SearchResultKind = "vehicle" | "battery" | "guide" | "qa" | "symptom" | "brand";

export type UnifiedSearchResult = {
  kind: SearchResultKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  score: number;
};

const ALIAS_MAP = vehicleAliases as Record<string, string[]>;

function expandQueryTokens(query: string): string[] {
  const base = query.trim();
  const tokens = new Set([base, normalizeVehicleToken(base), resolveSpec(base)]);
  for (const [key, aliases] of Object.entries(ALIAS_MAP)) {
    const all = [key, ...aliases];
    if (all.some((a) => normalizeVehicleToken(a).includes(normalizeVehicleToken(base)))) {
      tokens.add(key);
      all.forEach((a) => tokens.add(a));
    }
  }
  return [...tokens].filter(Boolean);
}

function scoreText(hay: string, tokens: string[]): number {
  const h = normalizeVehicleToken(hay);
  let score = 0;
  for (const t of tokens) {
    const n = normalizeVehicleToken(t);
    if (!n) continue;
    if (h === n) score += 100;
    else if (h.includes(n)) score += 70;
    else if (n.length >= 4 && h.includes(n.slice(0, 4))) score += 30;
  }
  return score;
}

function vehicleToResult(r: VehicleBatteryRecord, score: number): UnifiedSearchResult {
  const title = r.vehicleName.split("(")[0].trim() || r.vehicleName;
  const fuel = r.fuelType ? ` · ${r.fuelType}` : "";
  return {
    kind: "vehicle",
    id: r.vehicleId,
    title,
    subtitle: `${r.manufacturer}${fuel} · ${r.mainBatterySpec || "규격 확인"}`,
    href: `/search?q=${encodeURIComponent(title)}`,
    score,
  };
}

function searchVehicles(tokens: string[], limit: number): UnifiedSearchResult[] {
  const seen = new Set<string>();
  const out: UnifiedSearchResult[] = [];

  for (const token of tokens) {
    for (const r of findVehicles(token, limit)) {
      if (seen.has(r.vehicleId)) continue;
      const score = scoreText(
        `${r.vehicleName} ${r.codeName} ${r.mainBatterySpec} ${r.aliases.join(" ")}`,
        tokens,
      );
      if (score <= 0) continue;
      seen.add(r.vehicleId);
      out.push(vehicleToResult(r, score));
    }
  }

  for (const token of tokens) {
    const spec = resolveSpec(token);
    if (!spec) continue;
    for (const r of getVehiclesByBatterySpec(spec, limit)) {
      if (seen.has(r.vehicleId)) continue;
      seen.add(r.vehicleId);
      out.push(vehicleToResult(r, 65));
    }
  }

  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

function searchBatteries(tokens: string[], limit: number): UnifiedSearchResult[] {
  const out: UnifiedSearchResult[] = [];
  for (const b of batteries) {
    const hay = `${b.code} ${b.type} ${b.capacity} ${b.cca}`;
    const score = scoreText(hay, tokens);
    if (score <= 0) continue;
    out.push({
      kind: "battery",
      id: b.code,
      title: b.code,
      subtitle: `${b.type} · ${b.terminal} · ${b.capacity}`,
      href: `/batteries/${encodeURIComponent(b.code)}`,
      score,
    });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

function searchGuides(tokens: string[], limit: number): UnifiedSearchResult[] {
  const out: UnifiedSearchResult[] = [];
  for (const g of guides) {
    const score = scoreText(`${g.title} ${g.summary} ${g.body}`, tokens);
    if (score <= 0) continue;
    out.push({
      kind: "guide",
      id: g.id,
      title: g.title,
      subtitle: g.summary,
      href: `/guides/${g.id}`,
      score,
    });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

function searchQa(tokens: string[], limit: number): UnifiedSearchResult[] {
  const out: UnifiedSearchResult[] = [];
  for (const q of questions) {
    const score = scoreText(`${q.title} ${q.answer} ${q.tags.join(" ")}`, tokens);
    if (score <= 0) continue;
    out.push({
      kind: "qa",
      id: q.id,
      title: q.title,
      subtitle: q.shortAnswer ?? q.category,
      href: `/community?q=${encodeURIComponent(q.title)}`,
      score,
    });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

function searchSymptoms(tokens: string[], limit: number): UnifiedSearchResult[] {
  const out: UnifiedSearchResult[] = [];
  for (const s of symptoms) {
    const score = scoreText(`${s.title} ${s.subtitle} ${s.tags.join(" ")}`, tokens);
    if (score <= 0) continue;
    out.push({
      kind: "symptom",
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      href: `/diagnosis/${s.id}`,
      score,
    });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

function searchBrands(tokens: string[], limit: number): UnifiedSearchResult[] {
  const out: UnifiedSearchResult[] = [];
  for (const b of brands) {
    const score = scoreText(`${b.displayName} ${b.line} ${b.popularCodes.join(" ")}`, tokens);
    if (score <= 0) continue;
    out.push({
      kind: "brand",
      id: b.id,
      title: b.displayName,
      subtitle: b.line,
      href: `/brands?brand=${b.id}`,
      score,
    });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

export type SearchAllResult = {
  query: string;
  tokens: string[];
  results: UnifiedSearchResult[];
  byKind: Record<SearchResultKind, UnifiedSearchResult[]>;
  isEmpty: boolean;
  fallback: ReturnType<typeof getFallback> | null;
  vehicleCount: number;
};

export function searchAll(query: string, limitPerKind = 8): SearchAllResult {
  const emptyByKind: Record<SearchResultKind, UnifiedSearchResult[]> = {
    vehicle: [],
    battery: [],
    guide: [],
    qa: [],
    symptom: [],
    brand: [],
  };

  try {
    const tokens = expandQueryTokens(query);
    const vehicles = searchVehicles(tokens, limitPerKind);
    const batteryHits = searchBatteries(tokens, limitPerKind);
    const guideHits = searchGuides(tokens, limitPerKind);
    const qaHits = searchQa(tokens, limitPerKind);
    const symptomHits = searchSymptoms(tokens, limitPerKind);
    const brandHits = searchBrands(tokens, limitPerKind);

    const byKind: Record<SearchResultKind, UnifiedSearchResult[]> = {
      vehicle: vehicles,
      battery: batteryHits,
      guide: guideHits,
      qa: qaHits,
      symptom: symptomHits,
      brand: brandHits,
    };

    const results = [...vehicles, ...batteryHits, ...guideHits, ...qaHits, ...symptomHits, ...brandHits].sort(
      (a, b) => b.score - a.score,
    );

    const { items: vehicleItems } = getVehicles();

    return {
      query,
      tokens,
      results,
      byKind,
      isEmpty: results.length === 0,
      fallback: results.length === 0 ? getFallback("searchEmpty") : null,
      vehicleCount: vehicleItems.length,
    };
  } catch (err) {
    console.error("[searchAll] failed:", err);
    return {
      query,
      tokens: [query],
      results: [],
      byKind: emptyByKind,
      isEmpty: true,
      fallback: getFallback("searchEmpty"),
      vehicleCount: 0,
    };
  }
}

export type { Battery, Guide, Question, Symptom, Brand };
