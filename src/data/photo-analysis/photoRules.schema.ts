export type PhotoRiskRule = { condition: string; message: string; severity: "info" | "warning" | "danger" };

export type PhotoAnalysisRule = {
  sampleId: string;
  brand: string;
  labelText: string;
  matchedStandardSpec: string;
  ocrPatterns: string[];
  terminalExample: string;
  imagePath: string;
  photoQuality: "good" | "fair" | "poor";
  badPhotoReason: string;
  riskRules: PhotoRiskRule[];
  nextAction: { label: string; href: string };
  memo: string;
};
