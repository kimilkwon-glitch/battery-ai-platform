/**
 * 쉐보레/GM대우 세대별 alias — slugHint = asset id (v04 패턴)
 */
import {
  VEHICLE_GENERATIONS_CHEVROLET,
  type VehicleGenerationChevrolet,
} from "./vehicle-generation-chevrolet.config";
import type { VehicleAliasEntry } from "./vehicle-alias-db";

function toAliasEntry(g: VehicleGenerationChevrolet): VehicleAliasEntry {
  return {
    brandGroup: "chevrolet_gm",
    brandLabel: g.brandLabel,
    canonicalName: g.generationName ? `${g.displayName} ${g.generationName}` : g.displayName,
    slugHint: g.id,
    yearRange: g.yearRange,
    generationName: g.generationName,
    generationCode: g.generationName,
    displayAliases: [g.displayName],
    aliases: [...new Set([...g.searchAliases, g.displayName])],
    intentTags: ["vehicle", "generation", "chevrolet-v1"],
    mapTo: {
      vehicleFamily: g.modelGroup,
      generation: g.generationName,
    },
    notes: g.battery.status === "needsReview" ? "battery:needsReview" : "battery:linked",
  };
}

export const vehicleAliasDbChevroletEntries: VehicleAliasEntry[] =
  VEHICLE_GENERATIONS_CHEVROLET.map(toAliasEntry);
