"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import type { PhotoCheckRequestItem } from "@/types/order-request";

const STATUS_LABELS: Record<PhotoCheckRequestItem["status"], string> = {
  received: "접수",
  reviewing: "확인중",
  more_photos: "추가사진요청",
  guided: "안내완료",
  converted: "주문전환",
  on_hold: "보류",
};

type Props = {
  items: PhotoCheckRequestItem[];
};

export function AdminPhotoRequestsTable({ items }: Props) {
  return (
    <AdminDataTableClient
      rows={items}
      getRowId={(i) => i.id}
      emptyMessage="사진 확인 요청이 없습니다."
      filters={[
        { key: "customerName", label: "고객명", type: "search" },
        { key: "vehicleName", label: "차량명", type: "search" },
        {
          key: "status",
          label: "상태",
          type: "select",
          options: Object.entries(STATUS_LABELS).map(([value, label]) => ({
            value,
            label,
          })),
        },
      ]}
      columns={[
        {
          key: "requestedAt",
          label: "요청일시",
          render: (i) => new Date(i.requestedAt).toLocaleString("ko-KR"),
        },
        { key: "customerName", label: "고객명", render: (i) => i.customerName },
        { key: "customerPhoneMasked", label: "연락처", render: (i) => i.customerPhoneMasked },
        { key: "vehicleName", label: "차량명", render: (i) => i.vehicleName },
        { key: "vehicleYear", label: "연식", render: (i) => i.vehicleYear ?? "—" },
        { key: "photoCount", label: "사진", render: (i) => `${i.photoCount}장` },
        {
          key: "status",
          label: "상태",
          render: (i) => (
            <Badge variant="warning">{STATUS_LABELS[i.status]}</Badge>
          ),
        },
        {
          key: "detail",
          label: "상세",
          render: (i) => (
            <Link
              href={`${ADMIN_ROUTES.orderRequests}?id=${i.id}`}
              className="text-[10px] font-bold text-blue-600"
            >
              보기
            </Link>
          ),
        },
      ]}
    />
  );
}
