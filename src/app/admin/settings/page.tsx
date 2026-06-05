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
              Production: https://battery-ai-platform.vercel.app
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
        <Card>
          <CardHeader>
            <CardTitle>데이터 저장</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600">
            <p>주문 요청: .data/order-requests.json (개발용)</p>
            <p className="mt-2 text-slate-500">영구 DB(Supabase/Postgres) 연동은 추후 적용 예정</p>
          </CardContent>
        </Card>
      </div>
    </AdminShellLayout>
  );
}
