"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SUPPORT_FAQ_CATEGORIES,
  type FaqCategory,
} from "@/lib/support-faq-data";
import type { SupportFaqRecord } from "@/lib/support-faq-store";
import { bm } from "@/lib/design-tokens";

type FormState = {
  category: Exclude<FaqCategory, "전체">;
  question: string;
  answerText: string;
  searchKeywords: string;
  visible: boolean;
  sortOrder: number;
};

const CATEGORY_OPTIONS = SUPPORT_FAQ_CATEGORIES.filter(
  (c): c is Exclude<FaqCategory, "전체"> => c !== "전체",
);

const EMPTY: FormState = {
  category: "규격",
  question: "",
  answerText: "<p>답변 내용을 입력하세요.</p>",
  searchKeywords: "",
  visible: true,
  sortOrder: 0,
};

export function AdminSupportFaqClient() {
  const [items, setItems] = useState<SupportFaqRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Exclude<FaqCategory, "전체"> | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/support-faq", { credentials: "include" });
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

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answerText.toLowerCase().includes(q) ||
        item.searchKeywords.some((kw) => kw.toLowerCase().includes(q))
      );
    });
  }, [items, query, categoryFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY, sortOrder: items.length });
    setShowForm(true);
    setShowPreview(false);
    setSaved(false);
    setError(null);
  };

  const openEdit = (item: SupportFaqRecord) => {
    setEditingId(item.id);
    setForm({
      category: item.category,
      question: item.question,
      answerText: item.answerText,
      searchKeywords: item.searchKeywords.join(", "),
      visible: item.visible,
      sortOrder: item.sortOrder,
    });
    setShowForm(true);
    setShowPreview(false);
    setSaved(false);
    setError(null);
  };

  const save = async () => {
    if (!form.question.trim()) {
      setError("질문을 입력해 주세요.");
      return;
    }
    if (!form.answerText.trim()) {
      setError("답변을 입력해 주세요.");
      return;
    }

    const payload = {
      category: form.category,
      question: form.question,
      answerText: form.answerText,
      searchKeywords: form.searchKeywords
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      visible: form.visible,
      sortOrder: form.sortOrder,
    };

    const url = editingId ? `/api/admin/support-faq/${editingId}` : "/api/admin/support-faq";
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

  const toggleVisible = async (id: string, value: boolean) => {
    await fetch(`/api/admin/support-faq/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: value }),
    });
    await load();
  };

  const remove = async (id: string, question: string) => {
    if (
      !confirm(
        `「${question}」 FAQ를 숨김(보관) 처리합니다.\n고객 화면에서 더 이상 노출되지 않습니다. 계속하시겠습니까?`,
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/support-faq/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.message ?? "삭제 실패");
      return;
    }
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-600">
          고객센터 FAQ — 질문·답변·검색 키워드를 관리합니다. HTML은 저장·출력 시 sanitize됩니다.
        </p>
        <button type="button" className={bm.btnNavy} onClick={openCreate}>
          FAQ 작성
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-[12rem] flex-1 rounded border px-2.5 py-2 text-xs"
          placeholder="질문·답변·키워드 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="rounded border px-2.5 py-2 text-xs"
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as Exclude<FaqCategory, "전체"> | "all")
          }
        >
          <option value="all">전체 카테고리</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="text-xs font-bold text-red-700">{error}</p> : null}
      {saved ? <p className="text-xs font-bold text-emerald-700">저장되었습니다.</p> : null}

      {showForm ? (
        <section className={`${bm.card} ${bm.cardPad} grid gap-3 lg:grid-cols-2`}>
          <label className="block text-xs lg:col-span-2">
            <span className="font-bold">질문 *</span>
            <input
              className="mt-1 w-full rounded border px-2.5 py-2"
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
            />
          </label>
          <label className="block text-xs">
            <span className="font-bold">카테고리</span>
            <select
              className="mt-1 w-full rounded border px-2.5 py-2"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value as Exclude<FaqCategory, "전체">,
                }))
              }
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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
          <label className="block text-xs lg:col-span-2">
            <span className="font-bold">검색 키워드 (쉼표 구분)</span>
            <input
              className="mt-1 w-full rounded border px-2.5 py-2"
              value={form.searchKeywords}
              onChange={(e) => setForm((f) => ({ ...f, searchKeywords: e.target.value }))}
              placeholder="예) 배송, 택배, 반납"
            />
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))}
            />
            <span className="font-bold">게시</span>
          </label>
          <label className="block text-xs lg:col-span-2">
            <span className="font-bold">답변 HTML *</span>
            <textarea
              className="mt-1 min-h-[12rem] w-full rounded border px-2.5 py-2 font-mono text-[11px]"
              value={form.answerText}
              onChange={(e) => setForm((f) => ({ ...f, answerText: e.target.value }))}
            />
          </label>
          {showPreview ? (
            <div
              className="prose prose-sm max-w-none rounded border bg-slate-50 p-3 lg:col-span-2"
              dangerouslySetInnerHTML={{ __html: form.answerText }}
            />
          ) : null}
          <div className="flex flex-wrap justify-end gap-2 lg:col-span-2">
            <button type="button" className={bm.btnTertiary} onClick={() => setShowForm(false)}>
              취소
            </button>
            <button
              type="button"
              className={bm.btnSecondary}
              onClick={() => setShowPreview((v) => !v)}
            >
              {showPreview ? "미리보기 닫기" : "미리보기"}
            </button>
            <button type="button" className={bm.btnNavy} onClick={() => void save()}>
              저장
            </button>
          </div>
        </section>
      ) : null}

      <div className={`${bm.card} overflow-x-auto`}>
        <table className="w-full min-w-[720px] text-xs">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="p-3">질문</th>
              <th className="p-3">카테고리</th>
              <th className="p-3">게시</th>
              <th className="p-3">순서</th>
              <th className="p-3">수정일</th>
              <th className="p-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  불러오는 중…
                </td>
              </tr>
            ) : null}
            {!loading && filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  등록된 FAQ가 없습니다.
                </td>
              </tr>
            ) : null}
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="p-3 font-semibold">{item.question}</td>
                <td className="p-3">{item.category}</td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(e) => void toggleVisible(item.id, e.target.checked)}
                  />
                </td>
                <td className="p-3">{item.sortOrder}</td>
                <td className="p-3 whitespace-nowrap">{item.updatedAt.slice(0, 10)}</td>
                <td className="p-3 space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    className="font-bold text-blue-700"
                    onClick={() => openEdit(item)}
                  >
                    편집
                  </button>
                  <button
                    type="button"
                    className="font-bold text-red-700"
                    onClick={() => void remove(item.id, item.question)}
                  >
                    숨김
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
