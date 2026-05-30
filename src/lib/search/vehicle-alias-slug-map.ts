/**
 * vehicle-alias-db slugHint → platform vehicle assetId (/vehicle/[slug])
 * car-assets · platform-catalog · vehicle-battery-enrichment 기준
 */
import type { VehicleYearEra } from "@/lib/search/parse-vehicle-year";

export const SLUG_HINT_TO_ASSET_ID: Record<string, string> = {
  "hyundai-avante-md": "avante-md",
  "hyundai-avante-ad": "avante-ad",
  "hyundai-avante-cn7": "avante-cn7",
  "hyundai-sonata-nf": "sonata-nf",
  "hyundai-sonata-yf": "sonata-yf",
  "hyundai-sonata-lf": "sonata-lf",
  "hyundai-sonata-dn8": "sonata-dn8",
  "hyundai-grandeur-tg": "grandeur-tg",
  "hyundai-grandeur-hg": "grandeur-hg",
  "hyundai-grandeur-ig": "grandeur-ig",
  "hyundai-grandeur-ig-fl": "grandeur-ig-fl",
  "hyundai-grandeur-gn7": "grandeur-gn7",
  "hyundai-santafe-cm": "santafe-cm",
  "hyundai-santafe-dm": "santafe-dm",
  "hyundai-santafe-tm": "santafe-tm",
  "hyundai-santafe-mx5": "santafe-mx5",
  "hyundai-tucson-nx4": "tucson-nx4",
  "hyundai-kona-os": "kona-os",
  "hyundai-kona-sx2": "kona-sx2",
  "hyundai-palisade-lx2": "palisade-lx2",
  "hyundai-staria-us4": "staria-us4",
  "hyundai-ioniq5-ne": "ioniq5-ne",
  "hyundai-ioniq6-ce": "ioniq6-ce",

  "kia-k3-1st": "k3-yd",
  "kia-k3-bd": "k3-bd",
  "kia-k3-bd-facelift": "k3-bd-fl",
  "kia-k5-tf": "k5-tf",
  "kia-k5-jf": "k5-jf",
  "kia-k5-dl3": "k5-dl3",
  "kia-k7-vg": "k7-vg",
  "kia-k7-yg": "k7-yg",
  "kia-k8-gl3": "k8-gl3",
  "kia-sportage-sl": "sportage-sl",
  "kia-sportage-ql": "sportage-ql",
  "kia-sportage-nq5": "sportage-nq5",
  "kia-sorento-xm": "sorento-xm",
  "kia-sorento-um": "sorento-um",
  "kia-sorento-mq4": "sorento-mq4",
  "kia-carnival-yp": "carnival-yp",
  "kia-carnival-ka4": "carnival-ka4",
  "kia-ray-1st": "ray-tam",
  "kia-morning-ta": "morning-ta",
  "kia-morning-ja": "morning-ja",
  "kia-niro-de": "niro-de",
  "kia-niro-sg2": "niro-sg2",
  "kia-bongo3": "bongo3-truck",
  "kia-ev6-cv": "ev6",

  "genesis-g80-rg3": "g80-rg3",
  "genesis-g70-ik": "g70-ik",
};

export const SLUG_HINT_FUEL_ASSET: Record<string, Partial<Record<string, string>>> = {
  "hyundai-porter2": {
    ev: "porter2-ev",
    electric: "porter2-ev",
  },
  "kia-bongo3": {
    ev: "bongo3-ev",
    electric: "bongo3-ev",
  },
};

export type SlugResolveContext = {
  rawQuery?: string;
  fuel?: string | null;
  year?: number | null;
  yearEra?: VehicleYearEra;
};

/** slugHint + 연식·연료·검색어 맥락으로 platform assetId 결정 */
export function resolveAssetIdFromSlugHint(
  slugHint: string,
  ctx: SlugResolveContext = {},
): string | undefined {
  const q = ctx.rawQuery ?? "";
  const fuelKey = (ctx.fuel ?? "").toLowerCase();

  const fuelMap = SLUG_HINT_FUEL_ASSET[slugHint];
  if (fuelMap && (/전기|ev|일렉트릭|electric/i.test(q) || fuelKey === "ev")) {
    return fuelMap.ev ?? fuelMap.electric;
  }

  if (slugHint === "hyundai-porter2") {
    if (ctx.yearEra === "from2020" || (ctx.year != null && ctx.year >= 2020)) {
      return "porter2-new";
    }
    if (ctx.yearEra === "until2019" || (ctx.year != null && ctx.year <= 2019)) {
      return "porter2-old";
    }
    if (/20\s*년|2020|21년|22년|23년|24년|25년/i.test(q)) {
      return "porter2-new";
    }
    return undefined;
  }

  if (slugHint === "hyundai-grandeur-ig" && /더\s*뉴|더뉴/i.test(q)) {
    return "grandeur-ig-fl";
  }

  if (slugHint === "hyundai-santafe-dm" && /더\s*프라임|더프라임/i.test(q)) {
    return "santafe-dm";
  }

  if (slugHint === "hyundai-santafe-tm") {
    if (ctx.year != null && ctx.year >= 2018 && ctx.year <= 2023) {
      return "santafe-tm";
    }
    if (/21\s*년|22\s*년|23\s*년|2019|2020|2021|2022|2023/i.test(q) && /더\s*뉴|더뉴|tm/i.test(q)) {
      return "santafe-tm";
    }
  }

  if (slugHint === "kgm-rexton-sports-khan") {
    return undefined;
  }

  if (fuelMap && fuelKey === "hev") {
    return SLUG_HINT_TO_ASSET_ID[slugHint];
  }

  return SLUG_HINT_TO_ASSET_ID[slugHint];
}
