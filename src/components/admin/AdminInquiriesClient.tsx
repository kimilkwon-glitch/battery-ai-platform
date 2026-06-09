"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminCustomerPreviewLink } from "@/components/admin/AdminCustomerPreviewLink";
import { AdminMobileCard } from "@/components/admin/AdminMobileCard";
import { AdminQuickFilterChips } from "@/components/admin/AdminQuickFilterChips";
import { AdminStatusTabs } from "@/components/admin/AdminStatusTabs";
import { Badge } from "@/components/ui/badge";
import { INQUIRY_STATUS_BADGE } from "@/lib/admin/admin-status-tokens";
import {
  INQUIRY_CATEGORY_LABELS,
  INQUIRY_STATUS_LABELS,
  type CustomerInquiryRecord,
  type InquiryCategory,
  type InquiryStatus,
} from "@/types/customer-inquiry";

const SOURCE_LABELS: Record<string, string> = {
  support: "고객센터",
  chat: "채팅",
  batterytalk: "배터리톡",
  product_detail: "제품상세(레거시)",
  product_qna: "상품Q&A",
};

const CATEGORY_CHIPS = [
  { id: "order", label: "주문" },
  { id: "shipping", label: "배송·방문" },
  { id: "battery", label: "배터리" },
  { id: "return", label: "반품·보증" },
  { id: "other", label: "기타" },
] as const;

const STATUS_TABS: { id: InquiryStatus | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "new", label: "신규" },
  { id: "in_progress", label: "확인중" },
  { id: "done", label: "처리완료" },
  { id: "on_hold", label: "보류" },
];

