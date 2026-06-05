"use client";

import { Badge } from "@/components/ui/badge";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
import type { AdminAssetRow } from "@/types/admin";

type Props = { rows: AdminAssetRow[] };

export function AdminAssetsTable({ rows }: Props) {
  return (
    <AdminDataTableClient
      rows={rows}
      getRowId={(r) => `${r.category}-${r.path}-${r.device}`}
      filters={[
        {
          key: "category",
          label: "분류",
          type: "select",
          options: [
            { value: "차량 이미지", label: "차량" },
            { value: "메인배너", label: "메인배너" },
            { value: "혜택 이미지", label: "혜택" },
            { value: "빠른메뉴 아이콘", label: "빠른메뉴" },
            { value: "배터리 이미지", label: "배터리" },
          ],
        },
        {
          key: "missing",
          label: "누락",
          type: "select",
          options: [
            { value: "true", label: "누락" },
            { value: "false", label: "있음" },
          ],
          match: (row, v) => String((row as AdminAssetRow).missing) === v,
        },
      ]}
      columns={[
        { key: "category", label: "분류", render: (r) => r.category },
        { key: "fileName", label: "파일", render: (r) => <span className="font-mono text-[10px]">{r.fileName}</span> },
        { key: "targetLabel", label: "연결 대상", render: (r) => r.targetLabel },
        { key: "device", label: "기기", render: (r) => r.device },
        {
          key: "exists",
          label: "존재",
          render: (r) => (
            <Badge variant={r.exists ? "success" : "danger"}>
              {r.exists ? "있음" : "없음"}
            </Badge>
          ),
        },
        {
          key: "preview",
          label: "미리보기",
          render: (r) =>
            r.previewPath && r.exists ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.previewPath} alt="" className="h-8 w-12 rounded object-cover" />
            ) : (
              "—"
            ),
        },
        {
          key: "aspectIssue",
          label: "비율/CSS",
          render: (r) => r.aspectIssue ?? "—",
        },
      ]}
    />
  );
}
