import { redirect } from "next/navigation";
import { CUSTOMER_CENTER_RETURN_EXCHANGE } from "@/lib/customer-center-routes";

export default function CustomerReturnExchangeAliasPage() {
  redirect(CUSTOMER_CENTER_RETURN_EXCHANGE);
}
