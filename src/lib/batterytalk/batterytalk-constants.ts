import type { BatteryTalkTopic } from "@/lib/batterytalk/batterytalk-events";

export type { BatteryTalkOpenDetail, BatteryTalkTopic } from "@/lib/batterytalk/batterytalk-events";
export { openBatteryTalk, BATTERYTALK_OPEN_EVENT } from "@/lib/batterytalk/batterytalk-events";

export const BATTERYTALK_TOPIC_LABELS: Record<BatteryTalkTopic, string> = {
  spec: "규격 문의",
  visit: "출장 문의",
  order: "주문/배송",
  battery_return: "폐배터리",
  product: "상품 문의",
  install: "장착 가능",
  other: "기타",
};
