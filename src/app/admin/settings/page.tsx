import { AdminConsultationSettingsCard } from "@/components/admin/AdminConsultationSettingsCard";
import { AdminOperationalDataStatus } from "@/components/admin/AdminOperationalDataStatus";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { BUILD_STAMP } from "@/lib/build-stamp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <AdminShellLayout title="설정" description="운영 콘솔 환경 및 배포 정보">
      <div className="max-w-xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>배포 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-semibold text-slate-500">Build stamp:</span>{" "}
              <span className="font-mono">{BUILD_STAMP}</span>
            </p>
            <p className="text-xs text-slate-500">
              Production: https://www.batterymanager.co.kr
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>인증</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600">
            <p>
              httpOnly 세션 쿠키(bm_admin_session) · ADMIN_USERNAME + ADMIN_PASSWORD_HASH ·
              ADMIN_SESSION_SECRET
            </p>
            <p className="mt-2 text-slate-500">다중 운영자·RBAC·감사 로그는 추후 확장 예정</p>
          </CardContent>
        </Card>
        <AdminConsultationSettingsCard />
        <Card>
          <CardHeader>
            <CardTitle>데이터 저장 (Neon Postgres)</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminOperationalDataStatus />
            <p className="mt-3 text-xs text-slate-500">
              마이그레이션: npm run db:migrate:operational-data
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminShellLayout>
  );
}
