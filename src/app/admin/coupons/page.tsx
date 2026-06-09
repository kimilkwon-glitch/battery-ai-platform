import { redirect } from "next/navigation";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";

/** 레거시 쿠폰 페이지 — promotions로 통합 */
export default function AdminCouponsPage() {
  redirect(ADMIN_ROUTES.promotions);
}
