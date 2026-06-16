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

type AdminFaqSort = "sortOrder" | "category" | "updatedAt" | "question";

const CATEGORY_OPTIONS = SUPPORT_FAQ_CATEGORIES.filter(
  (c): c is Exclude<FaqCategory, "전체"> => c !== "전체",
);

const SORT_OPTIONS: { value: AdminFaqSort; label: string }[] = [
  { value: "sortOrder", label: "현재 순서순" },
  { value: "category", label: "카테고리순" },
  { value: "updatedAt", label: "최근 수정순" },
  { value: "question", label: "질문 가나다순" },
];

const EMPTY: FormState = {
  category: "규격",
  question: "",
  answerText: "<p>답변 내용을 입력하세요.</p>",
  searchKeywords: "",
  visible: true,
  sortOrder: 0,
};

function stripHtmlForSearch(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function sortFaqItems(records: SupportFaqRecord[], sortBy: AdminFaqSort): SupportFaqRecord[] {
  const sorted = [...records];
  switch (sortBy) {
    case "category":
      return sorted.sort(
        (a, b) =>
          a.category.localeCompare(b.category, "ko") ||
          a.sortOrder - b.sortOrder ||
          b.updatedAt.localeCompare(a.updatedAt),
      );
    case "updatedAt":
      return sorted.sort(
        (a, b) =>
          b.updatedAt.localeCompare(a.updatedAt) ||
          a.sortOrder - b.sortOrder,
      );
    case "question":
      return sorted.sort(
        (a, b) =>
          a.question.localeCompare(b.question, "ko") ||
          a.sortOrder - b.sortOrder,
      );
    case "sortOrder":
    default:
      return sorted.sort(
        (a, b) =>
          a.sortOrder - b.sortOrder || b.updatedAt.localeCompare(a.updatedAt),
      );
  }
}

export function AdminSupportFaqClient() {
  const [items, setItems] = useState<SupportFaqRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<FaqCategory>("전체");
  const [sortBy, setSortBy] = useState<AdminFaqSort>("sortOrder");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; question: string } | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

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

  const categoryTabs = useMemo(() => {
    const fromItems = new Set(items.map((item) => item.category));
    const known = SUPPORT_FAQ_CATEGORIES.filter((cat) => cat === "전체" || fromItems.has(cat));
    const extras = [...fromItems]
      .filter((cat) => !SUPPORT_FAQ_CATEGORIES.includes(cat))
      .sort((a, b) => a.localeCompare(b, "ko"));
    return [...known, ...extras];
  }, [items]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<FaqCategory, number>();
    counts.set("전체", items.length);
    for (const item of items) {
      const cat = item.category as FaqCategory;
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = normalizeSearchText(query);
    const filtered = items.filter((item) => {
      if (categoryFilter !== "전체" && item.category !== categoryFilter) return false;
      if (!q) return true;
      const answerPlain = normalizeSearchText(stripHtmlForSearch(item.answerText));
      return (
        normalizeSearchText(item.question).includes(q) ||
        answerPlain.includes(q) ||
        item.searchKeywords.some((kw) => normalizeSearchText(kw).includes(q))
      );
    });
    return sortFaqItems(filtered, sortBy);
  }, [items, query, categoryFilter, sortBy]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY, sortOrder: items.length });
    setShowForm(true);
    setShowPreview(false);
    setSaved(false);
    setDeleted(false);
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
    setDeleted(false);
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

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError(null);
    setDeleted(false);
    try {
      const res = await fetch(`/api/admin/support-faq/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? "FAQ를 삭제하지 못했습니다.");
        return;
      }
      setDeleted(true);
      setDeleteTarget(null);
      await load();
    } catch {
      setError("FAQ를 삭제하지 못했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-600">
          고객센터 FAQ — 질문·답변·검색 키워드를 관리합니다. HTML은 저장·출력 시 sanitize됩니다.
        </p>
        <button type="button" className={bm.btnNavy} onClick={openCreate}>
          FAQ 작성
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            className="min-w-[12rem] flex-1 rounded border px-2.5 py-2 text-xs"
            placeholder="질문·답변 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <span className="whitespace-nowrap font-bold">정렬</span>
            <select
              className="rounded border px-2.5 py-2 text-xs"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as AdminFaqSort)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <div className="flex min-w-max flex-wrap gap-1.5">
            {categoryTabs.map((cat) => {
              const count = categoryCounts.get(cat) ?? 0;
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={
                    active
                      ? "rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-black text-white"
                      : "rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-200"
                  }
                >
                  {cat}
                  {cat === "전체" ? ` ${count}` : count > 0 ? ` ${count}` : ""}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-[11px] font-semibold text-slate-500">
          전체 {items.length}개 / 현재 표시 {filteredItems.length}개
        </p>
      </div>

      {error ? <p className="text-xs font-bold text-red-700">{error}</p> : null}
      {saved ? <p className="text-xs font-bold text-emerald-700">저장되었습니다.</p> : null}
      {deleted ? <p className="text-xs font-bold text-emerald-700">FAQ가 삭제되었습니다.</p> : null}

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
        <table className="w-full table-fixed text-xs">
          <colgroup>
            <col className="w-[min(100%,36rem)]" />
            <col className="w-24" />
            <col className="w-14" />
            <col className="w-14" />
            <col className="w-24" />
            <col className="w-36" />
          </colgroup>
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
                  {items.length === 0 ? "등록된 FAQ가 없습니다." : "조건에 맞는 FAQ가 없습니다."}
                </td>
              </tr>
            ) : null}
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b last:border-0 align-top">
                <td className="p-3 font-semibold">
                  <span className="line-clamp-2 break-words" title={item.question}>
                    {item.question}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap">{item.category}</td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    aria-label={`${item.question} 게시`}
                    onChange={(e) => void toggleVisible(item.id, e.target.checked)}
                  />
                </td>
                <td className="p-3">{item.sortOrder}</td>
                <td className="p-3 whitespace-nowrap">{item.updatedAt.slice(0, 10)}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <button
                      type="button"
                      className="font-bold text-blue-700"
                      onClick={() => openEdit(item)}
                    >
                      편집
                    </button>
                    <button
                      type="button"
                      className="font-bold text-red-700 underline-offset-2 hover:underline"
                      onClick={() => {
                        setDeleteTarget({ id: item.id, question: item.question });
                        setDeleted(false);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="faq-delete-title"
        >
          <div className={`${bm.card} ${bm.cardPad} w-full max-w-md space-y-4`}>
            <h2 id="faq-delete-title" className="text-sm font-black text-slate-900">
              FAQ 삭제
            </h2>
            <p className="text-xs text-slate-700">
              <span className="font-bold">삭제할 FAQ:</span> {deleteTarget.question}
            </p>
            <p className="text-xs font-semibold text-red-700">
              삭제한 FAQ는 복구할 수 없습니다.
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className={bm.btnTertiary}
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                취소
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
                disabled={deleting}
                onClick={() => void confirmDelete()}
              >
                {deleting ? "삭제 중…" : "삭제 확인"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
