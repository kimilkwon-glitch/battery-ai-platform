"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AdminReviewBadge } from "@/components/admin/AdminReviewBadge";
import { AdminBatteryMatchBadge } from "@/components/admin/AdminBatteryMatchBadge";
import { AdminCustomerPreviewLink } from "@/components/admin/AdminCustomerPreviewLink";
import { AdminDataTableClient } from "@/components/admin/AdminDataTableClient";
import { AdminMobileCard } from "@/components/admin/AdminMobileCard";
import { AdminQuickFilterChips } from "@/components/admin/AdminQuickFilterChips";
import type { AdminTableStatusTab } from "@/components/admin/AdminDataTableClient";
import type { AdminMatchingRow } from "@/types/admin";

const QUICK_VEHICLES = [
  { id: "grandeur", label: "그랜저HG", match: (n: string) => /그랜저|grandeur/i.test(n) },
  { id: "staria", label: "스타리아", match: (n: string) => /스타리아|staria/i.test(n) },
  { id: "gv70", label: "GV70", match: (n: string) => /gv70/i.test(n) },
  { id: "gv80", label: "GV80", match: (n: string) => /gv80/i.test(n) },
  { id: "porter", label: "포터2", match: (n: string) => /포터|porter/i.test(n) },
  { id: "qm6", label: "QM6", match: (n: string) => /qm6/i.test(n) },
  { id: "santafe", label: "싼타페", match: (n: string) => /싼타페|santafe/i.test(n) },
  { id: "sorento", label: "쏘렌토", match: (n: string) => /쏘렌토|sorento/i.test(n) },
];

type Props = { rows: AdminMatchingRow[] };

