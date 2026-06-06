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
          render: (o) => <span className="font-mono text-[10px]">{o.orderNumber}</span>,
        },
        {
          key: "createdAt",
          label: "주문일시",
          render: (o) => (
            <span className="text-[10px]">{new Date(o.createdAt).toLocaleString("ko-KR")}</span>
          ),
        },
        { key: "customerName", label: "고객명", render: (o) => o.customerName },
        { key: "customerPhone", label: "연락처", render: (o) => o.customerPhone },
        {
          key: "customerType",
          label: "회원구분",
          render: (o) => (o.customerType === "guest" ? "비회원" : "회원"),
        },
        {
          key: "vehicleName",
          label: "차량명",
          render: (o) => o.vehicleName ?? "—",
        },
        { key: "batteryCode", label: "규격", render: (o) => o.batteryCode },
        { key: "brand", label: "브랜드", render: (o) => o.brand ?? "—" },
        { key: "productName", label: "상품", render: (o) => o.productName },
        {
          key: "fulfillmentType",
          label: "수령/장착",
          render: (o) => FULFILLMENT_LABELS[o.fulfillmentType] ?? o.fulfillmentType,
        },
        {
          key: "returnBatteryOption",
          label: "반납 여부",
          render: (o) => returnBatteryLabel(o.returnBatteryOption),
        },
        {
          key: "paymentStatus",
          label: "결제 상태",
          render: (o) => (
            <Badge variant={o.paymentStatus === "completed" ? "success" : "muted"}>
              {COMMERCE_PAYMENT_STATUS_LABELS[o.paymentStatus]}
            </Badge>
          ),
        },
        {
          key: "orderStatus",
          label: "주문 상태",
          render: (o) => (
            <span className="text-[10px] font-bold text-slate-600">
              {COMMERCE_LIFECYCLE_LABELS[o.orderStatus]}
            </span>
          ),
        },
        {
          key: "finalAmount",
          label: "결제금액",
          render: (o) =>
            o.finalAmount != null ? (
              <span className="font-black tabular-nums">{formatPriceWon(o.finalAmount)}</span>
            ) : (
              "—"
            ),
        },
        {
          key: "detail",
          label: "상세",
          render: (o) => (
            <Link
              href={`${ADMIN_ROUTES.commerceOrders}?orderId=${encodeURIComponent(o.orderId)}`}
              className={`text-[10px] font-bold hover:underline ${
                selectedOrderId === o.orderId ? "text-blue-900" : "text-blue-600"
              }`}
            >
              보기
            </Link>
          ),
        },
      ]}
    />
  );
}
