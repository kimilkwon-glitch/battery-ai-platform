"use client";

import { Badge } from "@/components/ui/badge";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
import { AdminMobileCard } from "@/components/admin/AdminMobileCard";
import type { AdminAliasRow } from "@/types/admin";

type Props = { rows: AdminAliasRow[] };

export function AdminAliasesTable({ rows }: Props) {
  return (
    <AdminDataTableClient
      rows={rows}
      getRowId={(r) => `${r.alias}-${r.slug}`}
      filters={[
        { key: "alias", label: "별칭", type: "search" },
        { key: "slug", label: "slug", type: "search" },
        {
          key: "duplicate",
          label: "중복",
          type: "select",
          options: [{ value: "true", label: "중복" }],
          match: (row, v) => v !== "true" || (row as AdminAliasRow).duplicate,
        },
      ]}
      mobileCardRender={(r) => (
        <AdminMobileCard
          title={r.alias}
          badges={[
            ...(r.duplicate ? [{ label: "중복", tone: "warning" as const }] : []),
            ...(r.unlinked ? [{ label: "미연결", tone: "danger" as const }] : []),
            { label: r.hasBatteryMatch ? "배터리 연결" : "배터리 없음", tone: r.hasBatteryMatch ? "success" : "warning" },
          ]}
          lines={[r.canonicalName, r.slug]}
        />
      )}
      columns={[
        { key: "alias", label: "별칭", render: (r) => <span className="admin-cell-primary">{r.alias}</span> },
        { key: "slug", label: "slug", render: (r) => <span className="admin-cell-muted font-mono text-[10px]">{r.slug}</span> },
        { key: "canonicalName", label: "정식명", render: (r) => r.canonicalName },
        {
          key: "status",
          label: "상태",
          render: (r) => (
            <div className="flex flex-wrap gap-1">
              <Badge variant={r.hasBatteryMatch ? "success" : "warning"}>
                {r.hasBatteryMatch ? "배터리" : "미매칭"}
              </Badge>
              {r.duplicate ? <Badge variant="warning">중복</Badge> : null}
              {r.unlinked ? <Badge variant="danger">미연결</Badge> : null}
            </div>
          ),
        },
      ]}
    />
  );
}
