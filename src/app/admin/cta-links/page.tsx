import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminCtaLinksTable } from "@/components/admin/AdminCtaLinksTable";
import { buildCtaLinkAuditRows } from "@/lib/admin/data/cta-links-audit";
import { storeLinks } from "@/lib/external-links";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCtaLinksPage() {
  const rows = buildCtaLinkAuditRows();

  return (
    <AdminShellLayout title="CTA/링크 점검" description="메인·상세·지점·외부 채널 연결을 점검합니다.">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>지점 정보 기준</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
          <div>
            <p className="font-bold">덕천점</p>
            <p>부산 북구 의성로 122 / {storeLinks.deokcheon.phone}</p>
          </div>
          <div>
            <p className="font-bold">학장점</p>
            <p>부산 사상구 학감대로 171 / {storeLinks.hakjang.phone}</p>
          </div>
        </CardContent>
      </Card>
      <AdminCtaLinksTable rows={rows} />
    </AdminShellLayout>
  );
}
