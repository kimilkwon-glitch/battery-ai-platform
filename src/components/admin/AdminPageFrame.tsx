import Link from "next/link";
import type { ReactNode } from "react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";

export type AdminSummaryItem = {
  label: string;
  value: number | string;
  href?: string;
  tone?: "default" | "warning" | "danger" | "info";
  sublabel?: string;
};

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  summary?: AdminSummaryItem[];
  children: ReactNode;
};

/** 관리자 페이지 공통: 제목 · 설명 · 요약 · 본문 */
export function AdminPageFrame({ title, description, actions, summary, children }: Props) {
  return (
    <div className="admin-page-frame space-y-3">
      <header className="admin-page-frame__header">
        <div className="min-w-0 flex-1">
          <h1 className="admin-page-title">{title}</h1>
          {description ? <p className="admin-page-desc">{description}</p> : null}
        </div>
        {actions ? <div className="admin-page-frame__actions">{actions}</div> : null}
      </header>

      {summary && summary.length > 0 ? (
        <section className="admin-page-frame__summary grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map((item) =>
            item.href ? (
              <AdminStatCard
                key={item.label}
                label={item.label}
                value={item.value}
                href={item.href}
                tone={item.tone}
                sublabel={item.sublabel}
              />
            ) : (
              <div key={item.label} className="admin-stat-card">
                <p className="admin-stat-card__label">{item.label}</p>
                <p className="admin-stat-card__value admin-stat-card__value--default">{item.value}</p>
                {item.sublabel ? <p className="admin-stat-card__sublabel">{item.sublabel}</p> : null}
              </div>
            ),
          )}
        </section>
      ) : null}

      <div className="admin-page-frame__body">{children}</div>
    </div>
  );
}

export function AdminTableActionLink({
  href,
  label = "상세",
  external,
}: {
  href: string;
  label?: string;
  external?: boolean;
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="admin-btn admin-btn--secondary admin-btn--md"
      >
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className="admin-btn admin-btn--secondary admin-btn--md">
      {label}
    </Link>
  );
}
