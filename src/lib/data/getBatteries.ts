import productsReal from "@/data/batteries/batteries.real.json";
import productsSample from "@/data/batteries/batteries.sample.json";
import legacyProducts from "@/data/batteries/products.json";
import type { BatteryProduct } from "@/data/batteries/batteries.schema";
import { pickDataset } from "@/data/common/dataStatus";
import { getFallback } from "@/data/common/fallback";
import { getBatteryPrices } from "@/lib/battery-prices";

type LegacyProductsRoot = { products: Array<Record<string, unknown>> };

function priceBrandFromSlug(brand: string): "rocket" | "solite" {
  return brand === "solite" ? "solite" : "rocket";
}

function enrichBatteryPrices(product: BatteryProduct): BatteryProduct {
  const brand = priceBrandFromSlug(product.brandSlug || product.brand);
  const spec = product.standardSpec || product.batteryId;
  const prices = getBatteryPrices(brand, spec, { productName: product.productName });
  return {
    ...product,
    internetPrice: product.internetPrice ?? prices.internetPriceWon,
    onsitePrice: product.onsitePrice ?? prices.onsitePriceWon,
    price: product.price ?? prices.internetPriceWon,
  };
}

function mapLegacyProduct(p: Record<string, unknown>): BatteryProduct {
  const id = String(p.batteryId ?? p.normalizedCode ?? "");
  const brand = String(p.brand ?? "");
  const prices = getBatteryPrices(priceBrandFromSlug(brand), id);
  return enrichBatteryPrices({
    batteryId: id,
    brand,
    brandSlug: brand,
    productName: String(p.displayName ?? id),
    standardSpec: String(p.normalizedCode ?? id),
    aliases: (p.aliases as string[]) ?? [],
    ah: (p.ah as number) ?? 0,
    cca: (p.cca as number) ?? 0,
    terminalPosition: String(p.terminalDirection ?? "L"),
    type: String(p.type ?? ""),
    size: String(p.sizeGroup ?? ""),
    imagePath: String(p.imagePath ?? ""),
    internetPrice: prices.internetPriceWon,
    onsitePrice: prices.onsitePriceWon,
    price: prices.internetPriceWon,
    stockStatus: (p.stockStatus as BatteryProduct["stockStatus"]) ?? "inquiry",
    productUrl: (p.productUrl as string | null) ?? null,
    representativeVehicles: (p.compatibleVehicles as string[]) ?? [],
    cautions: String(p.notes ?? ""),
    returnCondition: "",
    deliveryAvailable: false,
    installAvailable: false,
    storePickupAvailable: false,
    memo: String(p.notes ?? ""),
  });
}

let cache: BatteryProduct[] | null = null;

export function getBatteries() {
  if (cache) {
    return { items: cache, source: "merged" as const, isEmpty: cache.length === 0 };
  }

  const real = productsReal as BatteryProduct[];
  const sample = productsSample as BatteryProduct[];
  const picked = pickDataset(real, sample);

  if (picked.items.length > 0) {
    cache = picked.items.map((item) => enrichBatteryPrices(item as BatteryProduct));
    return { ...picked, items: cache };
  }

  const legacy = (legacyProducts as LegacyProductsRoot).products ?? [];
  if (legacy.length > 0) {
    cache = legacy.map(mapLegacyProduct);
    return { items: cache, source: "legacy" as const, isEmpty: false };
  }

  cache = [];
  return { items: [], source: "fallback" as const, isEmpty: true };
}

export function getBatteryById(id: string): BatteryProduct | null {
  const canonical = id.trim();
  const { items } = getBatteries();
  return (
    items.find(
      (b) =>
        b.batteryId === canonical ||
        b.standardSpec === canonical ||
        b.aliases.some((a) => a.toLowerCase() === canonical.toLowerCase()),
    ) ?? null
  );
}

export function getBatteryFallback() {
  return getFallback("batteryData");
}
