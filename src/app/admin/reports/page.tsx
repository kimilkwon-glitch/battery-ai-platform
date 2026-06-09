import Link from "next/link";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { Badge } from "@/components/ui/badge";
import { buildErrorReport } from "@/lib/admin/data/error-report";

const SEVERITY_VARIANT = {
  high: "danger",
  medium: "warning",
  low: "muted",
} as const;

export default function AdminReportsPage() {
  const items = buildErrorReport();
  const high = items.filter((i) => i.severity === "high").length;

  return (
    <AdminShellLayout
      title="오류/검수 리포트"
      description="누락·충돌·CTA 오류를 한곳에서 확인합니다."
      summary={[
        { label: "항목", value: items.length },
        { label: "높음", value: high, tone: high > 0 ? "danger" : "default" },
        {
          label: "총 이슈",
          value: items.reduce((s, i) => s + i.count, 0),
          tone: "warning",
        },
      ]}
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="admin-panel p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900">{item.label}</h3>
              <Badge variant={SEVERITY_VARIANT[item.severity]}>{item.severity}</Badge>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{item.count}</p>
            <p className="text-[10px] text-slate-500">{item.category}</p>
            {item.href ? (
              <Link href={item.href} className="admin-btn admin-btn--secondary admin-btn--sm mt-3 inline-flex">
                상세
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </AdminShellLayout>
  );
}
