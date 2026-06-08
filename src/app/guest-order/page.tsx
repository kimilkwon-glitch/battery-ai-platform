import { redirect } from "next/navigation";

/** 비회원 주문 요청 비노출 — 로그인 후 checkout으로 안내 */
export default async function GuestOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const sp = await searchParams;
  const returnPath = sp.redirect?.trim() || "/checkout";
  redirect(`/login?redirect=${encodeURIComponent(returnPath)}`);
}
