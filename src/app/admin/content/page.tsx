import { AdminContentClient } from "@/components/admin/AdminContentClient";
import { getAdminContentItems } from "@/lib/admin/getAdminContentItems";

export default function AdminContentPage() {
  const { items, source } = getAdminContentItems();
  return <AdminContentClient initialItems={items} dataSource={source} />;
}
