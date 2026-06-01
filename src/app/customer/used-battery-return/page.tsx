import { redirect } from "next/navigation";
import { CUSTOMER_CENTER_USED_BATTERY } from "@/lib/customer-center-routes";

export default function CustomerUsedBatteryAliasPage() {
  redirect(CUSTOMER_CENTER_USED_BATTERY);
}
