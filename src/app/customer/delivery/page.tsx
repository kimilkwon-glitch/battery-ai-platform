import { redirect } from "next/navigation";
import { CUSTOMER_CENTER_DELIVERY } from "@/lib/customer-center-routes";

export default function CustomerDeliveryAliasPage() {
  redirect(CUSTOMER_CENTER_DELIVERY);
}
