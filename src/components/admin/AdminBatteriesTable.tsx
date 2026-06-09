"use client";

import { AdminCustomerPreviewLink } from "@/components/admin/AdminCustomerPreviewLink";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
import { AdminMobileCard } from "@/components/admin/AdminMobileCard";
import { Badge } from "@/components/ui/badge";
import type { AdminBatteryRow } from "@/types/admin";

type Props = { rows: AdminBatteryRow[] };

export function AdminBatteriesTable({ rows }: Props) {
  return (
    <AdminDataTableClient
      rows={rows}
      getRowId={(r) => r.specCode}
      filters={[
        { key: "specCode", label: "규격", type: "search" },
        {
          key: "batteryType",
          label: "유형",
          type: "select",
          options: [
            { value: "AGM", label: "AGM" },
            { value: "DIN", label: "DIN" },
            { value: "일반", label: "일반" },
          ],
        },
        {
          key: "missingSpecs",
          label: "제원",
          type: "select",
          options: [
            { value: "true", label: "누락" },
            { value: "false", label: "완료" },
          ],
          match: (row, v) => String((row as AdminBatteryRow).missingSpecs) === v,
        },
      ]}
      mobileCardRender={(r) => (
        <AdminMobileCard
          title={r.specCode}
          badges={[
            { label: r.batteryType, tone: "muted" },
            { label: r.missingSpecs ? "제원 누락" : "제원 완료", tone: r.missingSpecs ? "warning" : "success" },
          ]}
          lines={[
            r.capacityAh ? `${r.capacityAh}Ah` : "용량 미입력",
            r.hasHeroImage ? "이미지 있음" : "이미지 없음",
          ]}
          actions={<AdminCustomerPreviewLink href={r.detailHref} />}
        />
      )}
      columns={[
        {
          key: "specCode",
          label: "규격",
          render: (r) => <span className="admin-cell-primary font-mono font-bold">{r.specCode}</span>,
        },
        { key: "batteryType", label: "구분", render: (r) => <span className="admin-cell-muted">{r.batteryType}</span> },
        { key: "capacityAh", label: "Ah", render: (r) => r.capacityAh ?? "—" },
        {
          key: "missingSpecs",
          label: "제원",
          render: (r) => (
            <Badge variant={r.missingSpecs ? "warning" : "success"}>
              {r.missingSpecs ? "누락" : "완료"}
            </Badge>
          ),
        },
        {
          key: "hasHeroImage",
          label: "이미지",
          render: (r) => (
            <Badge variant={r.hasHeroImage ? "success" : "danger"}>
              {r.hasHeroImage ? "있음" : "없음"}
            </Badge>
          ),
        },
        {
          key: "detail",
          label: "미리보기",
          render: (r) => <AdminCustomerPreviewLink href={r.detailHref} />,
        },
      ]}
    />
  );
}
