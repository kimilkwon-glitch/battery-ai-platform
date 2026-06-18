import "server-only";
import { INTERNET_PRICES_WON } from "@/data/battery-price-catalog";
import { BASE_BATTERY_SPECS } from "@/data/battery/baseSpecs";
import { batteryDetailHref } from "@/lib/canonical-battery-code";
import { batteryImageSetForCode } from "@/lib/battery-image";
import { getBatteryPrices } from "@/lib/battery-prices";
import { isDeprioritizedBatterySpec } from "@/lib/battery-detail/deprioritized-specs";
import { computeFulfillmentPrices } from "@/lib/admin/products/product-fulfillment-prices";
import {
  decodeProductId,
  encodeProductId,
  pathSegmentToProductId,
  productIdToPathSegment,
} from "@/lib/admin/products/product-id";
import { getProductOverride, loadProductOverrides } from "@/lib/admin/products/product-overrides-store";

export { decodeProductId, pathSegmentToProductId, productIdToPathSegment };
import type {
  AdminProductBrand,
  AdminProductDetail,
  AdminProductOverride,
  AdminProductReviewStatus,
  AdminProductRow,
  AdminProductSaleStatus,
} from "@/types/admin-product";

const BRAND_LABELS: Record<AdminProductBrand, string> = {
  rocket: "로케트",
  solite: "쏠라이트",
  delco: "델코",
  atlas: "아트라스",
};

function defaultDisplayName(brand: AdminProductBrand, code: string): string {
  return `${BRAND_LABELS[brand]} ${code}`;
}

function detectNotationIssue(brand: AdminProductBrand, code: string): string | undefined {
  if (brand === "rocket" && /^CMF/i.test(code)) return "로케트인데 CMF 표기";
  if (brand === "solite" && /^GB\d/i.test(code) && !/^GB\d{5}/.test(code)) {
    return "쏠라이트인데 GB 표기";
  }
  if (/100R/i.test(code) && /100L/i.test(code)) return "100R/100L 혼동 가능";
  if (/AGM80L/i.test(code) && /AGM80R/i.test(code)) return "AGM80L/AGM80R 혼동 가능";
  return undefined;
}

function resolveReview(
  row: Pick<
    AdminProductRow,
    | "internetPrice"
    | "onsitePrice"
    | "hasHeroImage"
    | "hasDetailPage"
    | "displayName"
    | "saleStatus"
    | "sellable"
    | "brand"
    | "batteryCode"
  >,
): { status: AdminProductReviewStatus; labels: string[] } {
  const labels: string[] = [];
  const notation = detectNotationIssue(row.brand, row.batteryCode);
  if (notation) labels.push(notation);

  if (row.internetPrice == null) labels.push("인터넷가 없음");
  if (row.onsitePrice == null) labels.push("출장가 없음");
  if (!row.hasHeroImage) labels.push("대표 이미지 없음");
  if (!row.hasDetailPage) labels.push("상세페이지 없음");
  if (!row.displayName?.trim()) labels.push("고객용 상품명 없음");

  if (row.saleStatus === "selling" && row.sellable) {
    if (row.internetPrice == null || row.onsitePrice == null) labels.push("판매중인데 가격 없음");
    if (!row.hasHeroImage) labels.push("판매중인데 이미지 없음");
  }

  if (isDeprioritizedBatterySpec(row.batteryCode)) labels.push("판매 제외 규격");

  let status: AdminProductReviewStatus = "ok";
  if (labels.some((l) => l.includes("판매 제외"))) status = "sales_excluded";
  else if (notation) status = "notation_check";
  else if (labels.some((l) => l.includes("가격"))) status = "price_missing";
  else if (labels.some((l) => l.includes("이미지"))) status = "image_missing";
  else if (labels.some((l) => l.includes("상세"))) status = "detail_missing";
  else if (labels.length > 0) status = "needs_review";

  return { status, labels };
}

function buildRow(
  brand: AdminProductBrand,
  batteryCode: string,
  overrides: Record<string, AdminProductOverride>,
): AdminProductRow {
  const productId = encodeProductId(brand, batteryCode);
  const override = overrides[productId];
  const catalog =
    brand === "rocket" || brand === "solite"
      ? getBatteryPrices(brand, batteryCode)
      : { internetPriceWon: null, onsitePriceWon: null };

  const internetPrice = override?.internetPrice ?? catalog.internetPriceWon;
  const onsitePrice = override?.onsitePrice ?? catalog.onsitePriceWon;
  const fulfillmentPrices = computeFulfillmentPrices(internetPrice, onsitePrice);

  const imageSet = batteryImageSetForCode(batteryCode);
  const hasHeroImage = Boolean(imageSet?.main);
  const detailHref = batteryDetailHref(batteryCode);
  const hasDetailPage = Boolean(detailHref && BASE_BATTERY_SPECS.some((s) => s.code === batteryCode));

  const saleStatus: AdminProductSaleStatus =
    override?.saleStatus ??
    (isDeprioritizedBatterySpec(batteryCode) ? "stopped" : "selling");
  const visible = override?.visible ?? !isDeprioritizedBatterySpec(batteryCode);
  const sellable = override?.sellable ?? saleStatus === "selling";

  const displayName = override?.displayName ?? defaultDisplayName(brand, batteryCode);
  const adminName = override?.adminName ?? displayName;

  const base: AdminProductRow = {
    productId,
    brand,
    brandLabel: BRAND_LABELS[brand],
    batteryCode,
    adminName,
    displayName,
    seoNameCandidate: override?.seoNameCandidate ?? `${displayName} 자동차 배터리`,
    internetPrice,
    onsitePrice,
    fulfillmentPrices,
    saleStatus,
    visible,
    sellable,
    hasHeroImage,
    hasDetailPage,
    detailHref,
    imageStatus: hasHeroImage ? "ok" : "missing",
    detailPageStatus: hasDetailPage ? "ok" : "missing",
    reviewStatus: "ok",
    reviewLabels: [],
    vehicleKeywords: [],
    memo: override?.memo ?? "",
    updatedAt: override?.updatedAt ?? "",
  };

  const review = resolveReview(base);
  const reviewStatus = override?.reviewStatusOverride ?? review.status;
  return { ...base, reviewStatus, reviewLabels: review.labels };
}

