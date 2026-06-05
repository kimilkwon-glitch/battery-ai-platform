import { AdminShell } from "@/components/admin/AdminShell";
import { loadAdminNavBadges } from "@/lib/admin/data/nav-badges";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

/** 서버에서 네비 배지를 로드해 사이드바에 표시 */
export async function AdminShellLayout({ children, title, description }: Props) {
  const navBadges = await loadAdminNavBadges();
  return (
    <AdminShell title={title} description={description} navBadges={navBadges}>
      {children}
    </AdminShell>
  );
}
