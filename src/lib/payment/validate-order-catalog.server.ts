import "server-only";

import { resolveAdminProductRowForOrder } from "@/lib/admin/products/products-admin-service";
import type { AdminProductBrand } from "@/types/admin-product";
import { findBatteryProductByCode } from "@/lib/battery-alias-map";
import { isDeprioritizedBatterySpec } from "@/lib/battery-detail/deprioritized-specs";
import { resolveCartItemBrandKey } from "@/lib/cart/cart-item-brand";
import { terminalFromCode } from "@/lib/batteryNormalize";
import {
  isVehicleFuelSalesExcluded,
  isVehicleFullyLithiumSalesExcluded,
} from "@/lib/vehicle-battery-customer-policy";
import type { BatteryCartItem } from "@/types/cart";
import type { CreateOrderRequestBody } from "@/types/commerce-payment";

export type OrderCatalogValidation =
  | { ok: true }
  | { ok: false; message: string; status: 400 | 422; code?: string };

const GENERIC_UNAVAILABLE =
  "선택하신 상품은 현재 주문할 수 없습니다. 차량·규격을 다시 확인해 주세요.";

function brandKeyToAdminBrand(brandKey: "rocket" | "solite"): AdminProductBrand {
  return brandKey;
}

function detectBrandCodeConflict(
  brand: AdminProductBrand,
  code: string,
): string | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  if (brand === "rocket" && /^CMF/i.test(normalized)) {
    return "선택하신 브랜드와 배터리 규격이 일치하지 않습니다.";
  }
  if (brand === "solite" && /^GB\d/i.test(normalized) && !/^GB\d{5}/.test(normalized)) {
    return "선택하신 브랜드와 배터리 규격이 일치하지 않습니다.";
  }
  return null;
}

function specPrefix(code: string): string | null {
  return code.trim().toUpperCase().match(/^(CMF|GB|AGM|DIN)/)?.[1] ?? null;
}

function terminalFromSpec(code: string): "L" | "R" | null {
  const side = terminalFromCode(code);
  return side === "L" || side === "R" ? side : null;
}

export function validateCartItemCatalogRules(
  item: Pick<BatteryCartItem, "brandId" | "brandName" | "batterySpec" | "terminalDirection">,
  canonical: string,
  row: {
    sellable: boolean;
    saleStatus: string;
    visible: boolean;
    reviewStatus: string;
  } | null,
): OrderCatalogValidation {
  if (!canonical?.trim()) {
    return {
      ok: false,
      status: 422,
      code: "PRODUCT_NOT_FOUND",
      message: "주문할 수 없는 배터리 규격입니다.",
    };
  }

  const brandKey = resolveCartItemBrandKey({
    brandId: item.brandId,
    brandName: item.brandName,
    batteryCode: item.batterySpec,
  });
  if (brandKey !== "rocket" && brandKey !== "solite") {
    return {
      ok: false,
      status: 422,
      code: "PRODUCT_BRAND_INVALID",
      message: GENERIC_UNAVAILABLE,
    };
  }

  const brand = brandKeyToAdminBrand(brandKey);
  const displayedSpec = item.batterySpec.trim().toUpperCase();
  for (const code of [displayedSpec, canonical.trim().toUpperCase()]) {
    const brandConflict = detectBrandCodeConflict(brand, code);
    if (brandConflict) {
      return {
        ok: false,
        status: 422,
        code: "PRODUCT_BRAND_MISMATCH",
        message: brandConflict,
      };
    }
  }

  const canonicalUpper = canonical.trim().toUpperCase();
  if (displayedSpec && canonicalUpper && displayedSpec !== canonicalUpper) {
    const displayPrefix = specPrefix(displayedSpec);
    const canonicalPrefix = specPrefix(canonicalUpper);
    if (displayPrefix && canonicalPrefix && displayPrefix !== canonicalPrefix) {
      return {
        ok: false,
        status: 422,
        code: "PRODUCT_SPEC_MISMATCH",
        message: "선택하신 배터리 규격을 다시 확인해 주세요.",
      };
    }
  }

  if (!row) {
    return {
      ok: false,
      status: 422,
      code: "PRODUCT_NOT_FOUND",
      message: "주문할 수 없는 배터리 규격입니다.",
    };
  }

  if (
    !row.sellable ||
    row.saleStatus !== "selling" ||
    !row.visible ||
    row.reviewStatus === "sales_excluded" ||
    isDeprioritizedBatterySpec(canonical)
  ) {
    return {
      ok: false,
      status: 422,
      code: "PRODUCT_NOT_SELLABLE",
      message: GENERIC_UNAVAILABLE,
    };
  }

  const specTerminal = terminalFromSpec(canonical);
  if (
    specTerminal &&
    (item.terminalDirection === "L" || item.terminalDirection === "R") &&
    item.terminalDirection !== specTerminal
  ) {
    return {
      ok: false,
      status: 422,
      code: "TERMINAL_MISMATCH",
      message: "선택하신 단자 방향과 배터리 규격이 일치하지 않습니다.",
    };
  }

  return { ok: true };
}

export function validateVehicleSalesPolicyForOrder(
  body: CreateOrderRequestBody,
): OrderCatalogValidation {
  const slugFuel = new Map<string, string>();

  for (const item of body.cartItems) {
    const slug = item.vehicle?.vehicleId?.trim();
    if (!slug) continue;
    const fuel =
      item.vehicle?.fuelType?.trim() ||
      item.vehicle?.generationName?.trim() ||
      body.vehicleInfo?.fuelType?.trim();
    if (fuel) slugFuel.set(slug, fuel);
    else if (!slugFuel.has(slug)) slugFuel.set(slug, "");
  }

  for (const [slug, fuel] of slugFuel) {
    if (isVehicleFullyLithiumSalesExcluded(slug)) {
      return {
        ok: false,
        status: 422,
        code: "VEHICLE_SALES_EXCLUDED",
        message: "해당 차량은 현재 온라인 주문이 지원되지 않습니다. 고객센터로 문의해 주세요.",
      };
    }
    if (fuel && isVehicleFuelSalesExcluded(slug, fuel)) {
      return {
        ok: false,
        status: 422,
        code: "VEHICLE_FUEL_SALES_EXCLUDED",
        message: "해당 차량·연료 조합은 현재 온라인 주문이 지원되지 않습니다.",
      };
    }
  }

  return { ok: true };
}

export async function validateOrderCatalogForCreate(
  body: CreateOrderRequestBody,
): Promise<OrderCatalogValidation> {
  for (const item of body.cartItems) {
    const brandKey = resolveCartItemBrandKey({
      brandId: item.brandId,
      brandName: item.brandName,
      batteryCode: item.batterySpec,
    });
    if (brandKey !== "rocket" && brandKey !== "solite") {
      return {
        ok: false,
        status: 422,
        code: "PRODUCT_BRAND_INVALID",
        message: GENERIC_UNAVAILABLE,
      };
    }

    const canonical =
      findBatteryProductByCode(item.batterySpec, brandKey, { strictBrand: true }) ??
      item.batterySpec.trim().toUpperCase();

    const row = await resolveAdminProductRowForOrder(
      brandKeyToAdminBrand(brandKey),
      canonical,
    );

    const itemResult = validateCartItemCatalogRules(item, canonical, row);
    if (!itemResult.ok) return itemResult;
  }

  return validateVehicleSalesPolicyForOrder(body);
}
