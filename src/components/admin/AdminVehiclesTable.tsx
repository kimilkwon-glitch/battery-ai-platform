"use client";

import { Badge } from "@/components/ui/badge";
import { AdminReviewBadge } from "@/components/admin/AdminReviewBadge";
import { AdminBatteryMatchBadge } from "@/components/admin/AdminBatteryMatchBadge";
import { AdminCustomerPreviewLink } from "@/components/admin/AdminCustomerPreviewLink";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
import { AdminMobileCard } from "@/components/admin/AdminMobileCard";
import type { AdminVehicleRow } from "@/types/admin";

type Props = { rows: AdminVehicleRow[] };

export function AdminVehiclesTable({ rows }: Props) {
  return (
    <AdminDataTableClient
      rows={rows}
      getRowId={(r) => r.slug}
      filters={[
        { key: "displayName", label: "차량명", type: "search" },
        { key: "brand", label: "제조사", type: "search" },
        { key: "primaryBattery", label: "배터리 규격", type: "search" },
        {
          key: "hasImage",
          label: "이미지",
          type: "select",
          options: [
            { value: "true", label: "있음" },
            { value: "false", label: "없음" },
          ],
          match: (row, v) => String((row as AdminVehicleRow).hasImage) === v,
        },
        {
          key: "vehicleStatus",
          label: "검수",
          type: "select",
          options: [
            { value: "ok", label: "정상" },
            { value: "image_needed", label: "이미지 필요" },
            { value: "db_fix_needed", label: "규격 검수" },
          ],
        },
      ]}
      columns={[
        {
          key: "displayName",
          label: "차량명",
          render: (r) => (
            <div>
              <p className="admin-cell-primary">{r.displayName}</p>
              <p className="admin-cell-muted font-mono">{r.slug}</p>
            </div>
          ),
        },
        { key: "brand", label: "제조사", render: (r) => <span className="admin-cell-muted">{r.brand}</span> },
        { key: "primaryBattery", label: "대표 규격", render: (r) => <span className="admin-cell-primary">{r.primaryBattery}</span> },
        {
          key: "imageStatus",
          label: "이미지",
          render: (r) => (
            <Badge variant={r.imageStatus === "present" ? "success" : "danger"}>
              {r.imageStatus === "present" ? "있음" : "없음"}
            </Badge>
          ),
        },
        {
          key: "vehicleStatus",
          label: "검수",
          render: (r) => <AdminReviewBadge status={r.vehicleStatus} />,
        },
        {
          key: "batteryMatchStatus",
          label: "매칭",
          render: (r) => <AdminBatteryMatchBadge status={r.batteryMatchStatus} />,
        },
        {
          key: "detail",
          label: "",
          className: "admin-cell-actions",
          render: (r) => <AdminCustomerPreviewLink href={r.detailHref} />,
        },
      ]}
      mobileCardRender={(r) => (
        <AdminMobileCard
          title={r.displayName}
          badges={[
            { label: r.imageStatus === "present" ? "이미지 있음" : "이미지 없음", tone: r.imageStatus === "present" ? "success" : "danger" },
          ]}
          lines={[`${r.brand} · ${r.primaryBattery}`, `${r.yearRange} · ${r.fuel}`]}
          actions={<AdminCustomerPreviewLink href={r.detailHref} />}
        />
      )}
    />
  );
}
