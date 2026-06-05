"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
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
      columns={[
        { key: "specCode", label: "규격", render: (r) => <span className="font-mono font-bold">{r.specCode}</span> },
        { key: "batteryType", label: "구분", render: (r) => r.batteryType },
        { key: "capacityAh", label: "Ah", render: (r) => r.capacityAh ?? "—" },
        { key: "cca", label: "CCA", render: (r) => r.cca ?? "—" },
        { key: "terminalDirection", label: "단자", render: (r) => r.terminalDirection ?? "—" },
        {
          key: "dimensions",
          label: "크기(mm)",
          render: (r) =>
            r.lengthMm ? `${r.lengthMm}×${r.widthMm ?? "?"}×${r.heightMm ?? "?"}` : "—",
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
          key: "missingSpecs",
          label: "제원",
          render: (r) => (
            <Badge variant={r.missingSpecs ? "warning" : "success"}>
              {r.missingSpecs ? "누락" : "완료"}
            </Badge>
          ),
        },
        {
          key: "detail",
          label: "상세",
          render: (r) => (
            <Link href={r.detailHref} className="text-[10px] font-bold text-blue-600" target="_blank">
              보기
            </Link>
          ),
        },
      ]}
    />
  );
}
