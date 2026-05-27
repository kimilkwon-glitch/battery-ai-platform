import productsReal from "@/data/batteries/batteries.real.json";
import productsSample from "@/data/batteries/batteries.sample.json";
import legacyProducts from "@/data/batteries/products.json";
import type { BatteryProduct } from "@/data/batteries/batteries.schema";
import { pickDataset } from "@/data/common/dataStatus";
import { getFallback } from "@/data/common/fallback";

type LegacyProductsRoot = { products: Array<Record<string, unknown>> };

function mapLegacyProduct(p: Record<string, unknown>): BatteryProduct {
  const id = String(p.batteryId ?? p.normalizedCode ?? "");
  return {
    batteryId: id,
    brand: String(p.brand ?? ""),
    brandSlug: String(p.brand ?? ""),
    productName: String(p.displayName ?? id),
    standardSpec: String(p.normalizedCode ?? id),
    aliases: (p.aliases as string[]) ?? [],
    ah: (p.ah as number) ?? 0,
    cca: (p.cca as number) ?? 0,
    terminalPosition: String(p.terminalDirection ?? "L"),
    type: String(p.type ?? ""),
    size: String(p.sizeGroup ?? ""),
    imagePath: String(p.imagePath ?? ""),
    price: (p.price as number | null) ?? null,
    stockStatus: (p.stockStatus as BatteryProduct["stockStatus"]) ?? "inquiry",
    productUrl: (p.productUrl as string | null) ?? null,
    representativeVehicles: (p.compatibleVehicles as string[]) ?? [],
    cautions: String(p.notes ?? ""),
    returnCondition: "",
    deliveryAvailable: false,
    installAvailable: false,
    storePickupAvailable: false,
    memo: String(p.notes ?? ""),
  };
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
    cache = picked.items;
    return picked;
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
