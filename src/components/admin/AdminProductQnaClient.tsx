"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminMobileCard } from "@/components/admin/AdminMobileCard";
import { AdminQuickFilterChips } from "@/components/admin/AdminQuickFilterChips";
import { INQUIRY_STATUS_LABELS, type CustomerInquiryRecord, type InquiryStatus } from "@/types/customer-inquiry";

const STATUS_CHIPS = [
  { id: "all", label: "전체" },
  { id: "new", label: "답변대기" },
  { id: "done", label: "답변완료" },
] as const;

export function AdminProductQnaClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q")?.trim() || searchParams.get("query")?.trim() || "";
  const [items, setItems] = useState<CustomerInquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusChip, setStatusChip] = useState<string>("all");
  const [query, setQuery] = useState(initialQuery);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [memoDraft, setMemoDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/product-qna?limit=500", { credentials: "include" });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.ok) setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((row) => {
      if (statusChip === "new" && row.status === "done") return false;
      if (statusChip === "done" && row.status !== "done") return false;
      if (!q) return true;
      return (
        row.title?.toLowerCase().includes(q) ||
        row.message.toLowerCase().includes(q) ||
        row.batteryCode?.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.contact.toLowerCase().includes(q)
      );
    });
  }, [items, statusChip, query]);

  const selected = filtered.find((i) => i.id === selectedId) ?? items.find((i) => i.id === selectedId) ?? null;

  useEffect(() => {
    setMemoDraft(selected?.adminMemo ?? "");
  }, [selected?.id, selected?.adminMemo]);

  const patch = async (patchBody: { status?: InquiryStatus; adminMemo?: string; hidden?: boolean }) => {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/admin/inquiries/${selected.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchBody),
    });
    setSaving(false);
    void load();
  };

  return (
    <div className="admin-product-qna grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
      <div className="space-y-3">
        <AdminQuickFilterChips
          chips={STATUS_CHIPS.map((c) => ({ id: c.id, label: c.label }))}
          activeId={statusChip}
          onChange={(id) => setStatusChip(id ?? "all")}
        />
        <input
          className="admin-toolbar__search w-full"
          placeholder="상품명·규격·작성자·제목 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading ? (
          <p className="text-sm text-slate-500">불러오는 중…</p>
        ) : filtered.length === 0 ? (
          <div className="admin-panel rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm font-bold text-slate-700">답변 대기 중인 상품 문의가 없습니다.</p>
            <p className="mt-2 text-xs font-medium text-slate-500">
              새 상품 문의가 접수되면 이곳에서 확인할 수 있습니다.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className={`w-full text-left ${row.id === selectedId ? "ring-2 ring-blue-400" : ""}`}
                  onClick={() => setSelectedId(row.id)}
                >
                  <AdminMobileCard
                    title={row.title ?? row.message.slice(0, 40)}
                    lines={[
                      row.batteryCode ?? "—",
                      `${row.name} · ${INQUIRY_STATUS_LABELS[row.status]}`,
                      row.isSecret ? "비밀글" : "공개",
                    ]}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected ? (
        <aside className="admin-detail-panel space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-black text-slate-900">{selected.title ?? "상품 문의"}</h3>
          <p className="text-xs font-bold text-slate-500">
            {selected.batteryCode} · {selected.name} · {selected.contact}
          </p>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{selected.message}</p>
          <textarea
            className="admin-memo-input w-full"
            rows={5}
            value={memoDraft}
            onChange={(e) => setMemoDraft(e.target.value)}
            placeholder="관리자 답변"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              className="admin-btn-primary text-xs"
              onClick={() => void patch({ adminMemo: memoDraft, status: "done" })}
            >
              답변 저장
            </button>
            <button
              type="button"
              disabled={saving}
              className="admin-btn-secondary text-xs"
              onClick={() => void patch({ hidden: true })}
            >
              숨김
            </button>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
