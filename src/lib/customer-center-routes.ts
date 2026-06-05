/** 고객센터·주문안내 URL — /customer 는 동일 경로로 리다이렉트 */

export const CUSTOMER_CENTER_HUB = "/support";
export const CUSTOMER_CENTER_FAQ = "/support/faq";
export const CUSTOMER_CENTER_ORDER_GUIDE = "/support/order-guide";
export const CUSTOMER_CENTER_DELIVERY = "/support/delivery";
export const CUSTOMER_CENTER_RETURN_EXCHANGE = "/support/return-exchange";
export const CUSTOMER_CENTER_USED_BATTERY = "/support/used-battery-return";
export const CUSTOMER_CENTER_MESSAGE_GUIDE = "/support/message-guide";
export const CUSTOMER_CENTER_ORDER_GUIDE_BANK_TRANSFER = `${CUSTOMER_CENTER_ORDER_GUIDE}#bank-transfer`;
export const ORDER_COMPLETE_DEMO_PAGE = "/order-complete";

/** 5차 장바구니 설계 미리보기 (실제 /cart 기능 아님) */
export const CART_DESIGN_PAGE = "/cart-design";

/** 6차 localStorage 장바구니 */
export const CART_PAGE = "/cart";

/** 7차 결제 전 최종 확인 (실제 PG·주문 DB 없음) */
export const CHECKOUT_PAGE = "/checkout";

/** 8차 상담 주문 요청 (localStorage, 서버 접수 없음) */
export const ORDER_REQUEST_PAGE = "/order-request";
export const ORDER_REQUEST_COMPLETE_PAGE = "/order-request/complete";
/** 13차 — 상담 주문 요청 조회 (결제 주문조회 아님) */
export const ORDER_REQUEST_LOOKUP_PAGE = "/order-request/lookup";

/** 비회원 주문조회 안내 앵커 (주문 안내 페이지) */
export const CUSTOMER_CENTER_GUEST_ORDER = `${CUSTOMER_CENTER_ORDER_GUIDE}#guest-order`;

export {
  GUEST_ORDER_PAGE,
  GUEST_ORDER_COMPLETE_PAGE,
  GUEST_ORDER_CHECK_PAGE,
} from "@/lib/guest-order/guest-order-routes";

/** @deprecated — HUB_SUPPORT 와 동일. 신규 코드는 CUSTOMER_CENTER_* 사용 */
export { HUB_SUPPORT } from "@/lib/customer-hub-routes";
