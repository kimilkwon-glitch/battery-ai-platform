export type ImageManifestItem = {
  imageId: string;
  type: "vehicle" | "battery" | "guide" | "brand" | "photo-sample";
  targetId: string;
  fileName: string;
  path: string;
  alt: string;
  status: "active" | "missing" | "draft";
  fallbackPath: string;
  memo: string;
};
