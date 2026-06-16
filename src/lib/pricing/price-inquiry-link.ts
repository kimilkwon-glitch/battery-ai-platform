export type PriceInquiryProduct = {
  searchCode: string;
  displayName: string;
  brandLabel: string;
  pageUrl?: string;
};

export const PRODUCT_PRICE_INQUIRY_ROUTE = "/product-inquiry";

export function buildPriceInquiryHref(product: PriceInquiryProduct): string {
  const params = new URLSearchParams({
    inquiryKind: "price",
    productCode: product.searchCode,
    productName: product.displayName,
    specification: product.displayName,
    brand: product.brandLabel,
  });
  if (product.pageUrl) params.set("sourceUrl", product.pageUrl);
  return `${PRODUCT_PRICE_INQUIRY_ROUTE}?${params.toString()}`;
}

/** null/undefined/NaN만 가격문의 — 0원은 실제 가격 */
export function isCatalogPriceMissing(amount: number | null | undefined): boolean {
  return amount == null || !Number.isFinite(amount);
}
