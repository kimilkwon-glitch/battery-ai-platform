import Link from "next/link";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { AdminDashboardCardTone, AdminRecentUnifiedOrder, AdminTodayTaskItem } from "@/types/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  actionCards: AdminTodayTaskItem[];
  recentOrders: AdminRecentUnifiedOrder[];
};

function toneClass(tone: AdminDashboardCardTone | undefined, count: number): string {
  if (count === 0) return "zero";
  switch (tone) {
    case "urgent":
      return "urgent";
    case "progress":
      return "progress";
    case "done":
      return "done";
    case "warn":
      return "warn";
    default:
      return "info";
  }
}

function orderDetailHref(row: AdminRecentUnifiedOrder): string {
  if (row.channel === "commerce") {
    return `${ADMIN_ROUTES.orders}?view=new_order&orderId=${encodeURIComponent(row.id)}`;
  }
  return `${ADMIN_ROUTES.orders}?view=new_order&id=${encodeURIComponent(row.id)}`;
}

export function AdminSmartStoreDashboard({ actionCards, recentOrders }: Props) {
  return (
    <div className="admin-dashboard space-y-6">
      <section className="admin-panel border-blue-100 bg-gradient-to-br from-slate-50 to-white">
        <div className="admin-panel__header border-b border-slate-100">
          <div>
            <h2 className="admin-panel__title text-lg">주문 처리 현황</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              숫자를 클릭하면 해당 주문 목록으로 이동합니다. 기본 집계는 실제 주문만 포함합니다.
            </p>
          </div>
        </div>
        <div className="p-3">
          <div className="admin-dashboard-section__grid admin-dashboard-section__grid--5">
            {actionCards.map((item) => {
              const tone = toneClass(item.tone, item.count);
              return (
                <Link key={item.href} href={item.href} className="group block">
                  <div className={`admin-stat-card admin-stat-card--${tone} h-full`}>
                    <p className="admin-stat-card__label flex items-center justify-between gap-2">
                      <span>{item.label}</span>
                      <span className="text-slate-300 transition group-hover:text-slate-500" aria-hidden>
                        →
                      </span>
                    </p>
                    <p className={`admin-stat-card__value admin-stat-card__value--${tone}`}>
                      {item.count.toLocaleString("ko-KR")}
                    </p>
                    {item.description ? (
                      <p className="admin-stat-card__desc">{item.description}</p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <h2 className="admin-panel__title">최근 실제 주문</h2>
          <Link href={`${ADMIN_ROUTES.orders}?view=new_order`} className="admin-panel__link">
            신규주문 보기
          </Link>
        </div>
        <div className="admin-data-table__wrap admin-data-table__wrap--sticky overflow-x-auto">
          <Table className="admin-table">
            <TableHeader>
              <TableRow>
                <TableHead>주문일</TableHead>
                <TableHead>주문번호</TableHead>
                <TableHead>고객</TableHead>
                <TableHead>상품/규격</TableHead>
                <TableHead>수령</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="admin-table__empty py-10 text-center">
                      <p className="text-sm font-bold text-slate-700">표시할 실제 주문이 없습니다.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((o) => (
                  <TableRow
                    key={`${o.channel}-${o.id}`}
                    className={`cursor-pointer hover:bg-slate-50 ${o.needsAction ? "bg-orange-50/40" : ""}`}
                  >
                    <TableCell className="text-xs text-slate-600">
                      {new Date(o.createdAt).toLocaleString("ko-KR", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="admin-table__mono">
                      <Link href={orderDetailHref(o)} className="font-bold text-blue-700 hover:underline">
                        {o.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{o.customerName}</TableCell>
                    <TableCell>
                      <p className="text-xs font-bold text-slate-800">{o.batteryCode || o.productName}</p>
                      <p className="text-[11px] leading-snug text-slate-500">{o.productName}</p>
                    </TableCell>
                    <TableCell className="text-xs">{o.fulfillmentLabel}</TableCell>
                    <TableCell>{o.finalAmount != null ? formatPriceWon(o.finalAmount) : "—"}</TableCell>
                    <TableCell>
                      <span
                        className={`admin-order-status-badge ${
                          o.needsAction ? "admin-order-status-badge--urgent" : ""
                        }`}
                      >
                        {o.needsAction ? "신규주문 · " : ""}
                        {o.orderStatusLabel}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={orderDetailHref(o)} className="text-xs font-bold text-blue-700 hover:underline">
                        열기
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
