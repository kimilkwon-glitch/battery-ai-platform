import { redirect } from "next/navigation";

export default function GuideMaintenanceRedirectPage() {
  redirect("/guides?cat=maintenance");
}
