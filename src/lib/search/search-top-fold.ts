import type { SearchVehicleAliasMatch } from "@/lib/search/search-vehicle-aliases";
import type { QueryIntentFlags } from "@/lib/search/search-intent";

export type SearchTopFoldLimits = {
  maxVehicles: number;
  maxBatteries: number;
  maxQuestions: number;
  maxGuides: number;
  showPopular: boolean;
  showHero: boolean;
  deferSecondary: boolean;
};

export function computeTopFoldLimits(
  alias: SearchVehicleAliasMatch | null,
  specCount: number,
  flags: QueryIntentFlags,
  hasVehicleIntent: boolean,
): SearchTopFoldLimits {
  const deferSecondary = true;

  if (flags.compare && specCount >= 2) {
    return {
      maxVehicles: alias ? 1 : 0,
      maxBatteries: Math.min(specCount, 2),
      maxQuestions: 0,
      maxGuides: 0,
      showPopular: false,
      showHero: true,
      deferSecondary,
    };
  }

  if (flags.upgrade) {
    return {
      maxVehicles: alias || hasVehicleIntent ? 1 : 0,
      maxBatteries: specCount > 0 ? 1 : 0,
      maxQuestions: 0,
      maxGuides: 0,
      showPopular: false,
      showHero: true,
      deferSecondary,
    };
  }

  if (flags.symptom || flags.photo) {
    return {
      maxVehicles: alias || hasVehicleIntent ? 1 : 0,
      maxBatteries: specCount > 0 ? 1 : 0,
      maxQuestions: 0,
      maxGuides: 0,
      showPopular: false,
      showHero: true,
      deferSecondary,
    };
  }

  if (specCount > 0 && !hasVehicleIntent && !alias) {
    return {
      maxVehicles: 0,
      maxBatteries: Math.min(specCount, flags.compare ? 2 : 1),
      maxQuestions: 0,
      maxGuides: 0,
      showPopular: false,
      showHero: true,
      deferSecondary,
    };
  }

  if ((alias || hasVehicleIntent) && specCount > 0) {
    return {
      maxVehicles: 1,
      maxBatteries: 1,
      maxQuestions: 0,
      maxGuides: 0,
      showPopular: false,
      showHero: true,
      deferSecondary,
    };
  }

  if (alias || hasVehicleIntent) {
    const multiGeneration = Boolean(alias && !alias.assetId);
    return {
      maxVehicles: multiGeneration ? 8 : 1,
      maxBatteries: specCount > 0 ? 1 : 0,
      maxQuestions: 2,
      maxGuides: 1,
      showPopular: false,
      showHero: false,
      deferSecondary,
    };
  }

  return {
    maxVehicles: 2,
    maxBatteries: 2,
    maxQuestions: 1,
    maxGuides: 1,
    showPopular: false,
    showHero: true,
    deferSecondary,
  };
}