export function AdminInquiriesClient() {
  const [items, setItems] = useState<CustomerInquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<InquiryStatus | "all">("all");
  const [categoryChip, setCategoryChip] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [memoDraft, setMemoDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/inquiries?limit=500", { credentials: "include" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.ok) {
      setError(data.message ?? "문의 목록을 불러오지 못했습니다.");
      return;
    }
    setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    for (const s of ["new", "in_progress", "done", "on_hold"] as InquiryStatus[]) {
      counts[s] = items.filter((i) => i.status === s).length;
    }
    return counts;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((row) => {
      if (statusTab !== "all" && row.status !== statusTab) return false;
      if (categoryChip && row.category !== categoryChip) return false;
      if (dateFrom) {
        const d = new Date(row.createdAt);
        if (d < new Date(`${dateFrom}T00:00:00`)) return false;
      }
      if (dateTo) {
        const d = new Date(row.createdAt);
        if (d > new Date(`${dateTo}T23:59:59`)) return false;
      }
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.contact.toLowerCase().includes(q) ||
        (row.vehicle ?? "").toLowerCase().includes(q) ||
        row.message.toLowerCase().includes(q)
      );
    });
  }, [items, statusTab, categoryChip, query, dateFrom, dateTo]);

  const selected = useMemo(
    () => filtered.find((i) => i.id === selectedId) ?? items.find((i) => i.id === selectedId) ?? null,
    [filtered, items, selectedId],
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

  const handleQuickStatus = async (status: InquiryStatus) => {
    if (!selected) return;
    await patchInquiry(selected.id, { status });
  };

  const copyContact = async () => {
    if (!selected?.contact) return;
    try {
      await navigator.clipboard.writeText(selected.contact);
    } catch {
      /* ignore */
    }
  };

  const resetFilters = () => {
    setQuery("");
    setCategoryChip(null);
    setDateFrom("");
    setDateTo("");
    setStatusTab("all");
  };

  const selectInquiry = (id: string) => {
    setSelectedId(id);
    setMobileDetailOpen(true);
  };

  const hasFilterActive =
    statusTab !== "all" || categoryChip != null || query.trim() !== "" || dateFrom !== "" || dateTo !== "";

  return (
    <div className="admin-inquiries space-y-4">
      <AdminStatusTabs
        tabs={STATUS_TABS.map((t) => ({
          id: t.id,
          label: t.label,
          count: statusCounts[t.id],
          tone:
            t.id === "new" && statusCounts.new > 0
              ? "info"
              : t.id === "on_hold" && statusCounts.on_hold > 0
                ? "warning"
                : "default",
        }))}
        activeId={statusTab}
        onChange={(id) => setStatusTab(id as InquiryStatus | "all")}
      />

      <div className="admin-filter-bar">
        <div className="admin-filter-bar__fields">
          <div className="admin-filter-bar__field admin-filter-bar__field--wide">
            <label className="admin-filter-bar__label">검색</label>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름, 연락처, 차량명, 문의 내용"
              className="admin-filter-bar__input h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            />
          </div>
          <div className="admin-filter-bar__field">
            <label className="admin-filter-bar__label">기간 시작</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="admin-filter-bar__input h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            />
          </div>
          <div className="admin-filter-bar__field">
            <label className="admin-filter-bar__label">기간 종료</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="admin-filter-bar__input h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            />
          </div>
        </div>
        <div className="admin-filter-bar__actions">
          <p className="admin-filter-bar__count">
            {filtered.length} / {items.length}건
          </p>
          <button
            type="button"
            className="admin-btn admin-btn--secondary admin-btn--md"
            onClick={() => void load()}
          >
            새로고침
          </button>
          {hasFilterActive ? (
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--md" onClick={resetFilters}>
              초기화
            </button>
          ) : null}
        </div>
      </div>

      <AdminQuickFilterChips
        chips={CATEGORY_CHIPS.map((c) => ({ id: c.id, label: c.label }))}
        activeId={categoryChip}
        onChange={setCategoryChip}
      />

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="admin-inquiries__layout">
        <section className="admin-inquiries__list admin-panel p-0">
          {loading ? (
            <p className="admin-inquiries__empty">불러오는 중…</p>
          ) : filtered.length === 0 ? (
            <div className="admin-inquiries__empty">
              <p className="font-bold text-slate-700">조건에 맞는 문의가 없습니다</p>
              <p className="mt-1 text-slate-500">
                필터를 초기화하거나 고객센터 문의폼에서 테스트 접수 후 새로고침하세요.
              </p>
            </div>
          ) : (
            <>
              <ul className="hidden lg:block">
                {filtered.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(row.id)}
                      className={`admin-inquiries__list-item${selectedId === row.id ? " admin-inquiries__list-item--active" : ""}`}
                    >
                      <div className="admin-inquiries__list-badges">
                        <Badge variant={INQUIRY_STATUS_BADGE[row.status]}>
                          {INQUIRY_STATUS_LABELS[row.status]}
                        </Badge>
                        <Badge variant="muted">{INQUIRY_CATEGORY_LABELS[row.category]}</Badge>
                      </div>
                      <p className="admin-inquiries__list-name">
                        {row.name}
                        <span className="admin-inquiries__list-contact">{maskContact(row.contact)}</span>
                      </p>
                      {row.vehicle ? (
                        <p className="admin-inquiries__list-vehicle">{row.vehicle}</p>
                      ) : null}
                      <p className="admin-inquiries__list-message">{row.message}</p>
                      <p className="admin-inquiries__list-date">{formatDate(row.createdAt)}</p>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="space-y-3 p-3 lg:hidden">
                {filtered.map((row) => (
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
                      row.vehicle ?? row.message.slice(0, 60),
                    ]}
                    actions={
                      <button
                        type="button"
                        className="admin-btn admin-btn--primary admin-btn--md"
                        onClick={() => selectInquiry(row.id)}
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

        <section
          className={`admin-inquiries__detail admin-panel${mobileDetailOpen ? " admin-inquiries__detail--open" : ""}`}
        >
          {!selected ? (
            <div className="admin-inquiries__detail-empty">
              <p className="admin-inquiries__detail-empty-title">왼쪽에서 문의를 선택하세요</p>
              <p className="admin-inquiries__detail-empty-desc">
                목록을 클릭하면 고객 정보·문의 내용·처리 메모를 이곳에서 확인합니다.
              </p>
            </div>
          ) : (
            <div className="admin-inquiries__detail-inner">
              <button
                type="button"
                className="admin-inquiries__detail-close lg:hidden"
                onClick={() => setMobileDetailOpen(false)}
              >
                목록으로
              </button>

              <div className="admin-inquiries__detail-scroll">
                <section className="admin-inquiries__section">
                  <h3 className="admin-inquiries__section-title">고객 정보</h3>
                  <dl className="admin-inquiries__dl">
                    <DetailRow label="이름" value={selected.name} />
                    <DetailRow label="연락처" value={maskContact(selected.contact, false)} />
                    <DetailRow label="유형" value={INQUIRY_CATEGORY_LABELS[selected.category]} />
                    <DetailRow label="접수일" value={formatDate(selected.createdAt)} />
                    {selected.source ? (
                      <DetailRow label="접수 경로" value={SOURCE_LABELS[selected.source] ?? selected.source} />
                    ) : null}
                  </dl>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary admin-btn--md mt-2"
                    onClick={() => void copyContact()}
                  >
                    연락처 복사
                  </button>
                </section>

                {(selected.vehicle || selected.batteryCode) && (
                  <section className="admin-inquiries__section">
                    <h3 className="admin-inquiries__section-title">차량 정보</h3>
                    <dl className="admin-inquiries__dl">
                      {selected.vehicle ? <DetailRow label="차량" value={selected.vehicle} /> : null}
                      {selected.batteryCode ? (
                        <DetailRow label="배터리 규격" value={selected.batteryCode} />
                      ) : null}
                      {selected.inquiryType ? (
                        <DetailRow label="세부 유형" value={selected.inquiryType} />
                      ) : null}
                    </dl>
                  </section>
                )}

                <section className="admin-inquiries__section">
                  <h3 className="admin-inquiries__section-title">문의 내용</h3>
                  <p className="admin-inquiries__message">{selected.message}</p>
                </section>

                <section className="admin-inquiries__section">
                  <h3 className="admin-inquiries__section-title">처리</h3>
                  <label className="admin-inquiries__field-label">
                    상태
                    <select
                      value={selected.status}
                      disabled={saving}
                      onChange={(e) => void handleStatusChange(e.target.value as InquiryStatus)}
                      className="admin-inquiries__select"
                    >
                      {(Object.keys(INQUIRY_STATUS_LABELS) as InquiryStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {INQUIRY_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-inquiries__field-label mt-3">
                    관리자 메모
                    <textarea
                      value={memoDraft}
                      onChange={(e) => setMemoDraft(e.target.value)}
                      rows={3}
                      className="admin-inquiries__textarea"
                      placeholder="내부 메모 (고객에게 노출되지 않음)"
                    />
                  </label>
                </section>

                {selected.pageUrl ? (
                  <div className="px-4 pb-2">
                    <AdminCustomerPreviewLink href={selected.pageUrl} />
                  </div>
                ) : null}
              </div>

              <div className="admin-inquiries__detail-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--primary admin-btn--md"
                  disabled={saving}
                  onClick={() => void handleMemoSave()}
                >
                  저장
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary admin-btn--md"
                  disabled={saving}
                  onClick={() => void handleQuickStatus("done")}
                >
                  처리완료
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--md"
                  disabled={saving}
                  onClick={() => void handleQuickStatus("on_hold")}
                >
                  보류
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-inquiries__dl-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
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

function maskContact(contact: string, list = true): string {
  const c = contact.trim();
  if (!c) return "—";
  if (c.length <= 4) return c;
  if (list && c.length > 6) {
    return `${c.slice(0, 3)}***${c.slice(-2)}`;
  }
  return c;
}
