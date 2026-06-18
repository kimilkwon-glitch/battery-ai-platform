import "server-only";

import { decodeProductId } from "@/lib/admin/products/product-id";
import { resolveAdminProductRowForOrder } from "@/lib/admin/products/products-admin-service";
import type { AdminProductBrand } from "@/types/admin-product";
import { brandIdToBatteryBrandKey } from "@/lib/battery-alias-map";
import type { BatteryCartItem } from "@/types/cart";
import type { CreateOrderRequestBody } from "@/types/commerce-payment";

export type OrderCatalogValidation =
  | { ok: true }
  | { ok: false; message: string; status: 400 | 422; code?: string };

export const ORDER_CATALOG_UNAVAILABLE_MESSAGE =
  "상품 정보가 변경되었거나 현재 주문할 수 없습니다. 장바구니에서 상품을 다시 확인해 주세요.";

type CatalogIdentity =
  | { ok: true; brand: AdminProductBrand; batteryCode: string }
  | { ok: false; message: string; status: 400 | 422; code?: string };

function resolveClientBrandKey(brandId?: string | null): AdminProductBrand | null {
  if (!brandId?.trim()) return null;
  const key = brandIdToBatteryBrandKey(brandId.trim());
  if (key === "rocket" || key === "solite") return key;
  return null;
}

function parseSpecProductId(
  productId: string,
): { brand: AdminProductBrand; batteryCode: string } | null {
  const match = /^spec-(rocket|solite)-(.+)$/i.exec(productId.trim());
  if (!match) return null;
  const brand = match[1]!.toLowerCase() as AdminProductBrand;
  const batteryCode = match[2]!.replace(/-/g, "").toUpperCase();
  return batteryCode ? { brand, batteryCode } : null;
}

function parseCartProductId(
  productId: string,
): { brand: AdminProductBrand; batteryCode: string } | null {
  const decoded = decodeProductId(productId);
  if (decoded) {
    const brand = decoded.brand as AdminProductBrand;
    if (brand !== "rocket" && brand !== "solite") return null;
    const batteryCode = decoded.batteryCode.trim().toUpperCase();
    return batteryCode ? { brand, batteryCode } : null;
  }
  return parseSpecProductId(productId);
}

function resolveCatalogIdentity(
  item: Pick<BatteryCartItem, "brandId" | "productId" | "batterySpec">,
): CatalogIdentity {
  const clientBrand = resolveClientBrandKey(item.brandId);
  if (!clientBrand) {
    return {
      ok: false,
      status: 422,
      code: "PRODUCT_BRAND_INVALID",
      message: ORDER_CATALOG_UNAVAILABLE_MESSAGE,
    };
  }

  const productId = item.productId?.trim();
  if (productId) {
    const parsed = parseCartProductId(productId);
    if (parsed) {
      if (parsed.brand !== clientBrand) {
        return {
          ok: false,
          status: 422,
          code: "PRODUCT_ID_MISMATCH",
          message: ORDER_CATALOG_UNAVAILABLE_MESSAGE,
        };
      }
      return { ok: true, brand: parsed.brand, batteryCode: parsed.batteryCode };
    }
  }

  const batteryCode = item.batterySpec?.trim().toUpperCase();
  if (!batteryCode) {
    return {
      ok: false,
      status: 422,
      code: "PRODUCT_NOT_FOUND",
      message: ORDER_CATALOG_UNAVAILABLE_MESSAGE,
    };
  }

  return { ok: true, brand: clientBrand, batteryCode };
}

export function validateCartItemCatalogRules(
  item: Pick<BatteryCartItem, "brandId" | "productId" | "batterySpec">,
  row: {
    productId: string;
    brand: AdminProductBrand;
    batteryCode: string;
    sellable: boolean;
    saleStatus: string;
    visible: boolean;
    reviewStatus: string;
  } | null,
): OrderCatalogValidation {
  const identity = resolveCatalogIdentity(item);
  if (!identity.ok) return identity;

  if (!row) {
    return {
      ok: false,
      status: 422,
      code: "PRODUCT_NOT_FOUND",
      message: ORDER_CATALOG_UNAVAILABLE_MESSAGE,
    };
  }

  if (row.brand !== identity.brand) {
    return {
      ok: false,
      status: 422,
      code: "PRODUCT_BRAND_MISMATCH",
      message: ORDER_CATALOG_UNAVAILABLE_MESSAGE,
    };
  }

  const productId = item.productId?.trim();
  if (productId) {
    const parsed = parseCartProductId(productId);
    if (parsed) {
      if (
        parsed.brand !== row.brand ||
        parsed.batteryCode !== row.batteryCode.trim().toUpperCase()
      ) {
        return {
          ok: false,
          status: 422,
          code: "PRODUCT_ID_MISMATCH",
          message: ORDER_CATALOG_UNAVAILABLE_MESSAGE,
        };
      }
    }
  }

  if (
    !row.sellable ||
    row.saleStatus !== "selling" ||
    !row.visible ||
    row.reviewStatus === "sales_excluded"
  ) {
    return {
      ok: false,
      status: 422,
      code: "PRODUCT_NOT_SELLABLE",
      message: ORDER_CATALOG_UNAVAILABLE_MESSAGE,
    };
  }

  return { ok: true };
}

export async function validateOrderCatalogForCreate(
  body: CreateOrderRequestBody,
): Promise<OrderCatalogValidation> {
  for (const item of body.cartItems) {
    const identity = resolveCatalogIdentity(item);
    if (!identity.ok) return identity;

    const row = await resolveAdminProductRowForOrder(identity.brand, identity.batteryCode);
    const itemResult = validateCartItemCatalogRules(item, row);
    if (!itemResult.ok) return itemResult;
  }

  return { ok: true };
}
