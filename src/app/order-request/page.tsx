import { redirect } from "next/navigation";
import { CHECKOUT_PAGE } from "@/lib/customer-center-routes";

/** 상담 주문 입력은 /checkout 에서 일괄 처리 */
export default function OrderRequestPage() {
  redirect(CHECKOUT_PAGE);
}
