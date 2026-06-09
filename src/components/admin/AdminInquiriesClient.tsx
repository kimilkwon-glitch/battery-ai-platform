"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminCustomerPreviewLink } from "@/components/admin/AdminCustomerPreviewLink";
import { AdminMobileCard } from "@/components/admin/AdminMobileCard";
import { Badge } from "@/components/ui/badge";
import { INQUIRY_STATUS_BADGE } from "@/lib/admin/admin-status-tokens";
import {
  INQUIRY_CATEGORY_LABELS,
  INQUIRY_STATUS_LABELS,
  type CustomerInquiryRecord,
  type InquiryCategory,
  type InquiryStatus,
} from "@/types/customer-inquiry";
import { bm } from "@/lib/design-tokens";

const SOURCE_LABELS: Record<string, string> = {
  support: "고객센터",
  chat: "채팅",
  product_detail: "제품상세",
};

export function AdminInquiriesClient() {
  const [items, setItems] = useState<CustomerInquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<InquiryCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [memoDraft, setMemoDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (query.trim()) params.set("q", query.trim());
    const res = await fetch(`/api/admin/inquiries?${params}`, { credentials: "include" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.ok) {
      setError(data.message ?? "문의 목록을 불러오지 못했습니다.");
      return;
    }
    setItems(data.items ?? []);
  }, [statusFilter, categoryFilter, query]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) ?? null,
    [items, selectedId],
  );

  useEffect(() => {
    setMemoDraft(selected?.adminMemo ?? "");
  }, [selected?.id, selected?.adminMemo]);

  const patchInquiry = async (
    id: string,
    patch: { status?: InquiryStatus; adminMemo?: string },
  ) => {
    setSaving(true);
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok || !data.ok) {
      setError(data.message ?? "저장에 실패했습니다.");
      return false;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? data.item : i)));
    return true;
  };

  const handleStatusChange = async (status: InquiryStatus) => {
    if (!selected) return;
    await patchInquiry(selected.id, { status });
  };

  const handleMemoSave = async () => {
    if (!selected) return;
    await patchInquiry(selected.id, { adminMemo: memoDraft });
  };

  return (
    <div className="admin-inquiries space-y-4">
      <div className="admin-panel flex flex-wrap items-end gap-3 p-4">
        <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs font-bold text-slate-600">
          검색
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름, 연락처, 차량, 문의 내용"
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-slate-600">
          상태
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InquiryStatus | "all")}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          >
            <option value="all">전체</option>
            {(Object.keys(INQUIRY_STATUS_LABELS) as InquiryStatus[]).map((s) => (
              <option key={s} value={s}>
                {INQUIRY_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-slate-600">
          유형
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as InquiryCategory | "all")}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          >
            <option value="all">전체</option>
            {(Object.keys(INQUIRY_CATEGORY_LABELS) as InquiryCategory[]).map((c) => (
              <option key={c} value={c}>
                {INQUIRY_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="admin-btn admin-btn--secondary admin-btn--sm"
          onClick={() => void load()}
        >
          새로고침
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="admin-inquiries__layout grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="admin-panel min-h-[12rem] p-0">
          {loading ? (
            <p className="p-4 text-sm text-slate-500">불러오는 중…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-center text-sm font-medium text-slate-500">
              접수된 문의가 없습니다. 고객센터 문의폼에서 테스트 접수 후 새로고침하세요.
            </p>
          ) : (
            <>
              <ul className="hidden divide-y divide-slate-100 lg:block">
                {items.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(row.id)}
                      className={`admin-inquiries__list-item w-full px-4 py-3 text-left transition hover:bg-slate-50 ${
                        selectedId === row.id ? "bg-blue-50/80" : ""
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={INQUIRY_STATUS_BADGE[row.status]}>
                          {INQUIRY_STATUS_LABELS[row.status]}
                        </Badge>
                        <Badge variant="muted">{INQUIRY_CATEGORY_LABELS[row.category]}</Badge>
                        {row.source ? (
                          <span className="text-[10px] font-bold text-slate-400">
                            {SOURCE_LABELS[row.source] ?? row.source}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {row.name}
                        <span className="ml-2 font-medium text-slate-500">
                          {maskContact(row.contact)}
                        </span>
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{row.message}</p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {formatDate(row.createdAt)}
                        {row.vehicle ? ` · ${row.vehicle}` : ""}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="space-y-3 p-3 lg:hidden">
                {items.map((row) => (
                  <AdminMobileCard
                    key={row.id}
                    title={row.name}
                    badges={[
                      { label: INQUIRY_STATUS_LABELS[row.status], tone: INQUIRY_STATUS_BADGE[row.status] },
                      { label: INQUIRY_CATEGORY_LABELS[row.category], tone: "muted" },
                    ]}
                    lines={[
                      maskContact(row.contact),
                      formatDate(row.createdAt),
                      row.vehicle ?? row.message.slice(0, 40),
                    ]}
                    actions={
                      <button
                        type="button"
                        className="admin-btn admin-btn--secondary admin-btn--sm"
                        onClick={() => setSelectedId(row.id)}
                      >
                        상세 보기
                      </button>
                    }
                  />
                ))}
              </div>
            </>
          )}
        </section>

        <section className="admin-panel p-4">
          {!selected ? (
            <p className="text-sm text-slate-500">목록에서 문의를 선택하세요.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-slate-900">문의 상세</h2>
                  <p className="text-[10px] font-mono text-slate-400">{selected.id}</p>
                </div>
                <label className="flex flex-col gap-1 text-xs font-bold text-slate-600">
                  상태 변경
                  <select
                    value={selected.status}
                    disabled={saving}
                    onChange={(e) => void handleStatusChange(e.target.value as InquiryStatus)}
                    className="h-9 rounded-lg border border-slate-200 px-2 text-sm font-bold"
                  >
                    {(Object.keys(INQUIRY_STATUS_LABELS) as InquiryStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {INQUIRY_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <DetailRow label="이름" value={selected.name} />
                <DetailRow label="연락처" value={maskContact(selected.contact, false)} />
                <DetailRow label="유형" value={INQUIRY_CATEGORY_LABELS[selected.category]} />
                <DetailRow label="접수일" value={formatDate(selected.createdAt)} />
                {selected.vehicle ? <DetailRow label="차량" value={selected.vehicle} /> : null}
                {selected.batteryCode ? (
                  <DetailRow label="배터리 규격" value={selected.batteryCode} />
                ) : null}
                {selected.inquiryType ? (
                  <DetailRow label="세부 유형" value={selected.inquiryType} />
                ) : null}
              </dl>

              <div>
                <p className="text-xs font-bold text-slate-500">문의 내용</p>
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-800">
                  {selected.message}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">관리자 메모</label>
                <textarea
                  value={memoDraft}
                  onChange={(e) => setMemoDraft(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="내부 메모 (고객에게 노출되지 않음)"
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--primary admin-btn--sm mt-2"
                  disabled={saving}
                  onClick={() => void handleMemoSave()}
                >
                  메모 저장
                </button>
              </div>

              {selected.pageUrl ? (
                <AdminCustomerPreviewLink href={selected.pageUrl} />
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase text-slate-400">{label}</dt>
      <dd className="font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ko-KR");
  } catch {
    return iso;
  }
}

/** 로그·목록에서 연락처 일부 마스킹 */
function maskContact(contact: string, list = true): string {
  const c = contact.trim();
  if (!c) return "—";
  if (c.length <= 4) return c;
  if (list && c.length > 6) {
    return `${c.slice(0, 3)}***${c.slice(-2)}`;
  }
  return c;
}
