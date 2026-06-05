"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminReviewBadge } from "@/components/admin/AdminReviewBadge";
import { AdminBatteryMatchBadge } from "@/components/admin/AdminBatteryMatchBadge";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
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
          label: "차량 검수",
          type: "select",
          options: [
            { value: "ok", label: "정상" },
            { value: "sales_excluded", label: "판매 제외" },
            { value: "image_needed", label: "이미지 필요" },
            { value: "db_fix_needed", label: "규격 검수" },
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
        { key: "brand", label: "제조사", render: (r) => r.brand },
        { key: "displayName", label: "차량명", render: (r) => r.displayName },
        { key: "yearRange", label: "연식", render: (r) => r.yearRange },
        { key: "fuel", label: "연료", render: (r) => r.fuel },
        { key: "primaryBattery", label: "대표 규격", render: (r) => r.primaryBattery },
        {
          key: "candidateBatteries",
          label: "후보",
          render: (r) => (
            <span className="max-w-[120px] truncate text-[10px]" title={r.candidateBatteries.join(", ")}>
              {r.candidateBatteries.length > 0 ? r.candidateBatteries.slice(0, 3).join(", ") : "—"}
            </span>
          ),
        },
        {
          key: "isAgm",
          label: "AGM",
          render: (r) => (r.isAgm ? <Badge variant="info">AGM</Badge> : "—"),
        },
        { key: "terminalDirection", label: "단자", render: (r) => r.terminalDirection },
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
