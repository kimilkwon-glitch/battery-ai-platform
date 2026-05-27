/** 차량 브랜드·모델 키 — sonata, avante 등 확장용 */
export type CarBrandKey = "hyundai" | "kia";

export type CarModelKey = "grandeur" | "sonata" | "avante" | "santa_fe" | "tucson";

export type CarBatteryTypeLabel = "일반" | "DIN" | "AGM" | "혼합";

export type CarFuelOption = {
  id: string;
  label: string;
  /** platform-catalog 배터리 code — 추후 DB FK */
  batteryCode: string;
  batteryType: CarBatteryTypeLabel;
  note?: string;
};

/**
 * 세대 단위 차량 레코드 (파일명 기준 이미지 매칭)
 * imageFile: grandeur_tg.png → /assets/cars/hyundai/grandeur_tg.png
 */
export type CarGeneration = {
  id: string;
  brandKey: CarBrandKey;
  modelKey: CarModelKey;
  displayName: string;
  shortName: string;
  yearRange: string;
  imageFile: string;
  batteryType: CarBatteryTypeLabel;
  agm: string;
  din: string;
  isg: boolean;
  smartCharge: boolean;
  summary: string;
  /** BatteryAI platform Vehicle.id */
  platformVehicleId: string;
  defaultBatteryCode: string;
  fuels: CarFuelOption[];
};

export type CarModelHub = {
  brandKey: CarBrandKey;
  modelKey: CarModelKey;
  displayName: string;
  description: string;
  href: string;
  generationCount: number;
  coverImageFile?: string;
};
