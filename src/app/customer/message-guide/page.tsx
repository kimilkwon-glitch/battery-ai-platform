import { redirect } from "next/navigation";
import { CUSTOMER_CENTER_MESSAGE_GUIDE } from "@/lib/customer-center-routes";

export default function CustomerMessageGuideAliasPage() {
  redirect(CUSTOMER_CENTER_MESSAGE_GUIDE);
}
