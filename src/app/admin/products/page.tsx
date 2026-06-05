import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminBatteriesTable } from "@/components/admin/AdminBatteriesTable";
import { buildAdminBatteryRows } from "@/lib/admin/data/batteries-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminProductsPage() {
  const rows = buildAdminBatteryRows();

  return (
    <AdminShellLayout
      title="상품/규격 관리"
      description="판매 규격·브랜드별 제품 코드 검수 — 별도 상품 DB 없이 배터리 규격 DB를 기준으로 표시합니다."
    >
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>표기 원칙</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-xs text-slate-600">
          <p>· 로케트 일반 배터리: GB 표기 (예: GB80L)</p>
          <p>· 쏠라이트 일반 배터리: CMF 표기 (예: CMF80L)</p>
          <p>· 고객 화면 브랜드명: 배터리매니저 (한글 우선)</p>
        </CardContent>
      </Card>
      <AdminBatteriesTable rows={rows} />
    </AdminShellLayout>
  );
}
