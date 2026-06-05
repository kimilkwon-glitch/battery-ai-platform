import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { loadAdminDashboardStats } from "@/lib/admin/data/dashboard-stats";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await loadAdminDashboardStats();

  return (
    <AdminShell
      title="대시보드"
      description="주문·DB·에셋·CTA 운영 현황을 한눈에 확인합니다."
    >
      <div className="space-y-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="오늘 주문" value={stats.todayOrders} href={ADMIN_ROUTES.orders} />
          <AdminStatCard
            label="비회원 주문"
            value={stats.guestOrders}
            href={ADMIN_ROUTES.guestOrders}
            tone="info"
          />
          <AdminStatCard
            label="처리 대기"
            value={stats.pendingOrders}
            href={ADMIN_ROUTES.orders}
            tone="warning"
          />
          <AdminStatCard
            label="사진 확인 요청"
            value={stats.photoCheckRequests}
            href={ADMIN_ROUTES.photoRequests}
            tone="warning"
          />
          <AdminStatCard
            label="차량 매칭 확인"
            value={stats.vehicleMatchReview}
            href={ADMIN_ROUTES.matching}
            tone="warning"
          />
          <AdminStatCard
            label="배터리 DB 확인"
            value={stats.batteryDbReview}
            href={ADMIN_ROUTES.batteries}
          />
          <AdminStatCard
            label="차량 이미지 누락"
            value={stats.missingVehicleImages}
            href={ADMIN_ROUTES.assets}
            tone="danger"
          />
          <AdminStatCard
            label="CTA/링크 오류"
            value={stats.ctaLinkErrors}
            href={ADMIN_ROUTES.ctaLinks}
            tone={stats.ctaLinkErrors > 0 ? "danger" : "default"}
          />
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                최근 주문/문의
                <Link href={ADMIN_ROUTES.orders} className="text-xs font-semibold text-blue-600">
                  전체 보기
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>접수번호</TableHead>
                    <TableHead>고객</TableHead>
                    <TableHead>구분</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500">
                        아직 접수된 주문이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.recentOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-[10px]">{o.requestNumber}</TableCell>
                        <TableCell>{o.customerName}</TableCell>
                        <TableCell>
                          <Badge variant={o.customerType === "guest" ? "info" : "muted"}>
                            {o.customerType === "guest" ? "비회원" : "회원"}
                          </Badge>
                        </TableCell>
                        <TableCell>{o.status}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                확인 필요 차량 DB
                <Link href={ADMIN_ROUTES.vehicles} className="text-xs font-semibold text-blue-600">
                  전체 보기
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.recentVehicles.length === 0 ? (
                <p className="text-xs text-slate-500">확인 필요 항목이 없습니다.</p>
              ) : (
                stats.recentVehicles.map((v) => (
                  <div key={v.id} className="flex items-center justify-between text-xs">
                    <Link href={v.href ?? "#"} className="font-semibold text-blue-700 hover:underline">
                      {v.label}
                    </Link>
                    <span className="text-slate-500">{v.sublabel}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
