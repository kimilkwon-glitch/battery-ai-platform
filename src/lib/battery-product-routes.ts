import {
  brandIdToBatteryBrandKey,
  findBatteryProductByCode,
  type BatteryBrandKey,
} from "@/lib/battery-alias-map";
import { batterySpecHref, canonicalBatteryCode } from "@/lib/canonical-battery-code";

const PRODUCT_BRAND_SLUGS = ["rocket", "solite", "delco", "varta", "atk", "infinit"] as const;
export type BatteryProductBrandSlug = (typeof PRODUCT_BRAND_SLUGS)[number];

export type BatteryProductCardLinks = {
  batteryCode: string;
  brandId: BatteryProductBrandSlug | null;
  productSlug: string | null;
  batterySpecGuideHref: string;
  productDetailHref: string | null;
  reviewHref: string;
  canOrder: boolean;
};

export function toBatteryBrandKey(brandId?: string | null): BatteryBrandKey | null {
  if (!brandId?.trim()) return null;
  const key = brandIdToBatteryBrandKey(brandId.trim());
  return key ?? null;
}

export function buildBatteryProductSlug(
  brandId: string,
  batteryCode: string,
): string | null {
  const brand = brandId.trim().toLowerCase();
  if (!PRODUCT_BRAND_SLUGS.includes(brand as BatteryProductBrandSlug)) return null;
  const code = canonicalBatteryCode(batteryCode);
  if (!code) return null;
  return `${brand}-${code.toLowerCase()}`;
}

export function parseBatteryProductSlug(
  slug: string,
): { brandId: BatteryProductBrandSlug; batteryCode: string } | null {
  const normalized = slug.trim().toLowerCase();
  for (const brand of PRODUCT_BRAND_SLUGS) {
    const prefix = `${brand}-`;
    if (!normalized.startsWith(prefix)) continue;
    const rest = normalized.slice(prefix.length);
    const code = canonicalBatteryCode(rest) || rest.toUpperCase();
    if (!code) return null;
    return { brandId: brand, batteryCode: code };
  }
  return null;
}

/** 상품 상세 — /products/{brand}-{code} */
export function batteryProductDetailHref(
  brandId: string,
  batteryCode: string,
): string | null {
  const slug = buildBatteryProductSlug(brandId, batteryCode);
  return slug ? `/products/${slug}` : null;
}

/** 배터리 규격 상세 — /battery-specs/{code} (구매 UI 없음, 규격 안내 전용) */
export function batterySpecGuideHref(code: string): string {
  return batterySpecHref(code);
}

/** 리뷰 — 상품 상세 리뷰 앵커 우선, 없으면 리뷰 목록 */
export function batteryReviewHref(params: {
  batteryCode: string;
  brandId?: string | null;
}): string {
  const productHref = params.brandId
    ? batteryProductDetailHref(params.brandId, params.batteryCode)
    : null;
  if (productHref) return `${productHref}#battery-reviews`;
  const code = canonicalBatteryCode(params.batteryCode) || params.batteryCode.trim();
  const specHref = batterySpecGuideHref(code);
  return `${specHref}#battery-reviews`;
}

/**
 * 배터리 상품 카드 CTA 링크 일괄 생성
 * - 규격 보기: /batteries/{code}
 * - 주문하기: /products/{brand}-{code}
 * - 리뷰: 상품 상세 #battery-reviews
 */
export function resolveBatteryProductCardLinks(params: {
  batteryCode: string;
  brandId?: string | null;
  /** 브랜드 미지정 시 기본 브랜드 (메인 로케트 라인업 등) */
  defaultBrandId?: BatteryProductBrandSlug;
}): BatteryProductCardLinks {
  const batteryCode = canonicalBatteryCode(params.batteryCode) || params.batteryCode.trim().toUpperCase();
  const brandKey = toBatteryBrandKey(params.brandId ?? params.defaultBrandId ?? "rocket");
  const brandSlug = (params.brandId ?? params.defaultBrandId ?? "rocket").trim().toLowerCase() as BatteryProductBrandSlug;

  const productCode =
    brandKey != null
      ? findBatteryProductByCode(batteryCode, brandKey, { strictBrand: false }) ?? batteryCode
      : batteryCode;

  const productSlug = buildBatteryProductSlug(brandSlug, productCode ?? batteryCode);
  const productDetailHref = productSlug ? `/products/${productSlug}` : null;

  return {
    batteryCode,
    brandId: PRODUCT_BRAND_SLUGS.includes(brandSlug) ? brandSlug : null,
    productSlug,
    batterySpecGuideHref: batterySpecGuideHref(batteryCode),
    productDetailHref,
    reviewHref: batteryReviewHref({ batteryCode, brandId: brandSlug }),
    canOrder: Boolean(productDetailHref),
  };
}
