"use client";

import { useMemo, useState } from "react";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type AdminTableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

export type AdminTableFilter = {
  key: string;
  label: string;
  type: "search" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
  /** row[field] or custom match */
  match?: (row: unknown, value: string) => boolean;
};

type Props<T> = {
  rows: T[];
  columns: AdminTableColumn<T>[];
  filters?: AdminTableFilter[];
  emptyMessage?: string;
  getRowId: (row: T) => string;
};

export function AdminDataTableClient<T>({
  rows,
  columns,
  filters = [],
  emptyMessage = "데이터가 없습니다.",
  getRowId,
}: Props<T>) {
  const [values, setValues] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return rows.filter((row) =>
      filters.every((f) => {
        const v = values[f.key]?.trim();
        if (!v) return true;
        if (f.match) return f.match(row, v);
        const rec = row as Record<string, unknown>;
        const field = String(rec[f.key] ?? "");
        if (f.type === "search") return field.toLowerCase().includes(v.toLowerCase());
        return field === v;
      }),
    );
  }, [rows, filters, values]);

  return (
    <div className="space-y-3">
      {filters.length > 0 ? (
        <AdminFilterBar
          filters={filters}
          values={values}
          onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
        />
      ) : null}
      <div className="rounded-lg border border-slate-200 bg-white">
        <Table className="admin-table">
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>
                  {c.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="admin-table__empty">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <p className="border-t border-slate-100 px-3 py-2 text-[10px] text-slate-500">
          {filtered.length} / {rows.length}건
        </p>
      </div>
    </div>
  );
}
