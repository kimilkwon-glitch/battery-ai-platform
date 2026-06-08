import { redirect } from "next/navigation";
import { CUSTOMER_MYPAGE } from "@/lib/customer-auth-routes";

export default function OrderRequestCompletePage() {
  redirect(CUSTOMER_MYPAGE);
}
