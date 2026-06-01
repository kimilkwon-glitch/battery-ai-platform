import { redirect } from "next/navigation";
import { CART_DESIGN_PAGE } from "@/data/cart-flow-guide";

/** 5차 설계 미리보기 — /cart-design 으로 통합 */
export default function CustomerCartGuideRedirectPage() {
  redirect(CART_DESIGN_PAGE);
}
