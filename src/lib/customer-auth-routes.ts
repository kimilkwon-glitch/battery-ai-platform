/** 고객 인증·계정 관련 URL */

export const CUSTOMER_LOGIN_PAGE = "/login" as const;
export const CUSTOMER_SIGNUP_PAGE = "/signup" as const;
export const CUSTOMER_MYPAGE = "/mypage" as const;

export {
  GUEST_ORDER_PAGE,
  GUEST_ORDER_CHECK_PAGE,
} from "@/lib/guest-order/guest-order-routes";

export { HUB_PHOTO } from "@/lib/customer-hub-routes";
