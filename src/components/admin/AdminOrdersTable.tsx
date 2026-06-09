"use client";

import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
import { AdminMobileCard } from "@/components/admin/AdminMobileCard";
import { AdminTableActionLink } from "@/components/admin/AdminPageFrame";
import { OrderRequestWorkflowBadge } from "@/components/admin/order-requests/OrderRequestWorkflowBadge";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { AdminOrderRequestListItem, OrderRequestWorkflowStatus } from "@/types/order-request";

const FULFILLMENT_LABELS: Record<string, string> = {
  delivery: "택배",
  visit_install: "출장교체",
  store_install: "내방교체",
  store_pickup_self: "내방수령",
  store_pickup: "내방수령",
  undecided: "미선택",
};

type Props = {
  orders: AdminOrderRequestListItem[];
  guestOnly?: boolean;
};

export function AdminOrdersTable({ orders, guestOnly }: Props) {
  const rows = guestOnly ? orders.filter((o) => o.customerType === "guest") : orders;

  return (
    <AdminDataTableClient
      rows={rows}
      getRowId={(o) => o.id}
      emptyMessage="접수된 주문이 없습니다."
      filters={[
        { key: "requestNumber", label: "주문번호", type: "search", placeholder: "BM-..." },
        { key: "customerName", label: "고객명", type: "search" },
        { key: "vehicleSummary", label: "차량명", type: "search" },
        {
          key: "status",
          label: "상태",
          type: "select",
          options: [
            { value: "pending_review", label: "접수" },
            { value: "waiting_customer", label: "확인중" },
            { value: "contacted", label: "연락완료" },
            { value: "quoted", label: "예약완료" },
            { value: "closed", label: "작업완료" },
            { value: "canceled", label: "취소" },
          ],
        },
      ]}
      columns={[
        {
          key: "requestNumber",
          label: "주문번호",
          render: (o) => <span className="admin-cell-primary font-mono text-[11px]">{o.requestNumber}</span>,
        },
        {
          key: "createdAt",
          label: "접수일",
          render: (o) => (
            <span className="admin-cell-muted">
              {new Date(o.createdAt).toLocaleString("ko-KR", {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ),
        },
        {
          key: "customer",
          label: "고객",
          render: (o) => (
            <div>
              <p className="admin-cell-primary">{o.customerName}</p>
              <p className="admin-cell-muted">{o.customerPhoneMasked}</p>
            </div>
          ),
        },
        {
          key: "vehicle",
          label: "차량/규격",
          render: (o) => (
            <div className="admin-cell-clamp">
              <p className="admin-cell-primary">{o.vehicleSummary}</p>
              <p className="admin-cell-muted">{o.batterySpecSummary}</p>
            </div>
          ),
        },
        {
          key: "fulfillment",
          label: "수령",
          render: (o) => (
            <span className="admin-cell-muted">
              {FULFILLMENT_LABELS[o.fulfillmentMethod] ?? o.fulfillmentMethod}
            </span>
          ),
        },
        {
          key: "amount",
          label: "금액",
          render: (o) =>
            o.estimatedTotalWon != null ? (
              <span className="admin-cell-primary tabular-nums">{formatPriceWon(o.estimatedTotalWon)}</span>
            ) : (
              <span className="admin-cell-muted">—</span>
            ),
        },
        {
          key: "status",
          label: "상태",
          render: (o) => (
            <OrderRequestWorkflowBadge status={o.status as OrderRequestWorkflowStatus} />
          ),
        },
        {
          key: "detail",
          label: "",
          className: "admin-cell-actions",
          render: (o) => (
            <AdminTableActionLink href={`${ADMIN_ROUTES.orderRequests}?id=${o.id}`} label="상세" />
          ),
        },
      ]}
      mobileCardRender={(o) => (
        <AdminMobileCard
          title={o.requestNumber}
          badges={[
            { label: o.customerType === "guest" ? "비회원" : "회원", tone: "muted" },
          ]}
          lines={[
            `${o.customerName} · ${o.vehicleSummary}`,
            `${o.batterySpecSummary} · ${FULFILLMENT_LABELS[o.fulfillmentMethod] ?? ""}`,
          ]}
          actions={
            <AdminTableActionLink href={`${ADMIN_ROUTES.orderRequests}?id=${o.id}`} label="상세 보기" />
          }
        />
      )}
    />
  );
}
