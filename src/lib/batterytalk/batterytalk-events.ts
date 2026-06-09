export type BatteryTalkTopic =
  | "spec"
  | "install"
  | "visit"
  | "order"
  | "battery_return"
  | "product"
  | "other";

export type BatteryTalkOpenDetail = {
  topic?: BatteryTalkTopic;
  batteryCode?: string;
  productCode?: string;
  productName?: string;
  vehicleSlug?: string;
  vehicleName?: string;
  fuelType?: string;
  orderSummary?: string;
  /** product 문의는 상품 Q&A로 보내지 않음 — 배터리톡 전체 상담 */
};

export const BATTERYTALK_OPEN_EVENT = "bm-open-batterytalk";

export function openBatteryTalk(detail?: BatteryTalkOpenDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BATTERYTALK_OPEN_EVENT, { detail }));
}
