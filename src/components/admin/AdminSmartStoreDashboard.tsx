import Link from "next/link";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { AdminDashboardSection, AdminRecentUnifiedOrder } from "@/types/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  orderSections: AdminDashboardSection["items"];
  claimSections: AdminDashboardSection["items"];
  inquirySections: AdminDashboardSection["items"];
  productSections: AdminDashboardSection["items"];
  recentOrders: AdminRecentUnifiedOrder[];
};

function StatGrid({ title, items }: { title: string; items: AdminDashboardSection["items"] }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel__header">
        <h2 className="admin-panel__title">{title}</h2>
      </div>
      <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => {
          const tone =
            item.count > 0
              ? item.label.includes("취소") || item.label.includes("환불") || item.label.includes("반품")
                ? "danger"
                : item.label.includes("대기") || item.label.includes("확인")
                  ? "warning"
                  : "info"
              : "zero";
          return (
            <Link key={item.href} href={item.href} className="group block">
              <div className="admin-stat-card h-full">
                <p className="admin-stat-card__label flex items-center justify-between gap-2">
                  <span>{item.label}</span>
                  <span className="text-slate-300 transition group-hover:text-slate-500" aria-hidden>
                    →
                  </span>
                </p>
                <p className={`admin-stat-card__value admin-stat-card__value--${tone}`}>
                  {item.count.toLocaleString("ko-KR")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function orderDetailHref(row: AdminRecentUnifiedOrder): string {
  if (row.channel === "commerce") {
    return `${ADMIN_ROUTES.orders}?channel=commerce&orderId=${encodeURIComponent(row.id)}`;
  }
  return `${ADMIN_ROUTES.orders}?channel=consultation&id=${encodeURIComponent(row.id)}`;
}

export function AdminSmartStoreDashboard({
  orderSections,
  claimSections,
  inquirySections,
  productSections,
  recentOrders,
}: Props) {
  return (
    <div className="admin-dashboard space-y-6">
      <div className="admin-panel border-blue-100 bg-gradient-to-br from-slate-50 to-white">
        <div className="admin-panel__header border-b border-slate-100">
          <div>
            <h2 className="admin-panel__title text-lg">오늘 처리할 일</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              주문·클레임·문의·상품 상태를 한눈에 확인하고 바로 이동합니다.
            </p>
          </div>
        </div>
        <div className="space-y-4 p-3">
          <StatGrid title="주문 관리" items={orderSections} />
          <StatGrid title="취소·반품·교환" items={claimSections} />
          <StatGrid title="문의 관리" items={inquirySections} />
          <StatGrid title="상품 관리" items={productSections} />
        </div>
      </div>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <h2 className="admin-panel__title">최근 주문</h2>
          <Link href={ADMIN_ROUTES.orders} className="admin-panel__link">
            주문 관리 전체 보기
          </Link>
        </div>
        <div className="admin-data-table__wrap admin-data-table__wrap--sticky overflow-x-auto">
          <Table className="admin-table">
            <TableHeader>
              <TableRow>
                <TableHead>주문번호</TableHead>
                <TableHead>고객명</TableHead>
                <TableHead>상품</TableHead>
                <TableHead>수령방식</TableHead>
                <TableHead>결제금액</TableHead>
                <TableHead>주문상태</TableHead>
                <TableHead>접수일</TableHead>
                <TableHead className="text-right">상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="admin-table__empty py-10 text-center">
                      <p className="text-sm font-bold text-slate-700">아직 접수된 주문이 없습니다.</p>
                      <p className="mt-2 text-xs text-slate-500">
                        자사몰 결제·상담·비회원 주문이 접수되면 이곳에 표시됩니다.
                      </p>
                      <Link
                        href={ADMIN_ROUTES.orders}
                        className="admin-btn admin-btn--secondary admin-btn--md mt-4 inline-flex"
                      >
                        주문 관리 바로가기
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((o) => (
                  <TableRow key={`${o.channel}-${o.id}`} className="cursor-pointer hover:bg-slate-50">
                    <TableCell className="admin-table__mono">
                      <Link href={orderDetailHref(o)} className="font-bold text-blue-700 hover:underline">
                        {o.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{o.customerName}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{o.productName}</TableCell>
                    <TableCell>{o.fulfillmentLabel}</TableCell>
                    <TableCell>{o.finalAmount != null ? formatPriceWon(o.finalAmount) : "—"}</TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                        {o.orderStatusLabel}
                      </span>
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
                        href={orderDetailHref(o)}
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
      </section>
    </div>
  );
}
