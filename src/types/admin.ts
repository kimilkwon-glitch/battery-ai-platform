/** 관리자 운영 콘솔 공통 타입 */

export type AdminReviewStatus =
  | "ok"
  | "needs_review"
  | "terminal_check"
  | "agm_check"
  | "sales_excluded"
  | "image_needed"
  | "db_fix_needed";

export type BatteryMatchStatus = "matched" | "unmatched";
export type VehicleImageStatus = "present" | "missing";

export type AdminVehicleRow = {
  slug: string;
  brand: string;
  displayName: string;
  generationName?: string;
  yearRange: string;
  fuel: string;
  primaryBattery: string;
  candidateBatteries: string[];
  isAgm: boolean;
  terminalDirection: string;
  hasImage: boolean;
  /** @deprecated 차량 DB 검수 — vehicleStatus·reviewStatus 사용 */
  needsReview: boolean;
  hasAlias: boolean;
  detailHref: string;
  reviewMemo?: string;
  salesExcluded: boolean;
  /** 차량 DB·이미지·상세 검수 */
  reviewStatus: AdminReviewStatus;
  vehicleStatus: AdminReviewStatus;
  imageStatus: VehicleImageStatus;
  hasBatteryMatch: boolean;
  batteryMatchStatus: BatteryMatchStatus;
};

export type AdminBatteryRow = {
  specCode: string;
  brand: string;
  productName: string;
  capacityAh?: number;
  cca?: number;
  rc?: number;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  terminalDirection?: string;
  batteryType: "일반" | "AGM" | "DIN" | "기타";
  hasHeroImage: boolean;
  detailImageCount: number;
  detailHref: string;
  compareHref?: string;
  missingSpecs: boolean;
  adminMemo?: string;
  hidden: boolean;
};

export type AdminMatchingRow = {
  slug: string;
  vehicleName: string;
  yearRange: string;
  fuel: string;
  connectedBattery: string;
  /** 고객-facing 대표 규격 (operator 테이블) */
  customerFacingBattery?: string;
  /** 고객-facing source — operator_slug_primary | operator_fuel_map | none */
  batterySource?: string;
  candidateBatteries: string[];
  terminalConflict: boolean;
  agmConflict: boolean;
  salesExcluded: boolean;
  missingImage: boolean;
  hasDetailPage: boolean;
  reviewStatus: AdminReviewStatus;
  vehicleStatus: AdminReviewStatus;
  imageStatus: VehicleImageStatus;
  hasBatteryMatch: boolean;
  batteryMatchStatus: BatteryMatchStatus;
  reviewMemo?: string;
};

export type AdminAssetRow = {
  category: string;
  fileName: string;
  targetLabel: string;
  path: string;
  device: "pc" | "mobile" | "both";
  exists: boolean;
  previewPath?: string;
  usedOnPages: string[];
  missing: boolean;
  aspectIssue?: string;
};

export type AdminCtaLinkRow = {
  id: string;
  label: string;
  href: string;
  context: string;
  status: "ok" | "missing" | "suspect" | "external";
  note?: string;
};

export type AdminAliasRow = {
  alias: string;
  slug: string;
  canonicalName: string;
  displayName: string;
  hasImage: boolean;
  hasBatteryMatch: boolean;
  duplicate: boolean;
  unlinked: boolean;
};

export type AdminErrorReportItem = {
  id: string;
  category: string;
  severity: "high" | "medium" | "low";
  label: string;
  count: number;
  href?: string;
  samples?: string[];
};

export type AdminDashboardStats = {
  todayOrders: number;
  todayInquiries: number;
  guestOrders: number;
  pendingOrders: number;
  photoCheckRequests: number;
  vehicleMatchReview: number;
  batteryDbReview: number;
  missingVehicleImages: number;
  missingBatteryImages: number;
  ctaLinkErrors: number;
  productPriceMissing: number;
  productImageMissing: number;
  productDetailMissing: number;
  recentOrders: AdminOrderRequestSummary[];
  recentVehicles: AdminRecentDbItem[];
  recentBatteries: AdminRecentDbItem[];
};

export type AdminOrderRequestSummary = {
  id: string;
  requestNumber: string;
  customerName: string;
  customerPhoneMasked: string;
  customerType: string;
  vehicleSummary: string;
  batterySpecSummary: string;
  status: string;
  storeLabel?: string;
  createdAt: string;
};

export type AdminRecentDbItem = {
  id: string;
  label: string;
  sublabel?: string;
  href?: string;
  reviewStatus?: AdminReviewStatus;
  reviewReason?: string;
  updatedAt?: string;
};
