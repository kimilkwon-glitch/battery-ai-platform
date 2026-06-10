/** 배터리톡 상담 스레드 — 관리자 대화형 UI 전용 */

export type BatteryTalkThreadStatus = "waiting" | "active" | "done" | "hold";

export type BatteryTalkPageType =
  | "product"
  | "battery"
  | "vehicle"
  | "checkout"
  | "support"
  | "home"
  | "other";

export type BatteryTalkMessageSender = "customer" | "admin" | "system";

export type BatteryTalkMessage = {
  id: string;
  sender: BatteryTalkMessageSender;
  body: string;
  createdAt: string;
  /** 관리자 회수 처리 시각 — 내부 상담 기록용 */
  recalledAt?: string | null;
};

export const BATTERY_TALK_RECALLED_MESSAGE_LABEL = "관리자가 회수한 메시지입니다.";

export type BatteryTalkContext = {
  pageUrl?: string;
  pageType?: BatteryTalkPageType;
  topic?: string;
  productCode?: string;
  batteryCode?: string;
  productName?: string;
  vehicleSlug?: string;
  vehicleName?: string;
  selectedFuel?: string;
  orderId?: string;
  orderNumber?: string;
  cartSummary?: string;
  region?: string;
};

export type BatteryTalkThread = {
  threadId: string;
  source: "batterytalk";
  status: BatteryTalkThreadStatus;
  customerName: string;
  phone: string;
  userId?: string;
  isMember: boolean;
  messages: BatteryTalkMessage[];
  context: BatteryTalkContext;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  adminMemo?: string;
  assignedTo?: string;
  unreadByAdmin: boolean;
  /** 레거시 inquiries.json 마이그레이션 추적 */
  legacyInquiryId?: string;
};

export type BatteryTalkThreadSummary = {
  threadId: string;
  status: BatteryTalkThreadStatus;
  customerName: string;
  phone: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadByAdmin: boolean;
  hasProduct: boolean;
  hasOrder: boolean;
  vehicleName?: string;
  productName?: string;
  pageType?: BatteryTalkPageType;
};

export const BATTERY_TALK_STATUS_LABELS: Record<BatteryTalkThreadStatus, string> = {
  waiting: "대기",
  active: "진행중",
  done: "처리완료",
  hold: "보류",
};

export const BATTERY_TALK_PAGE_TYPE_LABELS: Record<BatteryTalkPageType, string> = {
  product: "상품상세",
  battery: "배터리상세",
  vehicle: "차량상세",
  checkout: "주문/결제",
  support: "고객센터",
  home: "홈",
  other: "기타",
};

export const BATTERY_TALK_REPLY_TEMPLATES = [
  {
    id: "spec",
    label: "규격 확인 요청",
    body: "정확한 규격 확인을 위해 차량 연식·연료와 현재 장착 배터리 라벨 사진을 보내 주시면 확인해 드리겠습니다.",
  },
  {
    id: "photo",
    label: "차량 사진 요청",
    body: "출장·장착 일정 안내를 위해 차량 전면 번호판과 배터리 장착 위치 사진을 보내 주시면 감사하겠습니다.",
  },
  {
    id: "visit",
    label: "출장 가능 지역 안내",
    body: "출장 교체는 부산·경남 일부 지역에서 가능합니다. 거주 지역(구/군)을 알려 주시면 방문 가능 여부를 안내해 드리겠습니다.",
  },
  {
    id: "return",
    label: "폐배터리 반납 안내",
    body: "폐배터리 반납은 출장·매장 장착 시 회수해 드리며, 택배 수령 후 자가 설치 시에는 가까운 수거처 안내를 도와드립니다.",
  },
  {
    id: "order",
    label: "주문/배송 안내",
    body: "주문·배송 상태를 확인해 드리겠습니다. 주문번호 또는 연락처를 알려 주시면 진행 상황을 안내해 드립니다.",
  },
  {
    id: "phone",
    label: "전화 상담 안내",
    body: "전화 상담을 원하시면 편하신 시간대를 남겨 주세요. 순서대로 연락드리겠습니다.",
  },
] as const;
