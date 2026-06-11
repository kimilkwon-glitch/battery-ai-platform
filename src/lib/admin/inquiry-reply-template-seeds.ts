import type {
  BatteryTalkReplyTemplate,
  BatteryTalkReplyTemplateCategory,
} from "@/types/battery-talk-reply-template";

export type InquiryReplyTemplateSeed = {
  id: string;
  label: string;
  body: string;
  category: BatteryTalkReplyTemplateCategory;
};

/** 상품문의·상담문의 공통 기본 템플릿 (빈 저장소 초기값에만 포함) */
export const INQUIRY_REPLY_TEMPLATE_SEEDS: InquiryReplyTemplateSeed[] = [
  {
    id: "vehicle_check",
    label: "차종 확인 요청",
    category: "spec",
    body: `안녕하세요. 배터리매니저입니다.
정확한 배터리 규격 확인을 위해 차량명, 연식, 유종을 함께 알려주시면 확인 후 안내드리겠습니다.`,
  },
  {
    id: "agm_check",
    label: "AGM 확인 안내",
    category: "spec",
    body: `안녕하세요. 배터리매니저입니다.
차량에 따라 일반 배터리와 AGM 배터리 적용이 달라질 수 있어, 차종과 연식을 확인한 뒤 안내드리겠습니다.`,
  },
  {
    id: "delivery_guide",
    label: "배송 안내",
    category: "delivery",
    body: `안녕하세요. 배터리매니저입니다.
택배 발송 상품은 발송 처리 후 운송장번호로 배송조회가 가능합니다. 송장 등록 후 주문조회 화면에서 확인하실 수 있습니다.`,
  },
  {
    id: "install_consult",
    label: "교체 상담 안내",
    category: "visit",
    body: `안녕하세요. 배터리매니저입니다.
내방 또는 출장 교체 가능 여부는 지역과 차량에 따라 달라질 수 있습니다. 차량 위치와 차종을 알려주시면 확인해드리겠습니다.`,
  },
  {
    id: "used_battery_return",
    label: "폐배터리 반납 안내",
    category: "return",
    body: `안녕하세요. 배터리매니저입니다.
폐배터리 반납 조건 상품은 기존 배터리 반납 기준으로 판매가가 적용됩니다. 반납 방법은 주문 방식에 따라 안내드리겠습니다.`,
  },
];

export function inquiryReplyTemplateSeedsToRecords(
  baseSortOrder: number,
  now: string,
): BatteryTalkReplyTemplate[] {
  return INQUIRY_REPLY_TEMPLATE_SEEDS.map((tpl, index) => ({
    id: `inq_tpl_${tpl.id}`,
    name: tpl.label,
    body: tpl.body,
    category: tpl.category,
    enabled: true,
    sortOrder: baseSortOrder + index,
    updatedAt: now,
  }));
}
