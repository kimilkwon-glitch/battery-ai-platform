/**
 * vehicle-alias-db coarse slugHint → 쉐보레/GM 세대 assetId
 */
import type { VehicleYearEra } from "@/lib/search/parse-vehicle-year";
import { CHEVROLET_SLUG_HINT_TO_ASSET_ID } from "@/lib/vehicle-asset-chevrolet";

export type SlugResolveContext = {
  rawQuery?: string;
  fuel?: string | null;
  year?: number | null;
  yearEra?: VehicleYearEra;
};

function pickYear(ctx: SlugResolveContext): number | null {
  return ctx.year ?? null;
}

export function resolveChevroletCoarseSlug(
  slugHint: string,
  ctx: SlugResolveContext = {},
): string | undefined {
  if (CHEVROLET_SLUG_HINT_TO_ASSET_ID[slugHint]) {
    return slugHint;
  }

  const q = ctx.rawQuery ?? "";
  const y = pickYear(ctx);

  if (slugHint === "chevrolet-matiz" || /마티즈|마크리|크리에이티브/i.test(q)) {
    if (slugHint === "chevrolet-spark-m300" && /마티즈|마크리|크리에이티브/i.test(q)) {
      return "gmdaewoo-matiz-creative-2009";
    }
    if (slugHint === "chevrolet-matiz") return "gmdaewoo-matiz-creative-2009";
  }

  if (slugHint === "chevrolet-spark-m300") {
    if (y != null && y <= 2011) return "chevrolet-spark-2011";
    if (y != null && y <= 2013) return "chevrolet-spark-s-2013";
    if (y != null && y <= 2015) return "chevrolet-spark-s-2013";
    return "chevrolet-spark-2011";
  }

  if (slugHint === "chevrolet-spark-m400") {
    if (y != null && y >= 2021) return "chevrolet-spark-2021";
    if (y != null && y >= 2018) return "chevrolet-spark-2018";
    if (y != null && y >= 2015) return "chevrolet-spark-2015";
    return "chevrolet-spark-2015";
  }

  if (slugHint === "chevrolet-cruze-j300") {
    if (/라세티\s*프리미어|라프/i.test(q)) return "daewoo-lacetti-premiere-2008";
    if (/라세티/i.test(q) && (y == null || y <= 2008)) return "gmdaewoo-lacetti-2006";
    if (y != null && y >= 2015) return "chevrolet-the-new-cruze-2015";
    if (/더\s*뉴|어메이징/i.test(q)) return "chevrolet-the-new-cruze-2015";
    return "chevrolet-cruze-2011";
  }

  if (slugHint === "chevrolet-cruze-d2lc") {
    return "chevrolet-all-new-cruze-2017";
  }

  if (slugHint === "chevrolet-malibu-v300") {
    if (y != null && y >= 2016) return "chevrolet-malibu-2016";
    return "chevrolet-malibu-2011";
  }

  if (slugHint === "chevrolet-malibu-v400") {
    if (y != null && y >= 2019) return "chevrolet-malibu-2019";
    return "chevrolet-malibu-2016";
  }

  if (slugHint === "chevrolet-trax-1st") {
    if (y != null && y >= 2017) return "chevrolet-trax-2017";
    return "chevrolet-trax-2013";
  }

  if (slugHint === "chevrolet-trax-crossover") {
    return "chevrolet-trax-crossover-2023";
  }

  if (slugHint === "chevrolet-trailblazer") {
    if (y != null && y >= 2024) return "chevrolet-trailblazer-2024";
    return "chevrolet-trailblazer-2020";
  }

  if (slugHint === "chevrolet-captiva") {
    if (/윈스톰/i.test(q)) return "gmdaewoo-winstorm-2006";
    if (y != null && y >= 2016) return "chevrolet-captiva-2016";
    return "chevrolet-captiva-2011";
  }

  if (slugHint === "chevrolet-orlando") return "chevrolet-orlando-2011";
  if (slugHint === "chevrolet-bolt-ev") return "chevrolet-bolt-ev-2017";
  if (slugHint === "chevrolet-aveo") return "chevrolet-aveo-2011";
  if (slugHint === "chevrolet-labo") return "gmdaewoo-labo-2011";
  if (slugHint === "chevrolet-damas") return "gmdaewoo-damas-2011";
  if (slugHint === "chevrolet-impala") return "chevrolet-impala-2016";
  if (slugHint === "chevrolet-alpheon") return "gmdaewoo-alpheon-2010";
  if (slugHint === "chevrolet-traverse") return "chevrolet-traverse-2019";

  if (slugHint === "chevrolet-equinox") {
    if (y != null && y >= 2022) return "chevrolet-equinox-2022";
    return "chevrolet-equinox-2018";
  }

  if (slugHint === "chevrolet-colorado") {
    if (y != null && y >= 2021) return "chevrolet-colorado-2021";
    return "chevrolet-colorado-2019";
  }

  return undefined;
}
