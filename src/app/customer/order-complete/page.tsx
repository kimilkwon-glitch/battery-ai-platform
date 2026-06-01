import { redirect } from "next/navigation";
import { BANK_TRANSFER_POLICY_LINKS } from "@/data/bank-transfer-policy";

export default function CustomerOrderCompleteAliasPage() {
  redirect(BANK_TRANSFER_POLICY_LINKS.orderCompleteDemo);
}
