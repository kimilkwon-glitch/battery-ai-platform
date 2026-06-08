/** 택배 주문 UI — 반납/미반납 (가격 정책 연결 필요: 실제 금액은 상담 시 안내) */

import type { OrderRequestUsedBatteryOption } from "@/types/order-request";

export type BatteryReturnOption = "return" | "no-return";

/** 상품상세/장바구니 → 주문 가격 계산용 */
export function mapShopReturnOptionToUsedBattery(
  option: BatteryReturnOption,
): Extract<OrderRequestUsedBatteryOption, "return" | "no_return"> {
  return option === "no-return" ? "no_return" : "return";
}

export const BATTERY_RETURN_OPTIONS: {
  id: BatteryReturnOption;
  label: string;
  description: string;
}[] = [
  {
    id: "return",
    label: "폐배터리 반납",
    description: "기존 배터리를 회수·반납하는 조건으로 주문 상담합니다.",
  },
  {
    id: "no-return",
    label: "폐배터리 미반납",
    description: "기존 배터리 반납 없이 신규 배터리만 구매하는 조건입니다.",
  },
];
