"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { formatPriceWon } from "@/lib/pricing/order-price";
import {
  COMMERCE_LIFECYCLE_LABELS,
  COMMERCE_PAYMENT_STATUS_LABELS,
} from "@/types/commerce-order";
import {
  returnBatteryLabel,
  type AdminCommerceOrderListItem,
} from "@/lib/payment/commerce-order-admin-mapper";

const FULFILLMENT_LABELS: Record<string, string> = {
  delivery: "택배 발송",
  visit_install: "출장교체",
  store_install: "내방교체",
  store_pickup_self: "내방수령/셀프",
};

type Props = {
  orders: AdminCommerceOrderListItem[];
  selectedOrderId?: string;
};

export function AdminCommerceOrdersTable({ orders, selectedOrderId }: Props) {
  return (
    <AdminDataTableClient
      rows={orders}
      getRowId={(o) => o.orderId}
      selectedRowId={selectedOrderId}
      emptyMessage="자사몰 결제 대기 주문이 없습니다."
      filters={[
        { key: "orderNumber", label: "주문번호", type: "search", placeholder: "BM-..." },
        { key: "customerName", label: "고객명", type: "search" },
        {
          key: "paymentStatus",
          label: "결제 상태",
          type: "select",
          options: Object.entries(COMMERCE_PAYMENT_STATUS_LABELS).map(([value, label]) => ({
            value,
            label,
          })),
        },
      ]}
      columns={[
        {
          key: "orderNumber",
          label: "주문번호",
          render: (o) => (
            <div>
              <p className="admin-cell-primary font-mono admin-table__mono">{o.orderNumber}</p>
              <p className="admin-cell-muted">
                {new Date(o.createdAt).toLocaleString("ko-KR", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ),
        },
        {
          key: "customer",
          label: "고객",
          render: (o) => (
            <div className="admin-cell-product">
              <p className="admin-cell-primary">{o.customerName}</p>
              <p className="admin-cell-muted">
                {o.customerPhone} · {o.customerType === "guest" ? "비회원" : "회원"}
              </p>
            </div>
          ),
        },
        {
          key: "product",
          label: "상품/차량",
          render: (o) => (
            <div className="admin-cell-product">
              <p className="admin-cell-primary">{o.productName}</p>
              <p className="admin-cell-muted">
                {[o.brand, o.batteryCode, o.vehicleName].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
          ),
        },
        {
          key: "fulfillment",
          label: "수령/반납",
          render: (o) => (
            <div>
              <p className="admin-cell-muted">{FULFILLMENT_LABELS[o.fulfillmentType] ?? o.fulfillmentType}</p>
              <p className="admin-cell-muted">{returnBatteryLabel(o.returnBatteryOption)}</p>
            </div>
          ),
        },
        {
          key: "status",
          label: "상태",
          render: (o) => (
            <div className="flex flex-col gap-1">
              <Badge variant={o.paymentStatus === "completed" ? "success" : "muted"}>
                {COMMERCE_PAYMENT_STATUS_LABELS[o.paymentStatus]}
              </Badge>
              <Badge variant="info">{COMMERCE_LIFECYCLE_LABELS[o.orderStatus]}</Badge>
            </div>
          ),
        },
        {
          key: "finalAmount",
          label: "결제금액",
          className: "admin-cell-price",
          render: (o) =>
            o.finalAmount != null ? (
              <span className="admin-cell-primary tabular-nums">{formatPriceWon(o.finalAmount)}</span>
            ) : (
              <span className="admin-cell-muted">—</span>
            ),
        },
        {
          key: "detail",
          label: "",
          className: "admin-cell-actions",
          render: (o) => (
            <Link
              href={`${ADMIN_ROUTES.commerceOrders}?orderId=${encodeURIComponent(o.orderId)}`}
              className="admin-btn admin-btn--secondary admin-btn--md"
            >
              상세
            </Link>
          ),
        },
      ]}
    />
  );
}
