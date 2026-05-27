import type { Persona, Severity } from "./types";
import { countByJourney, generateAllPersonas, samplePersonasBalanced } from "./personas";

export function getAllPersonas(total = 500): Persona[] {
  return generateAllPersonas(total);
}

export function getScenariosForRun(limit: number): Persona[] {
  const all = getAllPersonas(500);
  return samplePersonasBalanced(all, limit);
}

export function severityRank(s: Severity): number {
  return s === "HIGH" ? 3 : s === "MEDIUM" ? 2 : 1;
}

export { countByJourney };
