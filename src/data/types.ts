/**
 * Battery Manager — 운영 데이터 타입 정의
 * JSON/CSV 파일 스키마의 단일 소스. UI 타입(platform-types)과 매핑은 src/lib/data/* 에서 처리.
 */

/** vehicle-battery-db.json 레코드 확장 필드 (운영자 enrichment) */
export type VehicleBatteryEnrichment = {
  /** platform vehicle slug — e.g. sorento-mq4 */
  vehicleId: string;
  brand: string;
  model: string;
  generation?: string;
  years?: string;
  fuelType?: string;
  trim?: string;
  primaryBattery: string;
  batteryOptions?: string[];
  terminalDirection?: "L" | "R" | "양방향";
  status?: "confirmed" | "needs_review" | "raw";
  notes?: string;
  aliases?: string[];
  imagePath?: string;
  relatedVehicles?: string[];
  relatedGuides?: string[];
  relatedQuestions?: string[];
};

export type BatteryProductRecord = {
  batteryId: string;
  displayName: string;
  normalizedCode: string;
  brand: string;
  type: string;
  ah: number | null;
  cca: number | null;
  terminalDirection: "L" | "R" | string;
  sizeGroup?: string;
  dimensions?: string;
  imagePath?: string;
  /** 택배발송가·인터넷가 — null = 문의 필요 */
  internetPrice?: number | null;
  /** 출장교체가·출장가 */
  onsitePrice?: number | null;
  /** @deprecated internetPrice 사용 */
  price?: number | null;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "inquiry" | "unknown";
  compatibleVehicles?: string[];
  aliases?: string[];
  notes?: string;
  productUrl?: string;
  shopStatus: "active" | "inquiry_only" | "hidden" | "draft";
};

export type BrandMappingEntry = {
  rocket?: string;
  solite?: string;
  delkor?: string;
  varta?: string;
  infinit?: string;
  description?: string;
  terminalNote?: string;
};

export type BrandMappingDb = Record<string, BrandMappingEntry>;

export type ServiceCenterRecord = {
  centerId: string;
  name: string;
  region: string;
  city: string;
  district?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string;
  businessHours?: string;
  serviceTypes: string[];
  supportedBatteries: string[];
  supportedVehicles: string[];
  canVisit: boolean;
  canMobileService: boolean;
  canBmsRegister: boolean;
  canEv12v: boolean;
  canTruck: boolean;
  canPhotoCheck: boolean;
  /** UI 표시용 — 가짜 조회수 금지, 만족도 텍스트만 */
  ratingLabel?: string;
  notes?: string;
  bookingUrl?: string;
  /** false = 제휴처처럼 표시 금지 */
  isPartner: boolean;
  /** sample | partner | verified */
  dataSource: "sample" | "partner" | "verified";
  displayStatus: "active" | "hidden" | "draft";
  /** UI 거리 표시 (샘플용) */
  distanceLabel?: string;
  inquiryPrepare?: string[];
  expectedWorks?: string[];
  detailVehicleLabels?: string[];
};

export type QnaQuestionRecord = {
  questionId: string;
  title: string;
  shortAnswer: string;
  detailAnswer: string;
  category: string;
  tags: string[];
  relatedVehicleIds?: string[];
  relatedBatteryIds?: string[];
  relatedGuideIds?: string[];
  relatedComparisons?: [string, string][];
  status: "답변완료" | "답변중" | "전문가답변";
  questionType?: string;
  activityLabel?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SymptomRuleRecord = {
  symptomId: string;
  symptomName: string;
  description: string;
  possibleCauses: { title: string; detail: string }[];
  recommendedChecks: { label: string; value: string; detail?: string }[];
  /** 차량 DB 우선 — symptom 룰은 보조 */
  relatedBatteries?: string[];
  relatedGuides?: string[];
  urgencyLevel: "즉시" | "48시간 내" | "7일 내" | "점검 권장";
  warningText?: string;
  nextActions: { title: string; href: string }[];
  relatedSymptomIds?: string[];
};

export type PhotoAnalysisRules = {
  detectableLabels: string[];
  batteryCodePatterns: { pattern: string; example: string; note?: string }[];
  terminalDirectionRules: { rule: string; example?: string }[];
  brandPatterns: { brand: string; examples: string[]; note?: string }[];
  commonMistakes: { mistake: string; prevention: string }[];
  sampleImages?: { label: string; path?: string; brand?: string; code?: string }[];
  guideTexts: { title: string; body: string }[];
};

export type ImageManifestEntry = {
  assetId: string;
  type: "vehicle" | "battery" | "guide" | "photo-sample" | "brand";
  relatedId: string;
  path: string;
  aliases?: string[];
  fallbackPath?: string;
};

export type ActivityMeta = {
  source: "mock" | "site" | "api";
  description: string;
  replaceableWithApi: boolean;
};
