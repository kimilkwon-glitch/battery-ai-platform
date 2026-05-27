import type { QueryPipelineIntent } from "@/lib/search/search-intent-parser";

export type RankableSection = "vehicle" | "battery" | "hero" | "popular" | "symptom" | "guide" | "question";

export type TopFoldRankInput = {
  hasVehicle: boolean;
  hasAlias: boolean;
  specCount: number;
  intentFlags: {
    compare?: boolean;
    upgrade?: boolean;
    symptom?: boolean;
  };
};

/** 상단 노출 우선순위 점수 — 높을수록 상단 고정 */
export function rankSectionPriority(
  section: RankableSection,
  pipeline: QueryPipelineIntent,
): number {
  const { vehicle, batterySpec, flags } = pipeline;
  switch (section) {
    case "vehicle":
      return vehicle.hasVehicle ? 1000 : 0;
    case "battery":
      return batterySpec.hasSpec ? 900 : 0;
    case "hero":
      if (vehicle.hasVehicle && batterySpec.hasSpec) return 950;
      if (batterySpec.hasSpec) return 850;
      if (vehicle.hasVehicle) return 800;
      return 100;
    case "popular":
      if (batterySpec.hasSpec || vehicle.hasVehicle || flags.compare) return -500;
      return 50;
    case "symptom":
      return pipeline.symptom.hasSymptom && vehicle.hasVehicle ? 400 : flags.symptom ? 200 : -200;
    default:
      return 0;
  }
}

export function shouldSuppressPopularBatteries(input: TopFoldRankInput): boolean {
  return input.specCount > 0 || input.hasVehicle || input.hasAlias || Boolean(input.intentFlags.compare);
}

export type RankedCandidate = {
  id: string;
  section: RankableSection;
  score?: number;
};

/** intent 기준 후보 정렬 — 상단 1~3개 선별 전 점수화 */
export function rankSearchResults(
  pipeline: QueryPipelineIntent,
  candidates: RankedCandidate[],
): RankedCandidate[] {
  return [...candidates].sort((a, b) => {
    const pa = rankSectionPriority(a.section, pipeline) + (a.score ?? 0);
    const pb = rankSectionPriority(b.section, pipeline) + (b.score ?? 0);
    return pb - pa;
  });
}
