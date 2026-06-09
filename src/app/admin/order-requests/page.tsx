import { redirect } from "next/navigation";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";

export default async function AdminOrderRequestsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = new URLSearchParams();
  q.set("orderType", "consult");
  const id = typeof params.id === "string" ? params.id : undefined;
  if (id) q.set("id", id);
  redirect(`${ADMIN_ROUTES.orders}?${q.toString()}`);
}
