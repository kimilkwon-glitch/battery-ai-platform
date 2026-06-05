"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminReviewBadge } from "@/components/admin/AdminReviewBadge";
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
          key: "reviewStatus",
          label: "검수상태",
          type: "select",
          options: [
            { value: "ok", label: "정상" },
            { value: "terminal_check", label: "단자 확인" },
            { value: "agm_check", label: "AGM 확인" },
            { value: "sales_excluded", label: "판매 제외" },
          ],
        },
      ]}
      columns={[
        { key: "slug", label: "slug", render: (r) => <span className="font-mono text-[10px]">{r.slug}</span> },
        { key: "vehicleName", label: "차량명", render: (r) => r.vehicleName },
        { key: "fuel", label: "연료", render: (r) => r.fuel },
        { key: "connectedBattery", label: "연결 배터리", render: (r) => r.connectedBattery },
        {
          key: "candidates",
          label: "후보",
          render: (r) => (
            <span className="max-w-[100px] truncate text-[10px]" title={r.candidateBatteries.join(", ")}>
              {r.candidateBatteries.slice(0, 2).join(", ")}
            </span>
          ),
        },
        {
          key: "terminalConflict",
          label: "단자충돌",
          render: (r) =>
            r.terminalConflict ? <Badge variant="danger">충돌</Badge> : "—",
        },
        {
          key: "agmConflict",
          label: "AGM충돌",
          render: (r) => (r.agmConflict ? <Badge variant="warning">충돌</Badge> : "—"),
        },
        {
          key: "salesExcluded",
          label: "판매제외",
          render: (r) => (r.salesExcluded ? <Badge variant="muted">제외</Badge> : "—"),
        },
        {
          key: "reviewStatus",
          label: "상태",
          render: (r) => <AdminReviewBadge status={r.reviewStatus} />,
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
