import { AdminPageFrame, type AdminSummaryItem } from "@/components/admin/AdminPageFrame";
import { AdminShell } from "@/components/admin/AdminShell";
import { loadAdminNavBadges } from "@/lib/admin/data/nav-badges";
import type { ReactNode } from "react";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  summary?: AdminSummaryItem[];
};

/** 서버에서 네비 배지를 로드하고 공통 페이지 프레임을 적용 */
export async function AdminShellLayout({
  children,
  title,
  description,
  actions,
  summary,
}: Props) {
  const navBadges = await loadAdminNavBadges();
  const framed =
    title != null ? (
      <AdminPageFrame
        title={title}
        description={description}
        actions={actions}
        summary={summary}
      >
        {children}
      </AdminPageFrame>
    ) : (
      children
    );

  return <AdminShell navBadges={navBadges}>{framed}</AdminShell>;
}
