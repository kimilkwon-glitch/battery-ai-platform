import {
  brandIdToBatteryBrandKey,
  type BatteryBrandKey,
} from "@/lib/battery-alias-map";
import { inferBatteryBrandKeyFromCode } from "@/lib/battery-brand-inference";
import { batteryImageSetForCode } from "@/lib/battery-image";
import type { BatteryCartItem } from "@/types/cart";

export function brandNameToBrandKey(brandName?: string | null): BatteryBrandKey | null {
  if (!brandName?.trim()) return null;
  const n = brandName.trim();
  if (n.includes("쏠라이트") || n === "solite") return "solite";
  if (n.includes("로케트") || n === "rocket") return "rocket";
  const fromId = brandIdToBatteryBrandKey(n);
  return fromId ?? null;
}

export function resolveCartItemBrandKey(input: {
  brandName?: string | null;
  brandId?: string | null;
  batteryCode: string;
}): BatteryBrandKey {
  if (input.brandId) {
    const fromId = brandIdToBatteryBrandKey(input.brandId);
    if (fromId) return fromId;
  }
  const fromName = brandNameToBrandKey(input.brandName);
  if (fromName) return fromName;
  return inferBatteryBrandKeyFromCode(input.batteryCode);
}

export function formatCartBrandDisplayName(brandKey: BatteryBrandKey): string {
  return brandKey === "solite" ? "쏠라이트" : "로케트";
}

export function resolveCartItemImageSrc(
  item: Pick<BatteryCartItem, "imageSrc" | "brandName" | "batterySpec">,
): string | null {
  if (item.imageSrc?.trim()) return item.imageSrc;
  const brandKey = resolveCartItemBrandKey({
    brandName: item.brandName,
    batteryCode: item.batterySpec,
  });
  return batteryImageSetForCode(item.batterySpec, brandKey).main ?? null;
}
