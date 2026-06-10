/** 관리자 제품 관리 타입 */

export type AdminProductBrand = "rocket" | "solite" | "delco" | "atlas";

export type AdminProductSaleStatus = "selling" | "hidden" | "stopped";

export type AdminProductReviewStatus =
  | "ok"
  | "needs_review"
  | "price_missing"
  | "image_missing"
  | "detail_missing"
  | "notation_check"
  | "sales_excluded";

export type AdminProductFulfillmentPrices = {
  delivery: number | null;
  onsiteInstall: number | null;
  storeInstall: number | null;
  storePickupSelf: number | null;
};

export type AdminProductRow = {
  productId: string;
  brand: AdminProductBrand;
  brandLabel: string;
  batteryCode: string;
  adminName: string;
  displayName: string;
  seoNameCandidate: string;
  internetPrice: number | null;
  onsitePrice: number | null;
  fulfillmentPrices: AdminProductFulfillmentPrices;
  saleStatus: AdminProductSaleStatus;
  visible: boolean;
  sellable: boolean;
  hasHeroImage: boolean;
  hasDetailPage: boolean;
  detailHref: string;
  imageStatus: "ok" | "missing";
  detailPageStatus: "ok" | "missing" | "thin";
  reviewStatus: AdminProductReviewStatus;
  reviewLabels: string[];
  vehicleKeywords: string[];
  memo: string;
  updatedAt: string;
};

export type AdminProductDetail = AdminProductRow & {
  description: string;
  cautions: string;
  detailContent: {
    summary: string;
    highlights: string[];
    vehicleGuide: string;
    fulfillmentGuide: string;
    returnGuide: string;
    agmGuide: string;
    preOrderChecks: string[];
  };
  excludeVehicleKeywords: string[];
  relatedBatteries: string[];
  relatedVehicles: string[];
};

export type AdminProductOverride = {
  displayName?: string;
  adminName?: string;
  seoNameCandidate?: string;
  internetPrice?: number | null;
  onsitePrice?: number | null;
  saleStatus?: AdminProductSaleStatus;
  reviewStatusOverride?: AdminProductReviewStatus;
  visible?: boolean;
  sellable?: boolean;
  memo?: string;
  description?: string;
  cautions?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type AdminProductPriceHistoryEntry = {
  id: string;
  productId: string;
  field: string;
  previousValue: string | number | null;
  nextValue: string | number | null;
  changedBy: string;
  reason?: string;
  createdAt: string;
};

export type AdminProductImportPreviewRow = {
  productId: string;
  brand: string;
  batteryCode: string;
  status: "success" | "failed" | "unchanged" | "needs_review";
  message?: string;
  changes: { field: string; before: string; after: string }[];
};
