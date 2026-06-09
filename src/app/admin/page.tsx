import Link from "next/link";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { AdminTodayTasks } from "@/components/admin/AdminTodayTasks";
import { AdminReviewBadge } from "@/components/admin/AdminReviewBadge";
import { OrderRequestWorkflowBadge } from "@/components/admin/order-requests/OrderRequestWorkflowBadge";
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
  if (status === "image_needed") return ADMIN_ROUTES.vehicleImageReview;
  return ADMIN_ROUTES.vehicles;
}

export default async function AdminDashboardPage() {
  const stats = await loadAdminDashboardStats();

  return (
    <AdminShellLayout
      title="대시보드"
      description="오늘 처리할 일과 운영 현황을 확인합니다."
    >
      <div className="admin-dashboard space-y-6">
        <AdminTodayTasks tasks={stats.todayTasks} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2 className="admin-panel__title">최근 주문</h2>
              <Link href={ADMIN_ROUTES.orderRequests} className="admin-panel__link">
                전체 보기
              </Link>
            </div>
            <div className="admin-data-table__wrap admin-data-table__wrap--sticky overflow-x-auto">
              <Table className="admin-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>접수번호</TableHead>
                    <TableHead>고객명</TableHead>
                    <TableHead>상품</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>접수일</TableHead>
                    <TableHead className="text-right">상세</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="admin-table__empty">
                        아직 접수된 주문이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.recentOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="admin-table__mono">{o.requestNumber}</TableCell>
                        <TableCell>{o.customerName}</TableCell>
                        <TableCell>{o.batterySpecSummary}</TableCell>
                        <TableCell>
                          <OrderRequestWorkflowBadge
                            status={o.status as OrderRequestWorkflowStatus}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(o.createdAt).toLocaleString("ko-KR", {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`${ADMIN_ROUTES.orderRequests}?id=${o.id}`}
                            className="admin-btn admin-btn--secondary admin-btn--md"
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
              <h2 className="admin-panel__title">확인 필요 · 검수</h2>
              <Link href={ADMIN_ROUTES.reports} className="admin-panel__link">
                리포트
              </Link>
            </div>
            <div className="px-3 pb-3">
              {stats.recentVehicles.length === 0 ? (
                <p className="admin-table__empty">확인 필요한 항목이 없습니다.</p>
              ) : (
                <>
                  <div className="admin-vehicle-review-row border-b border-slate-100 pb-2 text-xs font-extrabold uppercase tracking-wide text-slate-400">
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
              {stats.recentBatteries.length > 0 ? (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-xs font-bold text-slate-500">최근 변경 상품</p>
                  <ul className="mt-2 space-y-2">
                    {stats.recentBatteries.map((b) => (
                      <li key={b.id}>
                        <Link href={b.href ?? ADMIN_ROUTES.products} className="text-sm font-bold text-blue-600 hover:underline">
                          {b.label}
                        </Link>
                        {b.sublabel ? (
                          <span className="ml-2 text-xs text-slate-500">{b.sublabel}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </AdminShellLayout>
  );
}
