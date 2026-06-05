import { getBatteryImageSet } from "@/lib/battery-alias-map";
import { resolveBatteryTerminalLabel } from "@/lib/battery-spec-display";
import { terminalFromCode } from "@/lib/batteryNormalize";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { brandIdToBatteryBrandKey } from "@/lib/battery-alias-map";
import { getBatteryInternetPriceWon } from "@/lib/battery-prices";
import { getBattery, shopProducts } from "@/lib/platform-data";
import type {
  BatteryCartItem,
  FitmentStatus,
  TerminalDirection,
  UsedBatteryReturnOption,
} from "@/types/cart";
import type { BatteryReturnOption } from "@/lib/shop-order-types";

function newCartItemId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `cart-${crypto.randomUUID()}`;
  }
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function resolveTerminalDirection(code: string): TerminalDirection {
  const side = terminalFromCode(code);
  if (side === "L" || side === "R") return side;
  const label = resolveBatteryTerminalLabel(code);
  if (label?.includes("L")) return "L";
  if (label?.includes("R")) return "R";
  return "unknown";
}

function mapReturnOption(
  opt?: BatteryReturnOption | UsedBatteryReturnOption,
): UsedBatteryReturnOption {
  if (opt === "return" || opt === "no_return" || opt === "no-return") {
    return opt === "no-return" ? "no_return" : opt;
  }
  if (opt === "undecided") return "undecided";
  return "undecided";
}

function findShopPrice(batteryCode: string): { productId: string; basePrice?: number; brandName?: string } {
  const code = canonicalBatteryCode(batteryCode) || batteryCode;
  const product = shopProducts.find(
    (p) =>
      p.batteryCode === code ||
      p.batteryCode.toUpperCase() === code.toUpperCase(),
  );
  if (product) {
    const brandKey = brandIdToBatteryBrandKey(product.brandId) ?? "rocket";
    const internetPrice =
      product.price ?? getBatteryInternetPriceWon(brandKey, code);
    return {
      productId: product.id,
      basePrice: internetPrice ?? undefined,
      brandName: product.brandId === "rocket" ? "로케트" : product.brandId,
    };
  }
  const bat = getBattery(code);
  const brandKey = brandIdToBatteryBrandKey(bat.brandId) ?? "rocket";
  const internetPrice = getBatteryInternetPriceWon(brandKey, code);
  return {
    productId: `spec-${code.replace(/\s+/g, "-").toLowerCase()}`,
    basePrice: internetPrice ?? undefined,
    brandName: bat.brandId === "rocket" ? "로케트" : bat.brandId,
  };
}

export type CreateCartItemInput = {
  batteryCode: string;
  brandName?: string;
  productName?: string;
  basePrice?: number;
  imageSrc?: string | null;
  vehicle?: BatteryCartItem["vehicle"];
  fitmentStatus?: FitmentStatus;
  usedBatteryReturnOption?: BatteryReturnOption | UsedBatteryReturnOption;
  source?: BatteryCartItem["source"];
  quantity?: number;
};

export function createCartItemFromBattery(input: CreateCartItemInput): BatteryCartItem {
  const code = canonicalBatteryCode(input.batteryCode) || input.batteryCode.trim().toUpperCase();
  const bat = getBattery(code);
  const shop = findShopPrice(code);
  const imageSet = getBatteryImageSet(code, "rocket");
  const imageSrc = input.imageSrc ?? imageSet?.main ?? null;

  const fitmentStatus: FitmentStatus =
    input.fitmentStatus ??
    (input.vehicle?.vehicleId || input.vehicle?.displayName
      ? "confirmed"
      : "needs_customer_confirm");

  const usedOption = mapReturnOption(input.usedBatteryReturnOption);
  const terminalDirection = resolveTerminalDirection(code);
  const now = new Date().toISOString();

  const warnings: string[] = [];
  if (terminalDirection === "unknown") {
    warnings.push("단자 방향(L/R)을 기존 배터리 사진으로 확인해 주세요.");
  }
  if (!input.vehicle?.displayName) {
    warnings.push("차량 정보가 없습니다. 호환 여부를 다시 확인해 주세요.");
  }
  const priceImpact =
    usedOption === "return" ? -10000 : usedOption === "no_return" ? 10000 : undefined;

  return {
    id: newCartItemId(),
    productId: shop.productId,
    productName: input.productName ?? `${code} 배터리`,
    brandName: input.brandName ?? shop.brandName ?? bat.brandId,
    batterySpec: code,
    terminalDirection,
    quantity: input.quantity ?? 1,
    basePrice: input.basePrice ?? shop.basePrice,
    finalPrice:
      shop.basePrice != null && priceImpact != null
        ? shop.basePrice + priceImpact
        : input.basePrice,
    imageSrc,
    vehicle: input.vehicle,
    recommendationStatus: input.vehicle?.vehicleId ? "vehicle_recommended" : "spec_matched",
    fitmentStatus,
    usedBatteryReturn: {
      option: usedOption,
      priceImpact,
      guideRequired: usedOption !== "no_return",
    },
    fulfillment: { method: "undecided" },
    install: { method: "undecided" },
    preOrderCheckRequired: fitmentStatus !== "confirmed" || terminalDirection === "unknown",
    photoCheckRequired: fitmentStatus === "needs_photo_check",
    warnings,
    source: input.source,
    createdAt: now,
    updatedAt: now,
  };
}

export function createCartItemFromVehicleBattery(params: {
  batteryCode: string;
  vehicleSlug: string;
  vehicleTitle: string;
  fuelLabel?: string;
  usedBatteryReturnOption?: BatteryReturnOption;
}): BatteryCartItem {
  return createCartItemFromBattery({
    batteryCode: params.batteryCode,
    vehicle: {
      vehicleId: params.vehicleSlug,
      displayName: params.vehicleTitle,
      generationName: params.fuelLabel,
    },
    fitmentStatus: "confirmed",
    usedBatteryReturnOption: params.usedBatteryReturnOption ?? "undecided",
    source: "vehicle_detail",
  });
}
