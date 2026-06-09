"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminCustomerPreviewLink } from "@/components/admin/AdminCustomerPreviewLink";
import { OrderRequestDetailPanel } from "@/components/admin/order-requests/OrderRequestDetailPanel";
import { OrderRequestList } from "@/components/admin/order-requests/OrderRequestList";
import {
  ADMIN_ORDER_REQUEST_FILTERS,
  type AdminOrderRequestFilterKey,
} from "@/lib/order-request/order-request-admin-constants";
import {
  filterToApiStatus,
  matchesAdminOrderFilter,
  matchesAdminOrderSearch,
} from "@/lib/order-request/order-request-admin-filters";
import {
  fetchAdminOrderRequestDetail,
  fetchAdminOrderRequests,
} from "@/lib/order-request/order-request-client-api";
import {
  listItemToOrderRequestRecord,
  persistedToOrderRequestRecord,
} from "@/lib/order-request/order-request-mapper";
import { listOrderRequestRecords } from "@/lib/order-request/order-request-admin-storage";
import { isAdminTestOrderRequestRecord } from "@/lib/admin/admin-test-data-filter";
import { ORDER_REQUEST_PAGE } from "@/lib/customer-center-routes";
import type { OrderRequestRecord } from "@/types/order-request";
import { AdminStatusTabs } from "@/components/admin/AdminStatusTabs";

type Props = {
  /** 개발용: ?fallback=local 일 때만 localStorage 사용 */
  allowLocalFallback?: boolean;
};

