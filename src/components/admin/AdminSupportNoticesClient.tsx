"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupportNoticeCategory, SupportNoticeRecord } from "@/lib/support-notices-store";
import { bm } from "@/lib/design-tokens";

type FormState = {
  title: string;
  date: string;
  important: boolean;
  visible: boolean;
  showInHub: boolean;
  category: SupportNoticeCategory;
  sortOrder: number;
  imageSrc: string;
  imageAlt: string;
  bodyHtml: string;
};

const EMPTY: FormState = {
  title: "",
  date: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
  important: false,
  visible: true,
  showInHub: true,
  category: "shipping",
  sortOrder: 0,
  imageSrc: "",
  imageAlt: "",
  bodyHtml: "<p>안내 내용을 입력하세요.</p>",
};

const CATEGORY_LABELS: Record<SupportNoticeCategory, string> = {
  shipping: "배송·운영 안내",
  event: "이벤트",
  order: "주문 안내",
  general: "일반",
};

export function AdminSupportNoticesClient() {
  const [items, setItems] = useState<SupportNoticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/support-notices", { credentials: "include" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.ok) {
      setError(data.message ?? "목록을 불러오지 못했습니다.");
      return;
    }
    setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY, sortOrder: items.length });
    setShowForm(true);
    setSaved(false);
    setError(null);
  };

  const openEdit = (item: SupportNoticeRecord) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      date: item.date,
      important: item.important ?? false,
      visible: item.visible,
      showInHub: item.showInHub,
      category: item.category,
      sortOrder: item.sortOrder,
      imageSrc: item.imageSrc ?? "",
      imageAlt: item.imageAlt ?? "",
      bodyHtml: item.bodyHtml,
    });
    setShowForm(true);
    setSaved(false);
    setError(null);
  };

  const save = async () => {
    if (!form.title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    if (!form.date.trim()) {
      setError("작성일을 입력해 주세요.");
      return;
    }
    if (!form.bodyHtml.trim()) {
      setError("본문을 입력해 주세요.");
      return;
    }

    const url = editingId ? `/api/admin/support-notices/${editingId}` : "/api/admin/support-notices";
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        date: form.date,
        important: form.important,
        visible: form.visible,
        showInHub: form.showInHub,
        category: form.category,
        sortOrder: form.sortOrder,
        imageSrc: form.imageSrc || undefined,
        imageAlt: form.imageAlt || undefined,
        bodyHtml: form.bodyHtml,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.message ?? "저장 실패");
      return;
    }
    setSaved(true);
    setShowForm(false);
    await load();
  };

  const toggleField = async (id: string, field: "visible" | "showInHub" | "important", value: boolean) => {
    await fetch(`/api/admin/support-notices/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-600">
          고객센터 «최근 안내»에 노출되는 공지입니다. `.data/support-notices.json`에 저장됩니다.
        </p>
        <button type="button" className={bm.btnNavy} onClick={openCreate}>
          공지 작성
        </button>
      </div>

      {error ? <p className="text-xs font-bold text-red-700">{error}</p> : null}
      {saved ? <p className="text-xs font-bold text-emerald-700">저장되었습니다.</p> : null}

      {showForm ? (
        <section className={`${bm.card} ${bm.cardPad} grid gap-3 sm:grid-cols-2`}>
          <label className="block text-xs sm:col-span-2">
            <span className="font-bold">제목 *</span>
            <input
              className="mt-1 w-full rounded border px-2.5 py-2"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </label>
          <label className="block text-xs">
            <span className="font-bold">작성일 (YYYY.MM.DD) *</span>
            <input
              className="mt-1 w-full rounded border px-2.5 py-2"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </label>
          <label className="block text-xs">
            <span className="font-bold">카테고리</span>
            <select
              className="mt-1 w-full rounded border px-2.5 py-2"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as SupportNoticeCategory }))
              }
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs">
            <span className="font-bold">정렬 순서</span>
            <input
              type="number"
              className="mt-1 w-full rounded border px-2.5 py-2"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            />
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.important}
              onChange={(e) => setForm((f) => ({ ...f, important: e.target.checked }))}
            />
            <span className="font-bold">중요 공지</span>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))}
            />
            <span className="font-bold">노출</span>
          </label>
          <label className="flex items-center gap-2 text-xs sm:col-span-2">
            <input
              type="checkbox"
              checked={form.showInHub}
              onChange={(e) => setForm((f) => ({ ...f, showInHub: e.target.checked }))}
            />
            <span className="font-bold">고객센터 최근 안내에 표시</span>
          </label>
          <label className="block text-xs sm:col-span-2">
            <span className="font-bold">이미지 URL (선택)</span>
            <input
              className="mt-1 w-full rounded border px-2.5 py-2"
              value={form.imageSrc}
              onChange={(e) => setForm((f) => ({ ...f, imageSrc: e.target.value }))}
            />
          </label>
          <label className="block text-xs sm:col-span-2">
            <span className="font-bold">본문 HTML *</span>
            <textarea
              className="mt-1 min-h-[8rem] w-full rounded border px-2.5 py-2 font-mono text-[11px]"
              value={form.bodyHtml}
              onChange={(e) => setForm((f) => ({ ...f, bodyHtml: e.target.value }))}
            />
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" className={bm.btnTertiary} onClick={() => setShowForm(false)}>
              취소
            </button>
            <button type="button" className={bm.btnNavy} onClick={() => void save()}>
              저장
            </button>
          </div>
        </section>
      ) : null}

      <div className={`${bm.card} overflow-x-auto`}>
        <table className="w-full min-w-[640px] text-xs">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="p-3">제목</th>
              <th className="p-3">날짜</th>
              <th className="p-3">카테고리</th>
              <th className="p-3">중요</th>
              <th className="p-3">노출</th>
              <th className="p-3">허브</th>
              <th className="p-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  불러오는 중…
                </td>
              </tr>
            ) : null}
            {items.map((n) => (
              <tr key={n.id} className="border-b last:border-0">
                <td className="p-3 font-semibold">{n.title}</td>
                <td className="p-3">{n.date}</td>
                <td className="p-3">{CATEGORY_LABELS[n.category]}</td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={n.important ?? false}
                    onChange={(e) => void toggleField(n.id, "important", e.target.checked)}
                  />
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={n.visible}
                    onChange={(e) => void toggleField(n.id, "visible", e.target.checked)}
                  />
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={n.showInHub}
                    onChange={(e) => void toggleField(n.id, "showInHub", e.target.checked)}
                  />
                </td>
                <td className="p-3">
                  <button type="button" className="font-bold text-blue-700" onClick={() => openEdit(n)}>
                    수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
