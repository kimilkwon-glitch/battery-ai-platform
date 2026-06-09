import { redirect } from "next/navigation";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";

export default async function AdminCommerceOrdersRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = new URLSearchParams();
  q.set("channel", "commerce");
  const orderId = typeof params.orderId === "string" ? params.orderId : undefined;
  const order = typeof params.order === "string" ? params.order : undefined;
  if (orderId) q.set("orderId", orderId);
  if (order) q.set("q", order);
  redirect(`${ADMIN_ROUTES.orders}?${q.toString()}`);
}