export function AdminMatchingTable({ rows }: Props) {
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const quickChip = QUICK_VEHICLES.find((v) => v.id === quickFilter);

  const displayRows = useMemo(() => {
    if (!quickChip) return rows;
    return rows.filter((r) => quickChip.match(r.vehicleName));
  }, [rows, quickChip]);

  const statusTabs: AdminTableStatusTab<AdminMatchingRow>[] = [
    { id: "all", label: "전체", match: () => true },
    {
      id: "needs_review",
      label: "확인 필요",
      tone: "warning",
      match: (r) =>
        r.reviewStatus !== "ok" ||
        r.vehicleStatus !== "ok" ||
        r.terminalConflict ||
        r.agmConflict,
    },
    {
      id: "lr_conflict",
      label: "L/R 충돌 의심",
      tone: "danger",
      match: (r) => r.terminalConflict,
    },
    {
      id: "no_product",
      label: "상품 없음",
      tone: "danger",
      match: (r) => r.batteryMatchStatus === "unmatched",
    },
    {
      id: "reviewed",
      label: "검수 완료",
      tone: "info",
      match: (r) =>
        r.batteryMatchStatus === "matched" &&
        r.vehicleStatus === "ok" &&
        !r.terminalConflict,
    },
    {
      id: "image_missing",
      label: "이미지 없음",
      tone: "warning",
      match: (r) => r.imageStatus !== "present",
    },
  ];

  const selected = displayRows.find((r) => r.slug === selectedSlug) ?? null;

  return (
    <div className="admin-matching space-y-4">
      <AdminQuickFilterChips
        chips={QUICK_VEHICLES.map((v) => ({ id: v.id, label: v.label }))}
        activeId={quickFilter}
        onChange={setQuickFilter}
      />

      <div className="admin-matching__workspace">
        <div className="admin-matching__list">
          <AdminDataTableClient
            rows={displayRows}
            getRowId={(r) => r.slug}
            selectedRowId={selectedSlug}
            statusTabs={statusTabs}
            filters={[
              {
                key: "vehicleName",
                label: "차량명",
                type: "search",
                placeholder: "차량명 검색",
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
            ]}
            columns={[
              {
                key: "vehicleName",
                label: "차량",
                render: (r) => (
                  <button
                    type="button"
                    className="admin-matching__row-btn text-left"
                    onClick={() => setSelectedSlug(r.slug)}
                  >
                    <p className={`admin-cell-primary${r.terminalConflict || r.agmConflict ? " admin-cell-primary--danger" : ""}`}>
                      {r.vehicleName}
                    </p>
                    <p className="admin-cell-muted">
                      {r.yearRange} · {r.fuel}
                    </p>
                  </button>
                ),
              },
              {
                key: "connectedBattery",
                label: "현재 규격",
                render: (r) => (
                  <span className="admin-cell-primary font-mono">{r.connectedBattery}</span>
                ),
              },
              {
                key: "customerFacingBattery",
                label: "추천 상품",
                render: (r) => (
                  <span className="admin-cell-muted">
                    {r.customerFacingBattery ?? "—"}
                  </span>
                ),
              },
              {
                key: "terminal",
                label: "L/R",
                render: (r) =>
                  r.terminalConflict ? (
                    <Badge variant="danger">충돌</Badge>
                  ) : (
                    <Badge variant="success">정상</Badge>
                  ),
              },
              {
                key: "batteryMatchStatus",
                label: "상태",
                render: (r) => <AdminBatteryMatchBadge status={r.batteryMatchStatus} />,
              },
              {
                key: "vehicleStatus",
                label: "검수",
                render: (r) => <AdminReviewBadge status={r.vehicleStatus} />,
              },
              {
                key: "detail",
                label: "",
                className: "admin-cell-actions",
                render: (r) => (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="admin-btn admin-btn--secondary admin-btn--md"
                      onClick={() => setSelectedSlug(r.slug)}
                    >
                      상세
                    </button>
                    <AdminCustomerPreviewLink href={`/vehicle/${r.slug}`} />
                  </div>
                ),
              },
            ]}
            emptyMessage="조건에 맞는 매칭 항목이 없습니다."
            mobileCardRender={(r) => (
              <AdminMobileCard
                title={r.vehicleName}
                badges={[
                  {
                    label: r.terminalConflict ? "L/R 충돌" : "L/R 정상",
                    tone: r.terminalConflict ? "danger" : "success",
                  },
                  {
                    label: r.batteryMatchStatus === "matched" ? "매칭완료" : "미매칭",
                    tone: r.batteryMatchStatus === "matched" ? "success" : "danger",
                  },
                ]}
                lines={[
                  `${r.connectedBattery} · ${r.fuel}`,
                  r.reviewMemo ?? "—",
                ]}
                actions={
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary admin-btn--md"
                    onClick={() => setSelectedSlug(r.slug)}
                  >
                    상세
                  </button>
                }
              />
            )}
          />
        </div>

        <aside className="admin-matching__detail admin-panel">
          {!selected ? (
            <div className="admin-inquiries__detail-empty">
              <p className="admin-inquiries__detail-empty-title">목록에서 차량을 선택하세요</p>
              <p className="admin-inquiries__detail-empty-desc">
                L/R 충돌·미매칭·확인 필요 항목을 빠르게 검수합니다.
              </p>
            </div>
          ) : (
            <div className="admin-matching__detail-inner p-4">
              <h3 className="admin-matching__detail-title">{selected.vehicleName}</h3>
              <p className="admin-matching__detail-sub">
                {selected.yearRange} · {selected.fuel}
              </p>
              <dl className="admin-inquiries__dl mt-4">
                <div className="admin-inquiries__dl-row">
                  <dt>현재 규격</dt>
                  <dd className="font-mono">{selected.connectedBattery}</dd>
                </div>
                <div className="admin-inquiries__dl-row">
                  <dt>추천 상품</dt>
                  <dd>{selected.customerFacingBattery ?? "—"}</dd>
                </div>
                <div className="admin-inquiries__dl-row">
                  <dt>후보 규격</dt>
                  <dd>{selected.candidateBatteries.join(", ") || "—"}</dd>
                </div>
                <div className="admin-inquiries__dl-row">
                  <dt>L/R 방향</dt>
                  <dd>{selected.terminalConflict ? "충돌 의심" : "정상"}</dd>
                </div>
                <div className="admin-inquiries__dl-row">
                  <dt>AGM</dt>
                  <dd>{selected.agmConflict ? "확인 필요" : "정상"}</dd>
                </div>
              </dl>
              {selected.reviewMemo ? (
                <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                  {selected.reviewMemo}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <AdminCustomerPreviewLink href={`/vehicle/${selected.slug}`} />
                <a
                  href={`/admin/vehicles?q=${encodeURIComponent(selected.vehicleName)}`}
                  className="admin-btn admin-btn--secondary admin-btn--md"
                >
                  차량 DB
                </a>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
