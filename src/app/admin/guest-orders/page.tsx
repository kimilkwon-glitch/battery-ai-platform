import { redirect } from "next/navigation";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";

export default function AdminGuestOrdersRedirectPage() {
  redirect(`${ADMIN_ROUTES.orders}?customerType=guest`);
}
