import { redirect } from "next/navigation";
import { COMMERCE_ORDER_LOOKUP_PAGE } from "@/lib/customer-center-routes";

/** 비회원 주문조회 — commerce 주문 조회로 안내 */
export default function GuestOrderCheckPage() {
  redirect(COMMERCE_ORDER_LOOKUP_PAGE);
}
