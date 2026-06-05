"use client";

import { Badge } from "@/components/ui/badge";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
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
      columns={[
        { key: "alias", label: "검색어/별칭", render: (r) => r.alias },
        { key: "slug", label: "slug", render: (r) => <span className="font-mono text-[10px]">{r.slug}</span> },
        { key: "canonicalName", label: "정식명", render: (r) => r.canonicalName },
        { key: "displayName", label: "표시명", render: (r) => r.displayName },
        {
          key: "hasImage",
          label: "이미지",
          render: (r) => <Badge variant={r.hasImage ? "success" : "danger"}>{r.hasImage ? "Y" : "N"}</Badge>,
        },
        {
          key: "hasBatteryMatch",
          label: "배터리",
          render: (r) => <Badge variant={r.hasBatteryMatch ? "success" : "warning"}>{r.hasBatteryMatch ? "Y" : "N"}</Badge>,
        },
        {
          key: "duplicate",
          label: "중복",
          render: (r) => (r.duplicate ? <Badge variant="warning">중복</Badge> : "—"),
        },
        {
          key: "unlinked",
          label: "미연결",
          render: (r) => (r.unlinked ? <Badge variant="danger">미연결</Badge> : "—"),
        },
      ]}
    />
  );
}
