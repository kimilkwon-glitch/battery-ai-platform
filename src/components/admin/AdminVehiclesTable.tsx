"use client";

import { Badge } from "@/components/ui/badge";
import { AdminReviewBadge } from "@/components/admin/AdminReviewBadge";
import { AdminBatteryMatchBadge } from "@/components/admin/AdminBatteryMatchBadge";
import { AdminCustomerPreviewLink } from "@/components/admin/AdminCustomerPreviewLink";
import { AdminDataTableClient, type AdminTableStatusTab } from "@/components/admin/AdminDataTableClient";
import { AdminMobileCard } from "@/components/admin/AdminMobileCard";
import type { AdminVehicleRow } from "@/types/admin";

type Props = { rows: AdminVehicleRow[] };

export function AdminVehiclesTable({ rows }: Props) {
  const statusTabs: AdminTableStatusTab<AdminVehicleRow>[] = [
    { id: "all", label: "전체", match: () => true },
    {
      id: "matched",
      label: "매칭 완료",
      tone: "info",
      match: (r) => r.batteryMatchStatus === "matched",
    },
    {
      id: "needs_review",
      label: "확인 필요",
      tone: "warning",
      match: (r) => r.vehicleStatus !== "ok" && r.vehicleStatus !== "sales_excluded",
    },
    {
      id: "no_image",
      label: "이미지 없음",
      tone: "warning",
      match: (r) => r.imageStatus !== "present",
    },
    {
      id: "sales_excluded",
      label: "판매 제외",
      match: (r) => r.salesExcluded,
    },
    {
      id: "ev_excluded",
      label: "EV/리튬",
      match: (r) => r.fuel === "전기" || r.fuel === "EV",
    },
  ];

  return (
    <AdminDataTableClient
      rows={rows}
      getRowId={(r) => r.slug}
      statusTabs={statusTabs}
      filters={[
        {
          key: "displayName",
          label: "차량명",
          type: "search",
          placeholder: "고객 표시명 검색",
          match: (row, v) => {
            const r = row as AdminVehicleRow;
            const q = v.toLowerCase();
            return (
              r.displayName.toLowerCase().includes(q) ||
              (r.generationName ?? "").toLowerCase().includes(q)
            );
          },
        },
        {
          key: "brand",
          label: "제조사",
          type: "search",
          placeholder: "현대, 기아…",
        },
        {
          key: "fuel",
          label: "연료",
          type: "select",
          options: [
            { value: "가솔린", label: "가솔린" },
            { value: "디젤", label: "디젤" },
            { value: "LPG", label: "LPG" },
            { value: "하이브리드", label: "하이브리드" },
            { value: "전기", label: "전기" },
          ],
        },
        {
          key: "primaryBattery",
          label: "규격",
          type: "search",
          placeholder: "60L, DIN74L…",
        },
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
          key: "hasImage",
          label: "이미지",
          type: "select",
          options: [
            { value: "true", label: "있음" },
            { value: "false", label: "없음" },
          ],
          match: (row, v) => String((row as AdminVehicleRow).hasImage) === v,
        },
      ]}
      columns={[
        {
          key: "displayName",
          label: "차량",
          render: (r) => (
            <div className="admin-cell-product">
              <p className="admin-cell-primary">{r.displayName}</p>
              {r.generationName ? (
                <p className="admin-cell-muted">{r.generationName}</p>
              ) : null}
              <p className="admin-cell-muted text-xs">
                {r.yearRange} · {r.fuel}
              </p>
            </div>
          ),
        },
        { key: "brand", label: "제조사", render: (r) => <span className="admin-cell-muted">{r.brand}</span> },
        {
          key: "primaryBattery",
          label: "대표 규격",
          render: (r) => <span className="admin-cell-primary font-mono">{r.primaryBattery}</span>,
        },
        {
          key: "candidates",
          label: "추천 규격",
          render: (r) => (
            <span className="admin-cell-muted text-xs">
              {r.candidateBatteries.slice(0, 2).join(", ") || "—"}
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
          label: "상태",
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
          render: (r) => (
            <div className="flex flex-wrap gap-2">
              <AdminCustomerPreviewLink href={r.detailHref} label="고객 화면" />
            </div>
          ),
        },
      ]}
      emptyMessage="조건에 맞는 차량이 없습니다."
      mobileCardRender={(r) => (
        <AdminMobileCard
          title={r.displayName}
          badges={[
            {
              label: r.imageStatus === "present" ? "이미지 있음" : "이미지 없음",
              tone: r.imageStatus === "present" ? "success" : "danger",
            },
          ]}
          lines={[`${r.brand} · ${r.primaryBattery}`, `${r.yearRange} · ${r.fuel}`]}
          actions={<AdminCustomerPreviewLink href={r.detailHref} />}
        />
      )}
    />
  );
}
