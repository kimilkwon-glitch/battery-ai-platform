import Link from "next/link";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminReviewBadge } from "@/components/admin/AdminReviewBadge";
import { OrderRequestWorkflowBadge } from "@/components/admin/order-requests/OrderRequestWorkflowBadge";
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
import type { AdminReviewStatus } from "@/types/admin";
import type { OrderRequestWorkflowStatus } from "@/types/order-request";

export const dynamic = "force-dynamic";

function vehicleReviewHref(status: AdminReviewStatus): string {
  if (
    status === "needs_review" ||
    status === "terminal_check" ||
    status === "agm_check" ||
    status === "db_fix_needed"
  ) {
    return ADMIN_ROUTES.matching;
  }
  if (status === "image_needed") return ADMIN_ROUTES.assets;
  return ADMIN_ROUTES.vehicles;
}

export default async function AdminDashboardPage() {
  const stats = await loadAdminDashboardStats();

  return (
    <AdminShellLayout
      title="대시보드"
      description="주문·DB·에셋·CTA 운영 현황을 한눈에 확인합니다."
    >
      <div className="space-y-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="오늘 주문"
            value={stats.todayOrders}
            href={ADMIN_ROUTES.orders}
            sublabel="오늘 접수된 주문/요청"
          />
          <AdminStatCard
            label="비회원 주문"
            value={stats.guestOrders}
            href={ADMIN_ROUTES.guestOrders}
            tone="info"
            sublabel="비회원으로 접수된 주문"
          />
          <AdminStatCard
            label="처리 대기"
            value={stats.pendingOrders}
            href={ADMIN_ROUTES.orders}
            tone="warning"
            sublabel="접수·확인중 상태 주문"
          />
          <AdminStatCard
            label="사진 확인 요청"
            value={stats.photoCheckRequests}
            href={ADMIN_ROUTES.photoRequests}
            tone="warning"
            sublabel="사진 첨부 확인 필요"
          />
          <AdminStatCard
            label="차량 매칭 확인"
            value={stats.vehicleMatchReview}
            href={ADMIN_ROUTES.matching}
            tone="warning"
            sublabel="확인 필요한 차량 DB"
          />
          <AdminStatCard
            label="배터리 DB 확인"
            value={stats.batteryDbReview}
            href={ADMIN_ROUTES.batteries}
            sublabel="제원·이미지 검수 필요"
          />
          <AdminStatCard
            label="차량 이미지 누락"
            value={stats.missingVehicleImages}
            href={ADMIN_ROUTES.assets}
            tone="danger"
            sublabel="대표 이미지가 없는 차량"
          />
          <AdminStatCard
            label="CTA/링크 오류"
            value={stats.ctaLinkErrors}
            href={ADMIN_ROUTES.ctaLinks}
            tone={stats.ctaLinkErrors > 0 ? "danger" : "default"}
            sublabel="연결 오류 의심 항목"
          />
        </section>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">최근 주문/문의</h2>
              <Link href={ADMIN_ROUTES.orders} className="admin-panel__link">
                전체 보기
              </Link>
            </div>
            <div className="overflow-x-auto">
              <Table className="admin-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>접수번호</TableHead>
                    <TableHead>접수일시</TableHead>
                    <TableHead>고객명</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>구분</TableHead>
                    <TableHead>차량명</TableHead>
                    <TableHead>배터리 규격</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>담당/지점</TableHead>
                    <TableHead className="text-right">상세보기</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="admin-table__empty">
                        아직 접수된 주문이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.recentOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="admin-table__mono">{o.requestNumber}</TableCell>
                        <TableCell>
                          {new Date(o.createdAt).toLocaleString("ko-KR", {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>{o.customerName}</TableCell>
                        <TableCell>{o.customerPhoneMasked}</TableCell>
                        <TableCell>
                          <Badge variant={o.customerType === "guest" ? "info" : "muted"}>
                            {o.customerType === "guest" ? "비회원" : "회원"}
                          </Badge>
                        </TableCell>
                        <TableCell>{o.vehicleSummary}</TableCell>
                        <TableCell>{o.batterySpecSummary}</TableCell>
                        <TableCell>
                          <OrderRequestWorkflowBadge
                            status={o.status as OrderRequestWorkflowStatus}
                          />
                        </TableCell>
                        <TableCell>{o.storeLabel ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`${ADMIN_ROUTES.orderRequests}?id=${o.id}`}
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            보기
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">확인 필요 차량 DB</h2>
              <Link href={ADMIN_ROUTES.vehicles} className="admin-panel__link">
                전체 보기
              </Link>
            </div>
            <div className="px-3 pb-2">
              {stats.recentVehicles.length === 0 ? (
                <p className="admin-table__empty">확인 필요한 항목이 없습니다.</p>
              ) : (
                <>
                  <div className="admin-vehicle-review-row border-b border-slate-100 pb-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                    <span>차량명</span>
                    <span>확인 사유</span>
                    <span>상태</span>
                    <span />
                  </div>
                  {stats.recentVehicles.map((v) => (
                    <div key={v.id} className="admin-vehicle-review-row">
                      <Link
                        href={vehicleReviewHref(v.reviewStatus ?? "needs_review")}
                        className="admin-vehicle-review-row__name"
                      >
                        {v.label}
                      </Link>
                      <span className="admin-vehicle-review-row__reason">
                        {v.reviewReason ?? v.sublabel ?? "—"}
                      </span>
                      {v.reviewStatus ? (
                        <AdminReviewBadge status={v.reviewStatus} />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                      <Link
                        href={vehicleReviewHref(v.reviewStatus ?? "needs_review")}
                        className="admin-vehicle-review-row__action"
                      >
                        바로가기 →
                      </Link>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShellLayout>
  );
}
