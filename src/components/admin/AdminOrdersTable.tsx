"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
import { OrderRequestWorkflowBadge } from "@/components/admin/order-requests/OrderRequestWorkflowBadge";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import type { AdminOrderRequestListItem, OrderRequestWorkflowStatus } from "@/types/order-request";

const FULFILLMENT_LABELS: Record<string, string> = {
  delivery: "택배",
  store_pickup: "내방",
  visit_install: "출장",
  undecided: "상담 후 결정",
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
  const rows = guestOnly
    ? orders.filter((o) => o.customerType === "guest")
    : orders;

  return (
    <AdminDataTableClient
      rows={rows}
      getRowId={(o) => o.id}
      emptyMessage="접수된 주문 요청이 없습니다."
      filters={[
        { key: "requestNumber", label: "접수번호", type: "search", placeholder: "BM-..." },
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
        {
          key: "fulfillmentMethod",
          label: "장착방식",
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
          render: (o) => (
            <span className="font-mono text-[10px]">{o.requestNumber}</span>
          ),
        },
        {
          key: "createdAt",
          label: "주문일시",
          render: (o) => (
            <span className="text-[10px]">
              {new Date(o.createdAt).toLocaleString("ko-KR")}
            </span>
          ),
        },
        {
          key: "customerType",
          label: "구분",
          render: (o) => (
            <Badge variant={o.customerType === "guest" ? "info" : "muted"}>
              {o.customerType === "guest" ? "비회원" : "회원"}
            </Badge>
          ),
        },
        { key: "customerName", label: "고객명", render: (o) => o.customerName },
        { key: "customerPhoneMasked", label: "연락처", render: (o) => o.customerPhoneMasked },
        { key: "vehicleSummary", label: "차량", render: (o) => o.vehicleSummary },
        { key: "batterySpecSummary", label: "배터리", render: (o) => o.batterySpecSummary },
        {
          key: "usedBatteryReturnOption",
          label: "반납",
          render: (o) => USED_LABELS[o.usedBatteryReturnOption] ?? o.usedBatteryReturnOption,
        },
        {
          key: "fulfillmentMethod",
          label: "장착",
          render: (o) => FULFILLMENT_LABELS[o.fulfillmentMethod] ?? o.fulfillmentMethod,
        },
        {
          key: "storeId",
          label: "지점",
          render: (o) => (o.storeId ? STORE_LABELS[o.storeId] ?? o.storeId : "—"),
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
