import { redirect } from "next/navigation";
import { CUSTOMER_CENTER_FAQ } from "@/lib/customer-center-routes";

export default function CustomerFaqAliasPage() {
  redirect(CUSTOMER_CENTER_FAQ);
}
