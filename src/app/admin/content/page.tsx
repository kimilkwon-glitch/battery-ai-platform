import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { AdminContentClient } from "@/components/admin/AdminContentClient";
import { verifyAdminAccessKey } from "@/lib/admin/adminAccess";
import { getAdminContentItems } from "@/lib/admin/getAdminContentItems";

type Props = {
  searchParams: Promise<{ key?: string }>;
};

export default async function AdminContentPage({ searchParams }: Props) {
  const { key } = await searchParams;

  if (!verifyAdminAccessKey(key)) {
    return <AdminAccessDenied />;
  }

  const { items, source } = getAdminContentItems();

  return <AdminContentClient initialItems={items} dataSource={source} />;
}
