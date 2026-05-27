export type SymptomCause = { title: string; detail: string };
export type SymptomCheckItem = { label: string; value: string; detail?: string };

export type SymptomRule = {
  symptomId: string;
  symptomName: string;
  possibleCauses: SymptomCause[];
  riskLevel: "낮음" | "중간" | "높음" | "긴급";
  urgencyLevel: "즉시" | "48시간 내" | "7일 내" | "점검 권장";
  checkItems: SymptomCheckItem[];
  recommendedAction: string;
  relatedGuideIds: string[];
  relatedQaIds: string[];
  nextCta: { label: string; href: string };
  vehicleDbFirst: boolean;
  memo: string;
};

export type ProblemDetail = {
  slug: string;
  symptomId: string;
  title: string;
  summary: string;
  body: string;
  relatedGuideIds: string[];
  relatedQaIds: string[];
  status: "published" | "draft";
};
