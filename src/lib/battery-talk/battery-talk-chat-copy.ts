/** 배터리톡 채팅 UI 문구 */

export const BATTERY_TALK_SYSTEM_WELCOME =
  "배터리매니저입니다.\n상담 내용을 남겨주시면 확인 후 빠르게 안내드리겠습니다.";

export function batteryTalkSystemProductLine(productLabel: string): string {
  return `현재 보고 계신 상품 기준으로 상담이 접수됩니다.\n${productLabel}`;
}

export const BATTERY_TALK_QUICK_CHIPS = [
  { id: "spec", label: "규격 문의", message: "배터리 규격이 맞는지 확인 부탁드립니다." },
  { id: "install", label: "장착 가능", message: "제 차량에 장착 가능한지 알려주세요." },
  { id: "order", label: "주문/배송", message: "주문·배송 관련해서 문의드립니다." },
  { id: "battery_return", label: "폐배터리", message: "폐배터리 반납 관련 문의드립니다." },
] as const;

export const BATTERY_TALK_POLL_MS = 4000;
