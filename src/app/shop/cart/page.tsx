import { redirect } from "next/navigation";

/** 레거시 /shop/cart — 통합 장바구니로 이동 */
export default function ShopCartPage() {
  redirect("/cart");
}
