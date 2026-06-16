import { NextResponse } from "next/server";
import { encodeProductId } from "@/lib/admin/products/product-id";
import { loadProductOverrides } from "@/lib/admin/products/product-overrides-store";
import { getBatteryPrices } from "@/lib/battery-prices";
import { getCurrentLineup, type HomeCatalogBrandId } from "@/lib/home-main-catalog-data";

const HOME_CATALOG_BRANDS: HomeCatalogBrandId[] = ["rocket", "solite"];

export const dynamic = "force-dynamic";

export async function GET() {
  const overrides = await loadProductOverrides();
  const prices: Record<string, { internetPriceWon: number | null; onsitePriceWon: number | null }> =
    {};

  for (const brand of HOME_CATALOG_BRANDS) {
    for (const product of getCurrentLineup(brand)) {
      const productId = encodeProductId(brand, product.searchCode);
      const catalog = getBatteryPrices(brand, product.searchCode);
      const override = overrides[productId];
      prices[productId] = {
        internetPriceWon: override?.internetPrice ?? catalog.internetPriceWon,
        onsitePriceWon: override?.onsitePrice ?? catalog.onsitePriceWon,
      };
    }
  }

  return NextResponse.json({ ok: true, prices });
}