/** 주문 검증 — 카탈로그에 등록된 로케트/쏠라이트 상품인지 */
export function isCatalogProductKnown(brand: AdminProductBrand, batteryCode: string): boolean {
  const code = batteryCode.trim().toUpperCase();
  if (!code) return false;
  const key = `${brand}:${code}`;
  if (INTERNET_PRICES_WON[key as keyof typeof INTERNET_PRICES_WON] != null) return true;
  if (!BASE_BATTERY_SPECS.some((s) => s.code === code)) return false;
  const prices = getBatteryPrices(brand, code);
  return prices.internetPriceWon != null || prices.onsitePriceWon != null;
}

/** 주문 생성 시 판매 상태 확인용 단일 상품 row */
export async function resolveAdminProductRowForOrder(
  brand: AdminProductBrand,
  batteryCode: string,
): Promise<AdminProductRow | null> {
  const code = batteryCode.trim().toUpperCase();
  if (!isCatalogProductKnown(brand, code)) return null;
  const overrides = await loadProductOverrides();
  return buildRow(brand, code, overrides);
}

export async function buildAdminProductRows(): Promise<AdminProductRow[]> {
  const overrides = await loadProductOverrides();
  const seen = new Set<string>();
  const rows: AdminProductRow[] = [];

  for (const key of Object.keys(INTERNET_PRICES_WON)) {
    const [brand, code] = key.split(":");
    if (brand !== "rocket" && brand !== "solite") continue;
    const productId = encodeProductId(brand, code);
    if (seen.has(productId)) continue;
    seen.add(productId);
    rows.push(buildRow(brand as AdminProductBrand, code, overrides));
  }

  for (const spec of BASE_BATTERY_SPECS) {
    for (const brand of ["rocket", "solite"] as const) {
      const productId = encodeProductId(brand, spec.code);
      if (seen.has(productId)) continue;
      const prices = getBatteryPrices(brand, spec.code);
      if (prices.internetPriceWon == null && prices.onsitePriceWon == null) continue;
      seen.add(productId);
      rows.push(buildRow(brand, spec.code, overrides));
    }
  }

  return rows.sort((a, b) =>
    a.brand.localeCompare(b.brand) || a.batteryCode.localeCompare(b.batteryCode),
  );
}

export async function getAdminProductDetail(productId: string): Promise<AdminProductDetail | null> {
  const parsed = decodeProductId(productId);
  if (!parsed) return null;
  const brand = parsed.brand as AdminProductBrand;
  if (!BRAND_LABELS[brand]) return null;

  const overrides = await loadProductOverrides();
  const row = buildRow(brand, parsed.batteryCode, overrides);
  if (row.productId !== productId) return null;

  const override = await getProductOverride(productId);
  return {
    ...row,
    description: override?.description ?? "",
    cautions: override?.cautions ?? "",
    detailContent: {
      summary: override?.description ?? `${row.displayName} 상세 안내`,
      highlights: ["장착 규격 확인", "단자 방향 확인", "수령/장착 방식별 가격 안내"],
      vehicleGuide: "적용 가능 차량은 차종 검색에서 확인하세요.",
      fulfillmentGuide: "택배 발송·출장교체·내방교체·내방수령 안내는 주문서에 표시됩니다.",
      returnGuide: "폐배터리 반납 여부는 주문 시 선택합니다.",
      agmGuide: row.batteryCode.includes("AGM") ? "AGM 배터리 — BMS 등록 여부 확인" : "",
      preOrderChecks: ["차량 연식·연료 확인", "배터리 규격 확인", "수령 방식 확인"],
    },
    excludeVehicleKeywords: [],
    relatedBatteries: [],
    relatedVehicles: [],
  };
}

export function countProductsByReview(rows: AdminProductRow[]): Record<string, number> {
  return {
    price_missing: rows.filter((r) => r.reviewStatus === "price_missing").length,
    image_missing: rows.filter((r) => r.reviewStatus === "image_missing").length,
    detail_missing: rows.filter((r) => r.reviewStatus === "detail_missing").length,
    needs_review: rows.filter(
      (r) => r.reviewStatus !== "ok" && r.reviewStatus !== "sales_excluded",
    ).length,
  };
}
