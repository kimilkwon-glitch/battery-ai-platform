import { CUSTOMER_CENTER_HUB } from "@/lib/customer-center-routes";

export type PriceInquiryProduct = {
  searchCode: string;
  displayName: string;
  brandLabel: string;
  pageUrl?: string;
};

export function buildPriceInquiryHref(product: PriceInquiryProduct): string {
  const params = new URLSearchParams({
    tab: "inquiry",
    inquiryKind: "price",
    productCode: product.searchCode,
    productName: product.displayName,
    brand: product.brandLabel,
  });
  if (product.pageUrl) params.set("from", product.pageUrl);
  return `${CUSTOMER_CENTER_HUB}?${params.toString()}#support-inquiry`;
}

export function isCatalogPriceMissing(amount: number | null | undefined): boolean {
  return amount == null || !Number.isFinite(amount);
}
