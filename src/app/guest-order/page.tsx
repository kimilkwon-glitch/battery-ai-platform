import { redirect } from "next/navigation";
import { CHECKOUT_PAGE } from "@/lib/customer-center-routes";

/** 비회원 주문 — checkout으로 안내 (로그인 강제 없음) */
export default async function GuestOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const sp = await searchParams;
  const returnPath = sp.redirect?.trim() || CHECKOUT_PAGE;
  redirect(returnPath.startsWith("/") ? returnPath : CHECKOUT_PAGE);
}
