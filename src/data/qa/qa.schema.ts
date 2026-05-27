export type QaItem = {
  qaId: string;
  question: string;
  shortAnswer: string;
  fullAnswer: string;
  category: string;
  tags: string[];
  relatedVehicleIds: string[];
  relatedBatteryIds: string[];
  relatedGuideIds: string[];
  relatedCompareIds: string[];
  ctaType: "compare" | "photo" | "vehicle" | "guide" | "service" | "none";
  status: "published" | "draft" | "hidden";
};
