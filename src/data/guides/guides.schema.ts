export type GuideSection = {
  heading: string;
  body: string;
};

export type GuideContent = {
  guideId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  relatedVehicleIds: string[];
  relatedBatteryIds: string[];
  imagePath: string;
  sections: GuideSection[];
  ctaType: "compare" | "photo" | "vehicle" | "qa" | "service" | "none";
  priority: number;
  status: "published" | "draft" | "hidden";
};
