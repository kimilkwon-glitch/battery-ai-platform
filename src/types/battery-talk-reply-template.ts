export type BatteryTalkReplyTemplateCategory =
  | "spec"
  | "photo"
  | "visit"
  | "delivery"
  | "return"
  | "phone"
  | "other";

export const BATTERY_TALK_REPLY_TEMPLATE_CATEGORY_LABELS: Record<
  BatteryTalkReplyTemplateCategory,
  string
> = {
  spec: "규격확인",
  photo: "사진요청",
  visit: "출장안내",
  delivery: "배송안내",
  return: "반품안내",
  phone: "전화상담",
  other: "기타",
};

export type BatteryTalkReplyTemplate = {
  id: string;
  name: string;
  body: string;
  category: BatteryTalkReplyTemplateCategory;
  enabled: boolean;
  sortOrder: number;
  updatedAt: string;
};
