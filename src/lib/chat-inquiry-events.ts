import {
  openBatteryTalk,
  BATTERYTALK_OPEN_EVENT,
  type BatteryTalkOpenDetail,
} from "@/lib/batterytalk/batterytalk-events";

export type ChatInquiryOpenDetail = BatteryTalkOpenDetail;
export type ChatInquiryVariant = "product" | "general";

export const CHAT_INQUIRY_OPEN_EVENT = BATTERYTALK_OPEN_EVENT;

export function openChatInquiry(detail?: ChatInquiryOpenDetail) {
  openBatteryTalk(detail);
}

export { openBatteryTalk };

export function openProductInquiry(detail: { batteryCode: string; vehicle?: string }) {
  openBatteryTalk({
    batteryCode: detail.batteryCode,
    vehicleName: detail.vehicle,
    topic: "product",
  });
}
