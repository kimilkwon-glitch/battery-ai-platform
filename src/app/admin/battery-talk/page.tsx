import { redirect } from "next/navigation";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";

export default function AdminBatteryTalkRedirectPage() {
  redirect(`${ADMIN_ROUTES.inquiries}?type=consultation`);
}
