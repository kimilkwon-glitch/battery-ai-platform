import { redirect } from "next/navigation";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";

export default function AdminProductQnaRedirectPage() {
  redirect(`${ADMIN_ROUTES.inquiries}?type=product`);
}
