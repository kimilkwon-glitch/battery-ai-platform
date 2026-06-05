import Link from "next/link";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildErrorReport } from "@/lib/admin/data/error-report";

const SEVERITY_VARIANT = {
  high: "danger",
  medium: "warning",
  low: "muted",
} as const;

export default function AdminReportsPage() {
  const items = buildErrorReport();

  return (
    <AdminShellLayout
      title="오류/검수 리포트"
      description="운영자가 한 번에 확인해야 할 누락·충돌·CTA 오류를 모아 표시합니다."
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">{item.label}</CardTitle>
                <Badge variant={SEVERITY_VARIANT[item.severity]}>{item.severity}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-2xl font-black text-slate-900">{item.count}</p>
              <p className="text-[10px] text-slate-500">{item.category}</p>
              {item.samples?.length ? (
                <p className="text-[10px] text-slate-600">
                  예: {item.samples.join(", ")}
                </p>
              ) : null}
              {item.href ? (
                <Link href={item.href} className="text-xs font-bold text-blue-600 hover:underline">
                  상세 화면 →
                </Link>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShellLayout>
  );
}
