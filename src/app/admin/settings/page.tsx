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
            <p>세션 쿠키(bm_admin_session) + ADMIN_ACCESS_KEY 기반 단일 운영자 인증</p>
            <p className="mt-2 text-amber-700">TODO: 다중 운영자 계정·RBAC·감사 로그</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>데이터 저장</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600">
            <p>주문 요청: .data/order-requests.json (개발용)</p>
            <p className="mt-2 text-amber-700">TODO: Supabase/Postgres 영구 DB 연동</p>
          </CardContent>
        </Card>
      </div>
    </AdminShellLayout>
  );
}
