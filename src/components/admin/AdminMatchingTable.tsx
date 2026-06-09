"use client";

import { Badge } from "@/components/ui/badge";
import { AdminReviewBadge } from "@/components/admin/AdminReviewBadge";
import { AdminBatteryMatchBadge } from "@/components/admin/AdminBatteryMatchBadge";
import { AdminCustomerPreviewLink } from "@/components/admin/AdminCustomerPreviewLink";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
import { AdminMobileCard } from "@/components/admin/AdminMobileCard";
import type { AdminMatchingRow } from "@/types/admin";

type Props = { rows: AdminMatchingRow[] };

export function AdminMatchingTable({ rows }: Props) {
  return (
    <AdminDataTableClient
      rows={rows}
      getRowId={(r) => r.slug}
      filters={[
        { key: "vehicleName", label: "차량명", type: "search" },
        {
          key: "batteryMatchStatus",
          label: "매칭",
          type: "select",
          options: [
            { value: "matched", label: "완료" },
            { value: "unmatched", label: "미완료" },
          ],
        },
        {
          key: "vehicleStatus",
          label: "검수",
          type: "select",
          options: [
            { value: "ok", label: "정상" },
            { value: "image_needed", label: "이미지 필요" },
          ],
        },
      ]}
      columns={[
        {
          key: "vehicleName",
          label: "차량",
          render: (r) => (
            <div>
              <p className="admin-cell-primary">{r.vehicleName}</p>
              <p className="admin-cell-muted">{r.yearRange} · {r.fuel}</p>
            </div>
          ),
        },
        { key: "connectedBattery", label: "대표 규격", render: (r) => <span className="admin-cell-primary">{r.connectedBattery}</span> },
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
          render: (r) => <AdminCustomerPreviewLink href={`/vehicle/${r.slug}`} />,
        },
      ]}
      mobileCardRender={(r) => (
        <AdminMobileCard
          title={r.vehicleName}
          lines={[`${r.connectedBattery} · ${r.fuel}`, `매칭 ${r.batteryMatchStatus}`]}
          actions={<AdminCustomerPreviewLink href={`/vehicle/${r.slug}`} />}
        />
      )}
    />
  );
}
