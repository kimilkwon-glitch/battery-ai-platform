import { redirect } from "next/navigation";
import { CUSTOMER_CENTER_HUB } from "@/lib/customer-center-routes";

export default function CustomerAliasPage() {
  redirect(CUSTOMER_CENTER_HUB);
}
