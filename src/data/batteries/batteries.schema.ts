export type BatteryProduct = {
  batteryId: string;
  brand: string;
  brandSlug: string;
  productName: string;
  standardSpec: string;
  aliases: string[];
  ah: number;
  cca: number;
  terminalPosition: "L" | "R" | string;
  type: string;
  size: string;
  imagePath: string;
  /** 택배발송가·인터넷가 */
  internetPrice?: number | null;
  /** 출장교체가·출장가 */
  onsitePrice?: number | null;
  /** @deprecated internetPrice 사용 */
  price?: number | null;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "inquiry" | "unknown";
  productUrl: string | null;
  representativeVehicles: string[];
  cautions: string;
  returnCondition: string;
  deliveryAvailable: boolean;
  installAvailable: boolean;
  storePickupAvailable: boolean;
  memo: string;
};
