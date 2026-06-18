"use client";

import { useCallback, useEffect, useState } from "react";
import type { CustomerReviewRecord, CustomerReviewUpsertInput } from "@/types/customer-review";
import { bm } from "@/lib/design-tokens";
import { CONTENT_DISPLAY_LIMITS } from "@/lib/content-display-limits";

const EMPTY: CustomerReviewUpsertInput = {
  authorName: "",
  content: "",
  vehicleName: "",
  branchName: "",
  serviceType: "",
  batteryCode: "",
  rating: 5,
  summary: "",
  status: "inactive",
  featured: false,
  pinned: false,
  showOnMain: false,
  sortOrder: 0,
};

export function AdminReviewsClient() {
  const [items, setItems] = useState<CustomerReviewRecord[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CustomerReviewUpsertInput>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async (p = 1, append = false) => {
    setLoading(true);
    const res = await fetch(`/api/admin/reviews?page=${p}&limit=${CONTENT_DISPLAY_LIMITS.adminListPageSize}`, {
      credentials: "include",
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.ok) return;
    setItems((prev) => (append ? [...prev, ...data.items] : data.items));
    setHasMore(data.hasMore);
    setPage(p);
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/reviews/${editingId}` : "/api/admin/reviews";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        await load(1);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id: string) => {
    if (togglingId) return;
    setTogglingId(id);
    try {
      await fetch(`/api/admin/reviews/${id}/toggle`, { method: "POST", credentials: "include" });
      await load(1);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <p className="text-xs text-slate-600">후기는 개수 제한 없이 추가 가능합니다. 메인 노출은 showOnMain으로 제어합니다.</p>
        <button type="button" className={bm.btnNavy} onClick={() => { setEditingId(null); setForm(EMPTY); setShowForm(true); }}>후기 추가</button>
      </div>
      {showForm ? (
        <section className={`${bm.card} ${bm.cardPad} grid gap-3 sm:grid-cols-2`}>
          <label className="text-xs block"><span className="font-bold">작성자(마스킹)</span><input className="mt-1 w-full rounded border px-2 py-1.5" value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} /></label>
          <label className="text-xs block"><span className="font-bold">차량명</span><input className="mt-1 w-full rounded border px-2 py-1.5" value={form.vehicleName ?? ""} onChange={(e) => setForm((f) => ({ ...f, vehicleName: e.target.value }))} /></label>
          <label className="text-xs block sm:col-span-2"><span className="font-bold">후기 내용</span><textarea className="mt-1 w-full rounded border px-2 py-1.5" rows={3} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} /></label>
          <label className="text-xs block"><span className="font-bold">메인 요약</span><input className="mt-1 w-full rounded border px-2 py-1.5" value={form.summary ?? ""} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} /></label>
          <label className="text-xs block"><span className="font-bold">순서</span><input type="number" className="mt-1 w-full rounded border px-2 py-1.5" value={form.sortOrder ?? 0} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} /></label>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.showOnMain} onChange={(e) => setForm((f) => ({ ...f, showOnMain: e.target.checked }))} />메인 노출</label>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />대표 후기</label>
          <div className="sm:col-span-2 flex justify-end gap-2"><button type="button" className={bm.btnTertiary} onClick={() => setShowForm(false)} disabled={saving}>취소</button><button type="button" className={bm.btnNavy} disabled={saving} onClick={() => void save()}>{saving ? "저장 중…" : "저장"}</button></div>
        </section>
      ) : null}
      <table className={`${bm.card} w-full text-xs`}>
        <thead><tr className="border-b bg-slate-50 text-left"><th className="p-3">작성자</th><th className="p-3">차량</th><th className="p-3">메인</th><th className="p-3">상태</th><th className="p-3">관리</th></tr></thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="p-3">{r.authorName}</td>
              <td className="p-3">{r.vehicleName ?? "—"}</td>
              <td className="p-3">{r.showOnMain ? "Y" : "—"}</td>
              <td className="p-3">{r.status}</td>
              <td className="p-3 space-x-2">
                <button type="button" className="font-bold text-blue-700" onClick={() => { setEditingId(r.id); setForm(r); setShowForm(true); }}>수정</button>
                <button type="button" className="font-bold text-slate-600" disabled={togglingId === r.id} onClick={() => void toggle(r.id)}>{togglingId === r.id ? "처리 중…" : "토글"}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore ? <button type="button" className={bm.btnTertiary} disabled={loading} onClick={() => void load(page + 1, true)}>더 불러오기</button> : null}
    </div>
  );
}