export function AdminOrderRequestsClient({ allowLocalFallback }: Props) {
  const [records, setRecords] = useState<OrderRequestRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<AdminOrderRequestFilterKey>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadList = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setUsingLocalFallback(false);

    const apiStatus = filterToApiStatus(filter);
    const res = await fetchAdminOrderRequests({
      status: apiStatus,
      q: debouncedSearch || undefined,
    });

    if (res.ok && res.items) {
      const mapped = res.items
        .map(listItemToOrderRequestRecord)
        .filter((r) => !isAdminTestOrderRequestRecord(r));
      setRecords(mapped);
      setSelectedId((prev) => {
        if (mapped.length === 0) return null;
        if (prev && mapped.some((r) => r.id === prev)) return prev;
        return mapped[0]!.id;
      });
      setLoading(false);
      return;
    }

    if (allowLocalFallback) {
      const list = listOrderRequestRecords();
      setUsingLocalFallback(true);
      setRecords(list);
      setSelectedId((prev) => {
        if (list.length === 0) return null;
        if (prev && list.some((r) => r.id === prev)) return prev;
        return list[0]!.id;
      });
      setLoadError(
        res.error
          ? `${res.error} (개발용 localStorage 데이터를 표시합니다.)`
          : null,
      );
      setLoading(false);
      return;
    }

    setRecords([]);
    setSelectedId(null);
    setLoadError(res.error ?? "주문 요청 목록을 불러오지 못했습니다.");
    setLoading(false);
  }, [filter, debouncedSearch, allowLocalFallback]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const filtered = useMemo(
    () =>
      records.filter(
        (r) => matchesAdminOrderFilter(r, filter) && matchesAdminOrderSearch(r, search),
      ),
    [records, filter, search],
  );

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null;

  const loadDetail = useCallback(
    async (id: string) => {
      if (usingLocalFallback) return;
      setDetailLoading(true);
      setDetailError(null);
      const res = await fetchAdminOrderRequestDetail(id);
      setDetailLoading(false);
      if (res.ok && res.record) {
        const mapped = persistedToOrderRequestRecord(res.record);
        setRecords((prev) => prev.map((r) => (r.id === id ? mapped : r)));
        return;
      }
      setDetailError(res.error ?? "상세를 불러오지 못했습니다.");
    },
    [usingLocalFallback],
  );

  useEffect(() => {
    if (selectedId && !usingLocalFallback) void loadDetail(selectedId);
  }, [selectedId, usingLocalFallback, loadDetail]);

  const handleRecordChange = useCallback((next: OrderRequestRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === next.id ? next : r)));
  }, []);

  const statusTabs = ADMIN_ORDER_REQUEST_FILTERS.map((f) => ({
    id: f.key,
    label: f.label,
    count: records.filter((r) => matchesAdminOrderFilter(r, f.key)).length,
  }));

  return (
    <div className="admin-order-requests space-y-2">
      {usingLocalFallback ? (
        <p className="text-sm font-bold text-amber-800" role="status">
          API 실패 — 개발용 localStorage fallback 사용 중
        </p>
      ) : null}

      <div className="admin-toolbar">
        <p className="admin-toolbar__hint">상담 주문 요청을 확인하고 처리 상태를 업데이트합니다.</p>
        <button
          type="button"
          onClick={() => void loadList()}
          disabled={loading}
          className="admin-btn admin-btn--secondary admin-btn--md disabled:opacity-50"
        >
          새로고침
        </button>
      </div>

      {loading ? (
        <div className="admin-panel p-6 text-center text-sm font-medium text-slate-600">
          관리자 주문 요청을 불러오는 중입니다.
        </div>
      ) : loadError && records.length === 0 ? (
        <div className="admin-panel space-y-3 p-6 text-center">
          <p className="text-sm font-bold text-red-700" role="alert">
            주문 요청 목록을 불러오지 못했습니다.
          </p>
          <p className="text-sm text-slate-600">{loadError}</p>
          <button type="button" onClick={() => void loadList()} className="admin-btn admin-btn--primary admin-btn--md">
            다시 시도
          </button>
        </div>
      ) : records.length === 0 ? (
        <div className="admin-panel space-y-4 p-6 text-center">
          <h2 className="text-lg font-black text-slate-950">아직 접수된 상담 주문 요청이 없습니다</h2>
          <p className="text-sm font-medium text-slate-600">
            고객이 상담 주문 요청 폼을 작성하면 이곳에서 확인할 수 있습니다.
          </p>
          <AdminCustomerPreviewLink href={ORDER_REQUEST_PAGE} label="고객 화면 보기" />
        </div>
      ) : (
        <div className="admin-workspace space-y-2">
          {loadError ? (
            <p className="text-sm font-bold text-amber-800" role="alert">
              {loadError}
            </p>
          ) : null}

          <div className="admin-filter-bar">
            <div className="admin-filter-bar__fields">
              <div className="admin-filter-bar__field admin-filter-bar__field--search">
                <label className="admin-filter-bar__label">검색</label>
                <input
                  type="search"
                  placeholder="접수번호, 고객명, 연락처, 차량, 규격"
                  className="admin-filter-bar__input w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <p className="admin-filter-bar__count">{filtered.length} / {records.length}건</p>
          </div>

          <AdminStatusTabs tabs={statusTabs} activeId={filter} onChange={(id) => setFilter(id as AdminOrderRequestFilterKey)} />

          {filtered.length === 0 ? (
            <p className="admin-data-table__empty">필터 조건에 맞는 요청이 없습니다.</p>
          ) : (
            <div className="admin-inquiries__layout admin-order-requests__workspace">
              <OrderRequestList
                records={filtered}
                selectedId={selected?.id ?? null}
                onSelect={setSelectedId}
                apiMode={!usingLocalFallback}
              />
              {selected && !usingLocalFallback ? (
                <OrderRequestDetailPanel
                  record={selected}
                  detailLoading={detailLoading}
                  onRecordChange={handleRecordChange}
                />
              ) : selected && usingLocalFallback ? (
                <aside className="admin-panel admin-inquiries__detail p-4 text-sm text-slate-600">
                  localStorage fallback 모드에서는 API 상세·PATCH를 사용할 수 없습니다.
                </aside>
              ) : (
                <aside className="admin-panel admin-inquiries__detail">
                  <div className="admin-inquiries__detail-empty">
                    <p className="admin-inquiries__detail-empty-title">목록에서 주문을 선택하세요</p>
                    <p className="admin-inquiries__detail-empty-desc">접수번호·고객·차량 정보를 확인하고 처리 상태를 변경합니다.</p>
                  </div>
                </aside>
              )}
            </div>
          )}
          {detailError ? (
            <p className="text-sm font-bold text-red-700" role="alert">
              {detailError}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
