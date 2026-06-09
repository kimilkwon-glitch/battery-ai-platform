"use client";

import { useMemo, useState } from "react";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminStatusTabs, type AdminStatusTab } from "@/components/admin/AdminStatusTabs";
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

export type AdminTableStatusTab<T> = AdminStatusTab & {
  match: (row: T) => boolean;
};

type Props<T> = {
  rows: T[];
  columns: AdminTableColumn<T>[];
  filters?: AdminTableFilter[];
  statusTabs?: AdminTableStatusTab<T>[];
  initialStatusTab?: string;
  initialValues?: Record<string, string>;
  emptyMessage?: string;
  getRowId: (row: T) => string;
  stickyHeader?: boolean;
  /** 모바일(≤767px) 카드 뷰 — 제공 시 테이블 대신 카드 목록 표시 */
  mobileCardRender?: (row: T) => React.ReactNode;
  /** 선택 행 강조 (매칭·문의 목록) */
  selectedRowId?: string | null;
};

export function AdminDataTableClient<T>({
  rows,
  columns,
  filters = [],
  statusTabs,
  initialStatusTab = "all",
  initialValues = {},
  emptyMessage = "데이터가 없습니다.",
  getRowId,
  stickyHeader = true,
  mobileCardRender,
  selectedRowId = null,
}: Props<T>) {
  const [statusTab, setStatusTab] = useState(initialStatusTab);
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  const tabsWithCounts = useMemo(() => {
    if (!statusTabs?.length) return [];
    return statusTabs.map((tab) => ({
      ...tab,
      count: tab.id === "all" ? rows.length : rows.filter(tab.match).length,
    }));
  }, [rows, statusTabs]);

  const activeTabDef = statusTabs?.find((t) => t.id === statusTab);

  const filtered = useMemo(() => {
    let list = rows;
    if (activeTabDef && statusTab !== "all") {
      list = list.filter(activeTabDef.match);
    }
    return list.filter((row) =>
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
  }, [rows, filters, values, activeTabDef, statusTab]);

  const resetFilters = () => setValues({});

  return (
    <div className="admin-data-table space-y-3">
      {tabsWithCounts.length > 0 ? (
        <AdminStatusTabs tabs={tabsWithCounts} activeId={statusTab} onChange={setStatusTab} />
      ) : null}

      {filters.length > 0 ? (
        <AdminFilterBar
          filters={filters}
          values={values}
          onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
          onReset={resetFilters}
          resultCount={{ filtered: filtered.length, total: rows.length }}
        />
      ) : null}

      {mobileCardRender ? (
        <div className="admin-data-table__mobile-cards space-y-3 md:hidden">
          {filtered.length === 0 ? (
            <p className="admin-data-table__empty">{emptyMessage}</p>
          ) : (
            filtered.map((row) => (
              <div key={getRowId(row)} className="admin-data-table__mobile-card">
                {mobileCardRender(row)}
              </div>
            ))
          )}
        </div>
      ) : null}

      <div
        className={`admin-data-table__wrap rounded-lg border border-slate-200 bg-white ${
          mobileCardRender ? "admin-data-table__desktop-table hidden md:block" : ""
        }${stickyHeader ? " admin-data-table__wrap--sticky" : ""}`}
      >
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
                <TableRow
                  key={getRowId(row)}
                  className={selectedRowId === getRowId(row) ? "admin-table__row--selected" : undefined}
                >
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
        {!filters.length ? (
          <p className="admin-data-table__footer-count">
            {filtered.length} / {rows.length}건
          </p>
        ) : null}
      </div>
    </div>
  );
}
