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
import { ORDER_REQUEST_PAGE } from "@/lib/customer-center-routes";
import type { OrderRequestRecord } from "@/types/order-request";
import { bm } from "@/lib/design-tokens";

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
      const mapped = res.items.map(listItemToOrderRequestRecord);
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

  return (
    <div className="space-y-4">
      {usingLocalFallback ? (
        <p className="text-xs font-bold text-amber-800" role="status">
          API 실패 — 개발용 localStorage fallback 사용 중
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => void loadList()}
          disabled={loading}
          className="admin-btn admin-btn--secondary admin-btn--sm disabled:opacity-50"
        >
          새로고침
        </button>
      </div>

      {loading ? (
          <div className={`${bm.card} ${bm.cardPad} text-center text-sm font-medium text-slate-600`}>
            관리자 주문 요청을 불러오는 중입니다.
          </div>
        ) : loadError && records.length === 0 ? (
          <div className={`${bm.card} ${bm.cardPad} space-y-3 text-center`}>
            <p className="text-sm font-bold text-red-700" role="alert">
              주문 요청 목록을 불러오지 못했습니다.
            </p>
            <p className="text-xs text-slate-600">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadList()}
              className={`${bm.btnNavy} text-sm`}
            >
              다시 시도
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className={`${bm.card} ${bm.cardPad} space-y-4 text-center`}>
            <h2 className="text-lg font-black text-slate-950">
              아직 접수된 상담 주문 요청이 없습니다
            </h2>
            <p className="text-sm font-medium text-slate-600">
              고객이 상담 주문 요청 폼을 작성하면 이곳에서 확인할 수 있습니다.
            </p>
            <AdminCustomerPreviewLink href={ORDER_REQUEST_PAGE} />
          </div>
        ) : (
          <>
            {loadError ? (
              <p className="text-xs font-bold text-amber-800" role="alert">
                {loadError}
              </p>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="search"
                placeholder="접수번호, 고객명, 연락처, 차량, 규격 검색"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ADMIN_ORDER_REQUEST_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full px-3 py-1 text-[11px] font-black ${
                    filter === f.key
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="text-sm font-medium text-slate-500">
                필터 조건에 맞는 요청이 없습니다.
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
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
                  <aside className={`${bm.card} ${bm.cardPad} text-xs text-slate-600`}>
                    localStorage fallback 모드에서는 API 상세·PATCH를 사용할 수 없습니다.
                    ?fallback=local 을 제거하고 API로 접속해 주세요.
                  </aside>
                ) : null}
              </div>
            )}
            {detailError ? (
              <p className="text-xs font-bold text-red-700" role="alert">
                {detailError}
              </p>
            ) : null}
          </>
        )}
    </div>
  );
}
