/**
 * Vehicle Alias DB v0.4 — 르노·쌍용·KGM·현대/기아 세대별 slug + 검색 alias
 */
import {
  VEHICLE_GENERATIONS_V04,
  type VehicleGenerationV04,
} from "./vehicle-generation-v04.config";
import type { VehicleAliasEntry } from "./vehicle-alias-db";

function toAliasEntry(g: VehicleGenerationV04): VehicleAliasEntry {
  const brandGroup =
    g.brand === "renault"
      ? "renault_samsung"
      : g.brand === "kg" || g.brand === "ssangyong"
        ? "kgm_ssangyong"
        : g.brand === "hyundai"
          ? "hyundai"
          : "kia";

  return {
    brandGroup,
    brandLabel: g.brandLabel,
    canonicalName: g.displayName,
    slugHint: g.id,
    yearRange: g.yearRange,
    generationName: g.generationName,
    generationCode: g.generationName,
    displayAliases: [g.displayName],
    aliases: [...new Set([...g.searchAliases, g.displayName])],
    intentTags: ["vehicle", "generation", "v04"],
    mapTo: {
      vehicleFamily: g.modelGroup,
      generation: g.generationName,
    },
    notes: g.battery.status === "needsReview" ? "battery:needsReview" : "battery:linked",
  };
}

export const vehicleAliasDbV04NewEntries: VehicleAliasEntry[] =
  VEHICLE_GENERATIONS_V04.map(toAliasEntry);
