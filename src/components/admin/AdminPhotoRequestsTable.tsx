"use client";

import { Badge } from "@/components/ui/badge";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
import { AdminMobileCard } from "@/components/admin/AdminMobileCard";
import { AdminTableActionLink } from "@/components/admin/AdminPageFrame";
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

const STATUS_TONE: Record<
  PhotoCheckRequestItem["status"],
  "info" | "warning" | "success" | "muted" | "danger"
> = {
  received: "info",
  reviewing: "warning",
  more_photos: "warning",
  guided: "success",
  converted: "success",
  on_hold: "muted",
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
      mobileCardRender={(i) => (
        <AdminMobileCard
          title={i.customerName}
          badges={[{ label: STATUS_LABELS[i.status], tone: STATUS_TONE[i.status] }]}
          lines={[
            i.vehicleName,
            new Date(i.requestedAt).toLocaleString("ko-KR", {
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
          ]}
          actions={
            <AdminTableActionLink
              href={`${ADMIN_ROUTES.orderRequests}?id=${i.id}`}
              label="상세 보기"
            />
          }
        />
      )}
      columns={[
        {
          key: "requestedAt",
          label: "요청일",
          render: (i) => (
            <span className="admin-cell-muted">
              {new Date(i.requestedAt).toLocaleString("ko-KR", {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ),
        },
        {
          key: "customerName",
          label: "고객",
          render: (i) => (
            <div>
              <p className="admin-cell-primary">{i.customerName}</p>
              <p className="admin-cell-muted">{i.customerPhoneMasked}</p>
            </div>
          ),
        },
        { key: "vehicleName", label: "차량", render: (i) => <span className="admin-cell-primary">{i.vehicleName}</span> },
        {
          key: "status",
          label: "상태",
          render: (i) => <Badge variant={STATUS_TONE[i.status]}>{STATUS_LABELS[i.status]}</Badge>,
        },
        {
          key: "detail",
          label: "액션",
          render: (i) => (
            <AdminTableActionLink href={`${ADMIN_ROUTES.orderRequests}?id=${i.id}`} label="상세" />
          ),
        },
      ]}
    />
  );
}
