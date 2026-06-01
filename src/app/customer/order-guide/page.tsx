import { redirect } from "next/navigation";
import { CUSTOMER_CENTER_ORDER_GUIDE } from "@/lib/customer-center-routes";

export default function CustomerOrderGuideAliasPage() {
  redirect(CUSTOMER_CENTER_ORDER_GUIDE);
}
