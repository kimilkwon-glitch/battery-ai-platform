export type TrendItem = {
  trendId: string;
  type: "vehicle" | "battery" | "keyword" | "caution" | "season" | "symptom";
  title: string;
  targetId: string;
  count: number;
  period: string;
  source: "site" | "operator" | "curated";
  isMock: boolean;
  relatedGuideIds: string[];
  memo: string;
};
