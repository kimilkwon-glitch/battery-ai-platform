"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
import type { AdminCtaLinkRow } from "@/types/admin";

const STATUS_VARIANT: Record<AdminCtaLinkRow["status"], "success" | "danger" | "warning" | "info" | "muted"> = {
  ok: "success",
  missing: "danger",
  suspect: "warning",
  external: "info",
};

type Props = { rows: AdminCtaLinkRow[] };

export function AdminCtaLinksTable({ rows }: Props) {
  return (
    <AdminDataTableClient
      rows={rows}
      getRowId={(r) => r.id}
      filters={[
        { key: "context", label: "영역", type: "search" },
        { key: "label", label: "라벨", type: "search" },
        {
          key: "status",
          label: "상태",
          type: "select",
          options: [
            { value: "ok", label: "정상" },
            { value: "missing", label: "누락" },
            { value: "suspect", label: "의심" },
            { value: "external", label: "외부" },
          ],
        },
      ]}
      columns={[
        { key: "context", label: "영역", render: (r) => r.context },
        { key: "label", label: "라벨", render: (r) => r.label },
        {
          key: "href",
          label: "링크",
          render: (r) => (
            <Link
              href={r.href}
              className="max-w-[180px] truncate text-[10px] text-blue-600 hover:underline"
              target={r.href.startsWith("http") ? "_blank" : undefined}
            >
              {r.href}
            </Link>
          ),
        },
        {
          key: "status",
          label: "상태",
          render: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>,
        },
        { key: "note", label: "메모", render: (r) => r.note ?? "—" },
      ]}
    />
  );
}
