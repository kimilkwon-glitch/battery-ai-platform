export type BrandProfile = {
  brandId: string;
  brandSlug: string;
  displayName: string;
  manufacturerType: "vehicle" | "battery";
  country: string;
  description: string;
  featuredSpecs: string[];
  featuredVehicleIds: string[];
  featuredBatteryIds: string[];
  aliases: string[];
  imagePath: string;
  relatedGuideIds: string[];
  status: "active" | "draft" | "hidden";
  memo: string;
};
