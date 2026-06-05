"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
import { OrderRequestWorkflowBadge } from "@/components/admin/order-requests/OrderRequestWorkflowBadge";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { formatPriceWon } from "@/lib/pricing/order-price";
import {
  COMMERCE_LIFECYCLE_LABELS,
  COMMERCE_PAYMENT_STATUS_LABELS,
} from "@/types/commerce-order";
import type { AdminOrderRequestListItem, OrderRequestWorkflowStatus } from "@/types/order-request";

const FULFILLMENT_LABELS: Record<string, string> = {
  delivery: "택배 발송",
  visit_install: "출장교체",
  store_install: "내방교체",
  store_pickup_self: "내방수령/셀프",
  store_pickup: "내방수령/셀프",
  undecided: "미선택",
};

const STORE_LABELS: Record<string, string> = {
  deokcheon: "덕천점",
  hakjang: "학장점",
  undecided: "미정",
};

const USED_LABELS: Record<string, string> = {
  return: "반납",
  no_return: "미반납",
  unknown: "미정",
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
          label: "주문상태",
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
        {
          key: "fulfillmentMethod",
          label: "수령/장착",
          type: "select",
          options: Object.entries(FULFILLMENT_LABELS).map(([value, label]) => ({
            value,
            label,
          })),
        },
      ]}
      columns={[
        {
          key: "requestNumber",
          label: "주문번호",
          render: (o) => <span className="font-mono text-[10px]">{o.requestNumber}</span>,
        },
        {
          key: "createdAt",
          label: "주문일시",
          render: (o) => (
            <span className="text-[10px]">{new Date(o.createdAt).toLocaleString("ko-KR")}</span>
          ),
        },
        {
          key: "customerType",
          label: "회원/비회원",
          render: (o) => (
            <Badge variant={o.customerType === "guest" ? "info" : "muted"}>
              {o.customerType === "guest" ? "비회원" : "회원"}
            </Badge>
          ),
        },
        { key: "customerName", label: "고객명", render: (o) => o.customerName },
        { key: "customerPhoneMasked", label: "연락처", render: (o) => o.customerPhoneMasked },
        { key: "vehicleSummary", label: "차량명", render: (o) => o.vehicleSummary },
        { key: "batterySpecSummary", label: "배터리 규격", render: (o) => o.batterySpecSummary },
        {
          key: "brandSummary",
          label: "브랜드",
          render: (o) => o.brandSummary ?? "—",
        },
        {
          key: "fulfillmentMethod",
          label: "수령/장착",
          render: (o) => FULFILLMENT_LABELS[o.fulfillmentMethod] ?? o.fulfillmentMethod,
        },
        {
          key: "usedBatteryReturnOption",
          label: "반납 여부",
          render: (o) => USED_LABELS[o.usedBatteryReturnOption] ?? o.usedBatteryReturnOption,
        },
        {
          key: "paymentStatus",
          label: "결제 상태",
          render: (o) =>
            o.paymentStatus ? (
              <Badge variant={o.paymentStatus === "completed" ? "success" : "muted"}>
                {COMMERCE_PAYMENT_STATUS_LABELS[o.paymentStatus]}
              </Badge>
            ) : (
              <span className="text-slate-400">—</span>
            ),
        },
        {
          key: "status",
          label: "주문 상태",
          render: (o) => (
            <OrderRequestWorkflowBadge status={o.status as OrderRequestWorkflowStatus} />
          ),
        },
        {
          key: "lifecycleStatus",
          label: "라이프사이클",
          render: (o) =>
            o.lifecycleStatus ? (
              <span className="text-[10px] font-bold text-slate-600">
                {COMMERCE_LIFECYCLE_LABELS[o.lifecycleStatus]}
              </span>
            ) : (
              "—"
            ),
        },
        {
          key: "estimatedTotalWon",
          label: "결제금액",
          render: (o) =>
            o.estimatedTotalWon != null ? (
              <span className="font-black tabular-nums">{formatPriceWon(o.estimatedTotalWon)}</span>
            ) : (
              "—"
            ),
        },
        {
          key: "detail",
          label: "상세",
          render: (o) => (
            <Link
              href={`${ADMIN_ROUTES.orderRequests}?id=${o.id}`}
              className="text-[10px] font-bold text-blue-600 hover:underline"
            >
              보기
            </Link>
          ),
        },
      ]}
    />
  );
}
