import { redirect } from "next/navigation";
import { ORDER_REQUEST_LOOKUP_PAGE } from "@/lib/customer-center-routes";

/** 비회원 주문조회 — 통합 조회 페이지로 안내 */
export default function GuestOrderCheckPage() {
  redirect(ORDER_REQUEST_LOOKUP_PAGE);
}
