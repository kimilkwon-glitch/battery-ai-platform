import { redirect } from "next/navigation";
import { CUSTOMER_MYPAGE } from "@/lib/customer-auth-routes";

export default function GuestOrderCompletePage() {
  redirect(CUSTOMER_MYPAGE);
}
