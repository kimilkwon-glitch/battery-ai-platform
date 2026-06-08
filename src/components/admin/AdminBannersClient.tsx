"use client";

import { useCallback, useEffect, useState } from "react";
import type { MainBannerRecord, MainBannerUpsertInput } from "@/types/main-banner";
import { bm } from "@/lib/design-tokens";
import { CONTENT_DISPLAY_LIMITS } from "@/lib/content-display-limits";

const EMPTY: MainBannerUpsertInput = {
  title: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  mobileImageUrl: "",
  linkUrl: "/",
  buttonText: "",
  promoLabel: "",
  imageAlt: "",
  status: "inactive",
  sortOrder: 0,
  showOnMain: true,
};

export function AdminBannersClient() {
  const [items, setItems] = useState<MainBannerRecord[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<MainBannerUpsertInput>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p = 1, append = false) => {
    setLoading(true);
    const res = await fetch(`/api/admin/banners?page=${p}&limit=${CONTENT_DISPLAY_LIMITS.adminListPageSize}`, {
      credentials: "include",
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.ok) {
      setError(data.message ?? "목록을 불러오지 못했습니다.");
      return;
    }
    setItems((prev) => (append ? [...prev, ...data.items] : data.items));
    setHasMore(data.hasMore);
    setPage(p);
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  const save = async () => {
    const url = editingId ? `/api/admin/banners/${editingId}` : "/api/admin/banners";
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.message ?? "저장 실패");
      return;
    }
    setShowForm(false);
    await load(1);
  };

  const toggle = async (id: string) => {
    await fetch(`/api/admin/banners/${id}/toggle`, { method: "POST", credentials: "include" });
    await load(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-3">
        <p className="text-xs text-slate-600">메인 배너는 개수 제한 없이 carousel로 노출됩니다.</p>
        <button type="button" className={bm.btnNavy} onClick={() => { setEditingId(null); setForm(EMPTY); setShowForm(true); }}>
          배너 추가
        </button>
      </div>
      {error ? <p className="text-xs font-bold text-red-700">{error}</p> : null}
      {showForm ? (
        <section className={`${bm.card} ${bm.cardPad} grid gap-3 sm:grid-cols-2`}>
          <label className="text-xs block sm:col-span-2"><span className="font-bold">제목</span><input className="mt-1 w-full rounded border px-2 py-1.5" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></label>
          <label className="text-xs block"><span className="font-bold">보조 문구</span><input className="mt-1 w-full rounded border px-2 py-1.5" value={form.subtitle ?? ""} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} /></label>
          <label className="text-xs block"><span className="font-bold">링크 URL</span><input className="mt-1 w-full rounded border px-2 py-1.5" value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} /></label>
          <label className="text-xs block"><span className="font-bold">PC 이미지 URL</span><input className="mt-1 w-full rounded border px-2 py-1.5" value={form.imageUrl ?? ""} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} /></label>
          <label className="text-xs block"><span className="font-bold">모바일 이미지 URL</span><input className="mt-1 w-full rounded border px-2 py-1.5" value={form.mobileImageUrl ?? ""} onChange={(e) => setForm((f) => ({ ...f, mobileImageUrl: e.target.value }))} /></label>
          <label className="text-xs block"><span className="font-bold">노출 순서</span><input type="number" className="mt-1 w-full rounded border px-2 py-1.5" value={form.sortOrder ?? 0} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} /></label>
          <label className="text-xs block"><span className="font-bold">상태</span><select className="mt-1 w-full rounded border px-2 py-1.5" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as MainBannerRecord["status"] }))}><option value="active">활성</option><option value="inactive">비활성</option></select></label>
          <div className="sm:col-span-2 flex gap-2 justify-end"><button type="button" className={bm.btnTertiary} onClick={() => setShowForm(false)}>취소</button><button type="button" className={bm.btnNavy} onClick={() => void save()}>저장</button></div>
        </section>
      ) : null}
      <table className={`${bm.card} w-full text-xs`}>
        <thead><tr className="border-b bg-slate-50 text-left"><th className="p-3">제목</th><th className="p-3">순서</th><th className="p-3">상태</th><th className="p-3">관리</th></tr></thead>
        <tbody>
          {loading && items.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-slate-500">불러오는 중…</td></tr> : null}
          {items.map((b) => (
            <tr key={b.id} className="border-b">
              <td className="p-3 font-bold">{b.title}</td>
              <td className="p-3">{b.sortOrder}</td>
              <td className="p-3">{b.status}</td>
              <td className="p-3 space-x-2">
                <button type="button" className="font-bold text-blue-700" onClick={() => { setEditingId(b.id); setForm(b); setShowForm(true); }}>수정</button>
                <button type="button" className="font-bold text-slate-600" onClick={() => void toggle(b.id)}>토글</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore ? <button type="button" className={bm.btnTertiary} onClick={() => void load(page + 1, true)}>더 불러오기</button> : null}
    </div>
  );
}
