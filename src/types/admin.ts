/** 관리자 운영 콘솔 공통 타입 */

export type AdminReviewStatus =
  | "ok"
  | "needs_review"
  | "terminal_check"
  | "agm_check"
  | "sales_excluded"
  | "image_needed"
  | "db_fix_needed";

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
  needsReview: boolean;
  hasAlias: boolean;
  detailHref: string;
  reviewMemo?: string;
  salesExcluded: boolean;
  reviewStatus: AdminReviewStatus;
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
  candidateBatteries: string[];
  terminalConflict: boolean;
  agmConflict: boolean;
  salesExcluded: boolean;
  missingImage: boolean;
  hasDetailPage: boolean;
  reviewStatus: AdminReviewStatus;
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
  recentOrders: AdminOrderRequestSummary[];
  recentVehicles: AdminRecentDbItem[];
  recentBatteries: AdminRecentDbItem[];
};

export type AdminOrderRequestSummary = {
  id: string;
  requestNumber: string;
  customerName: string;
  customerType: string;
  vehicleSummary: string;
  status: string;
  createdAt: string;
};

export type AdminRecentDbItem = {
  id: string;
  label: string;
  sublabel?: string;
  href?: string;
  updatedAt?: string;
};
