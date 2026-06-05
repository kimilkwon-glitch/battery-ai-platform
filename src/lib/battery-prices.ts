import {
  INTERNET_PRICE_PRODUCT_OVERRIDES,
  INTERNET_PRICES_WON,
  INTERNET_PRICING_SPEC_ALIASES,
  ONSITE_PRICES_WON,
  type BatteryPriceBrand,
  type OnsitePriceGroup,
} from "@/data/battery-price-catalog";
import { brandIdToBatteryBrandKey, type BatteryBrandKey } from "@/lib/battery-alias-map";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";

export type BatteryPricePair = {
  internetPriceWon: number | null;
  onsitePriceWon: number | null;
};

function toPriceBrand(brand: BatteryBrandKey | string | undefined): BatteryPriceBrand | null {
  const key = typeof brand === "string" ? brandIdToBatteryBrandKey(brand) ?? brand : brand;
  if (key === "rocket" || key === "solite") return key;
  return null;
}

function normalizeSpecCode(raw: string): string {
  return raw.trim().replace(/\s+/g, "").toUpperCase();
}

function resolveInternetPricingSpec(
  brand: BatteryPriceBrand,
  rawCode: string,
  productName?: string,
): string {
  if (productName) {
    for (const rule of INTERNET_PRICE_PRODUCT_OVERRIDES) {
      if (rule.brand === brand && rule.match.test(productName)) {
        return rule.spec;
      }
    }
  }

  const code = normalizeSpecCode(rawCode);
  const alias = INTERNET_PRICING_SPEC_ALIASES[code]?.[brand];
  if (alias) return alias;

  return code;
}

function resolveOnsiteGroup(spec: string): OnsitePriceGroup | null {
  const c = normalizeSpecCode(spec);

  if (/^GB(120|150|170|250)L$/.test(c)) return null;
  if (c === "DIN44L" || c === "CMF54459") return null;

  if (c === "CMF40L" || c === "40L" || c === "GB40AL") return "40L";
  if (c === "GB50L" || c === "CMF50L") return "50L";
  if (c === "DIN50L" || c === "GB55066") return "DIN50L";
  if (c === "GB60AL" || c === "GB60R" || c === "CMF60L") return "60LR";
  if (c === "GB80L" || c === "GB80R" || c === "CMF80L" || c === "CMF80R" || c === "GB58014") return "80LR";
  if (
    c === "GB90L" ||
    c === "GB90R" ||
    c === "CMF90L" ||
    c === "CMF90R" ||
    c === "GB95R"
  ) {
    return "90LR";
  }
  if (c === "GB100L" || c === "GB100R" || c === "CMF100L" || c === "CMF100R" || c === "100R") {
    return "100LR";
  }

  if (c === "DIN50L" || c === "GB55066") return "DIN50L";
  if (c === "DIN62L" || c === "GB56219" || c === "CMF56219") return "DIN60L";
  if (c === "DIN74L" || c === "DIN74R" || c === "GB57820" || c === "GB57219" || c === "CMF57412") {
    return "DIN74L";
  }
  if (c === "DIN90L" || c === "DIN90R" || c === "GB59042") return "DIN90L";
  if (c === "DIN100L" || c === "GB60044") return "DIN100L";
  if (c === "DIN110L") return "DIN110L";

  if (c === "AGM60L") return "AGM60L";
  if (c === "AGM70L") return "AGM70L";
  if (c === "AGM80L" || c === "AGM80R") return "AGM80LR";
  if (c === "AGM95L" || c === "AGM95R") return "AGM95LR";
  if (c === "AGM105L") return "AGM105L";

  return null;
}

export function getBatteryInternetPriceWon(
  brand: BatteryBrandKey | string,
  rawCode: string,
  opts?: { productName?: string },
): number | null {
  const priceBrand = toPriceBrand(brand);
  if (!priceBrand) return null;

  const canonical = canonicalBatteryCode(rawCode) || normalizeSpecCode(rawCode);
  const pricingSpec = resolveInternetPricingSpec(priceBrand, canonical, opts?.productName);
  return INTERNET_PRICES_WON[`${priceBrand}:${pricingSpec}`] ?? null;
}

export function getBatteryOnsitePriceWon(
  brand: BatteryBrandKey | string,
  rawCode: string,
): number | null {
  const priceBrand = toPriceBrand(brand);
  if (!priceBrand) return null;

  const canonical = canonicalBatteryCode(rawCode) || normalizeSpecCode(rawCode);
  const pricingSpec = resolveInternetPricingSpec(priceBrand, canonical);
  const group = resolveOnsiteGroup(pricingSpec);
  if (!group) return null;
  return ONSITE_PRICES_WON[group]?.[priceBrand] ?? null;
}

export function getBatteryPrices(
  brand: BatteryBrandKey | string,
  rawCode: string,
  opts?: { productName?: string },
): BatteryPricePair {
  return {
    internetPriceWon: getBatteryInternetPriceWon(brand, rawCode, opts),
    onsitePriceWon: getBatteryOnsitePriceWon(brand, rawCode),
  };
}

export function formatBatteryPriceWon(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return "상담 문의";
  return `${amount.toLocaleString("ko-KR")}원`;
}
