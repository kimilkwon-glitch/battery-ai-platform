/** 검색 품질 QA API 응답 스키마 */

export type SearchQADetectedIntent =
  | "vehicle"
  | "vehicle_year"
  | "vehicle_generation"
  | "vehicle_fuel"
  | "battery_code"
  | "symptom"
  | "service"
  | "shipping"
  | "store"
  | "photo_check"
  | "qa"
  | "unknown";

export type SearchQASuccessType =
  | "immediate_confirmed"
  | "year_branch"
  | "generation_select"
  | "fuel_trim_branch"
  | "battery_code"
  | "symptom_qa"
  | "service_purchase"
  | "unknown";

export type SearchQAWarning = {
  level: "info" | "caution" | "error";
  message: string;
  reason: string;
};

export type SearchQAResult = {
  query: string;
  normalizedQuery: string;
  detectedIntent: SearchQADetectedIntent;
  successType: SearchQASuccessType;
  summary: string;
  recognized: boolean;
  primaryResult: {
    type: "vehicle" | "battery" | "symptom" | "service" | "qa" | "none";
    title: string;
    slug: string;
    url: string;
    batteryCodes: string[];
    reason: string;
  };
  vehicleResults: Array<{
    title: string;
    slug: string;
    url: string;
    generation: string;
    yearRange: string;
    fuel: string;
    batteryCodes: string[];
    matchScore: number;
    matchReason: string;
  }>;
  batteryResults: Array<{
    code: string;
    brandExamples: string[];
    url: string;
    applicableVehicles: string[];
    matchScore: number;
    matchReason: string;
  }>;
  generationCards: Array<{
    title: string;
    url: string;
    batteryCodes: string[];
    guideText: string;
  }>;
  branchGuide: {
    visible: boolean;
    message: string;
    branches: Array<{
      label: string;
      condition: string;
      batteryCodes: string[];
      url: string;
    }>;
  };
  relatedQa: Array<{
    title: string;
    url: string;
    relatedBatteryCodes: string[];
    relatedVehicleSlugs: string[];
    matchReason: string;
  }>;
  ctas: Array<{
    label: string;
    url: string;
    priority: "primary" | "secondary" | "tertiary";
    reason: string;
  }>;
  warnings: SearchQAWarning[];
  debug: {
    matchedTokens: string[];
    rankingRules: string[];
    excludedResults: string[];
    dataSource: string[];
    searchType?: string;
    vehiclesTotal: number;
    uxMode: string;
  };
};
