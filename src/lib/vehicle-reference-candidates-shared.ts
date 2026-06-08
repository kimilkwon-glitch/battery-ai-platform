/** 클라이언트·서버 공용 타입/상수 (fs 미사용) */

export type ReferenceCandidateUrl = {
  imageUrl: string;
  thumbnailUrl: string | null;
  sourcePageUrl: string | null;
  sourceTitle: string;
  searchQuery: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  score?: number;
};

export type VehicleReferenceCandidateEntry = {
  slug: string;
  brand: string;
  imageFile: string;
  vehicleNameKo: string;
  vehicleNameEn: string;
  searchQueries: string[];
  candidateImages: ReferenceCandidateUrl[];
  selectedReferenceUrl: string | null;
  selectedReferenceReason: string | null;
  needsManualReview: boolean;
  generatedReferenceBasedImageUrl: string | null;
  generatedReferenceBasedExists: boolean;
  generatedReferenceBasedKontextImageUrl: string | null;
  generatedReferenceBasedKontextExists: boolean;
  generatedReferenceBasedKontextNext3ImageUrl: string | null;
  generatedReferenceBasedKontextNext3Exists: boolean;
  kontextSelectedReferenceUrl: string | null;
  kontextGenerationAllowed: boolean;
  kontextNext3SelectedReferenceUrl: string | null;
  kontextNext3GenerationAllowed: boolean;
};

export const TEST_REFERENCE_SLUGS = [
  "tucson-jm",
  "ssangyong-tivoli-air-2016",
  "ssangyong-tivoli-armour-2017",
  "kia-k9-2012",
  "chevrolet-cruze-2011",
] as const;

export const KONTEXT_TEST_SLUGS = ["ssangyong-tivoli-air-2016", "tucson-jm"] as const;

export const KONTEXT_NEXT3_SLUGS = [
  "ssangyong-tivoli-armour-2017",
  "kia-k9-2012",
  "chevrolet-cruze-2011",
] as const;
