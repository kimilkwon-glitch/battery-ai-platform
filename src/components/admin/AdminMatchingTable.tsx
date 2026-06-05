"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminReviewBadge } from "@/components/admin/AdminReviewBadge";
import { AdminBatteryMatchBadge } from "@/components/admin/AdminBatteryMatchBadge";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
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
          key: "vehicleStatus",
          label: "차량 검수",
          type: "select",
          options: [
            { value: "ok", label: "정상" },
            { value: "image_needed", label: "이미지 필요" },
            { value: "sales_excluded", label: "판매 제외" },
          ],
        },
        {
          key: "batteryMatchStatus",
          label: "배터리 매칭",
          type: "select",
          options: [
            { value: "matched", label: "완료" },
            { value: "unmatched", label: "미완료" },
          ],
        },
      ]}
      columns={[
        { key: "slug", label: "slug", render: (r) => <span className="font-mono text-[10px]">{r.slug}</span> },
        { key: "vehicleName", label: "차량명", render: (r) => r.vehicleName },
        { key: "fuel", label: "연료", render: (r) => r.fuel },
        { key: "connectedBattery", label: "대표 규격", render: (r) => r.connectedBattery },
        {
          key: "candidates",
          label: "후보",
          render: (r) => (
            <span className="max-w-[100px] truncate text-[10px]" title={r.candidateBatteries.join(", ")}>
              {r.candidateBatteries.length > 0 ? r.candidateBatteries.slice(0, 2).join(", ") : "—"}
            </span>
          ),
        },
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
          label: "차량 검수",
          render: (r) => <AdminReviewBadge status={r.vehicleStatus} />,
        },
        {
          key: "batteryMatchStatus",
          label: "배터리 매칭",
          render: (r) => <AdminBatteryMatchBadge status={r.batteryMatchStatus} />,
        },
        {
          key: "terminalConflict",
          label: "단자충돌",
          render: (r) =>
            r.terminalConflict ? <Badge variant="danger">충돌</Badge> : "—",
        },
        {
          key: "salesExcluded",
          label: "판매제외",
          render: (r) => (r.salesExcluded ? <Badge variant="muted">제외</Badge> : "—"),
        },
        {
          key: "detail",
          label: "상세",
          render: (r) => (
            <Link href={`/vehicle/${r.slug}`} className="text-[10px] font-bold text-blue-600" target="_blank">
              보기
            </Link>
          ),
        },
      ]}
    />
  );
}
