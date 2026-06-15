"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GUIDE_POST_CATEGORY_META,
  type GuidePostCategory,
} from "@/data/battery-guide-posts";
import type { GuidePostRecord } from "@/lib/guide-posts-store";
import { bm } from "@/lib/design-tokens";

type FormState = {
  slug: string;
  category: GuidePostCategory;
  title: string;
  summary: string;
  bodyHtml: string;
  tags: string;
  thumbnail: string;
  visible: boolean;
  featured: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
};

const CATEGORY_OPTIONS = Object.keys(GUIDE_POST_CATEGORY_META) as GuidePostCategory[];
const SUMMARY_MAX = 280;

const EMPTY: FormState = {
  slug: "",
  category: "battery_spec",
  title: "",
  summary: "",
  bodyHtml: "<p>가이드 본문을 입력하세요.</p>",
  tags: "",
  thumbnail: "",
  visible: true,
  featured: false,
  sortOrder: 0,
  seoTitle: "",
  seoDescription: "",
};

export function AdminGuidePostsClient() {
  const [items, setItems] = useState<GuidePostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [originalSlug, setOriginalSlug] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<GuidePostCategory | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/guide-posts", { credentials: "include" });
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
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
      );
    });
  }, [items, query, categoryFilter]);

  const openCreate = () => {
    setEditingId(null);
    setOriginalSlug("");
    setForm({ ...EMPTY, sortOrder: items.length });
    setShowForm(true);
    setShowPreview(false);
    setSaved(false);
    setError(null);
  };

  const openEdit = (item: GuidePostRecord) => {
    setEditingId(item.id);
    setOriginalSlug(item.slug);
    setForm({
      slug: item.slug,
      category: item.category,
      title: item.title,
      summary: item.summary,
      bodyHtml: item.bodyHtml,
      tags: item.tags.join(", "),
      thumbnail: item.thumbnail ?? "",
      visible: item.visible,
      featured: item.featured,
      sortOrder: item.sortOrder,
      seoTitle: item.seoTitle ?? "",
      seoDescription: item.seoDescription ?? "",
    });
    setShowForm(true);
    setShowPreview(false);
    setSaved(false);
    setError(null);
  };

  const uploadThumbnail = async (file: File) => {
    setUploading(true);
    setError(null);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin/guide-posts/upload", {
      method: "POST",
      credentials: "include",
      body,
    });
    const data = await res.json();
    setUploading(false);
    if (!res.ok || !data.ok) {
      setError(data.message ?? "이미지 업로드 실패");
      return;
    }
    setForm((f) => ({ ...f, thumbnail: data.url }));
  };

  const save = async () => {
    if (!form.title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    if (!form.bodyHtml.trim()) {
      setError("본문을 입력해 주세요.");
      return;
    }

    if (
      editingId &&
      originalSlug &&
      form.slug.trim() &&
      form.slug.trim() !== originalSlug &&
      !confirm(
        "slug를 변경하면 기존 링크(/guide/battery/...)가 동작하지 않을 수 있습니다. 계속하시겠습니까?",
      )
    ) {
      return;
    }

    const payload = {
      slug: form.slug || undefined,
      category: form.category,
      title: form.title,
      summary: form.summary.slice(0, SUMMARY_MAX),
      bodyHtml: form.bodyHtml,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      thumbnail: form.thumbnail || undefined,
      visible: form.visible,
      featured: form.featured,
      sortOrder: form.sortOrder,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
    };

    const url = editingId ? `/api/admin/guide-posts/${editingId}` : "/api/admin/guide-posts";
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

  const toggleField = async (id: string, field: "visible" | "featured", value: boolean) => {
    await fetch(`/api/admin/guide-posts/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    await load();
  };

  const remove = async (id: string, title: string) => {
    if (
      !confirm(
        `「${title}」 가이드를 숨김(보관) 처리합니다.\n고객 화면에서 더 이상 노출되지 않습니다. 계속하시겠습니까?`,
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/guide-posts/${id}`, {
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
          배터리 가이드 — 제목·대표 이미지·짧은 설명·본문을 관리합니다. HTML은 저장·출력 시
          sanitize됩니다.
        </p>
        <button type="button" className={bm.btnNavy} onClick={openCreate}>
          가이드 작성
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-[12rem] flex-1 rounded border px-2.5 py-2 text-xs"
          placeholder="제목·요약·slug 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="rounded border px-2.5 py-2 text-xs"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as GuidePostCategory | "all")}
        >
          <option value="all">전체 카테고리</option>
          {CATEGORY_OPTIONS.map((key) => (
            <option key={key} value={key}>
              {GUIDE_POST_CATEGORY_META[key].label}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="text-xs font-bold text-red-700">{error}</p> : null}
      {saved ? <p className="text-xs font-bold text-emerald-700">저장되었습니다.</p> : null}

      {showForm ? (
        <section className={`${bm.card} ${bm.cardPad} grid gap-3 lg:grid-cols-2`}>
          <label className="block text-xs lg:col-span-2">
            <span className="font-bold">제목 *</span>
            <input
              className="mt-1 w-full rounded border px-2.5 py-2"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </label>
          <label className="block text-xs">
            <span className="font-bold">카테고리</span>
            <select
              className="mt-1 w-full rounded border px-2.5 py-2"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as GuidePostCategory }))
              }
            >
              {CATEGORY_OPTIONS.map((key) => (
                <option key={key} value={key}>
                  {GUIDE_POST_CATEGORY_META[key].label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs">
            <span className="font-bold">Slug (선택)</span>
            <input
              className="mt-1 w-full rounded border px-2.5 py-2"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
          </label>
          <label className="block text-xs lg:col-span-2">
            <span className="font-bold">짧은 설명 (카드용)</span>
            <textarea
              className="mt-1 min-h-[4rem] w-full rounded border px-2.5 py-2"
              maxLength={SUMMARY_MAX}
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            />
            <span className="mt-1 block text-[10px] text-slate-500">
              {form.summary.length}/{SUMMARY_MAX}자
            </span>
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
          <label className="block text-xs">
            <span className="font-bold">태그 (쉼표 구분)</span>
            <input
              className="mt-1 w-full rounded border px-2.5 py-2"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
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
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            />
            <span className="font-bold">추천</span>
          </label>
          <div className="block text-xs lg:col-span-2">
            <span className="font-bold">대표 이미지</span>
            <div className="mt-2 flex flex-wrap items-start gap-3">
              {form.thumbnail ? (
                <div className="relative h-24 w-36 overflow-hidden rounded-lg border bg-slate-50">
                  <Image
                    src={form.thumbnail}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-24 w-36 items-center justify-center rounded-lg border border-dashed bg-slate-50 text-[10px] font-semibold text-slate-400">
                  이미지 없음
                </div>
              )}
              <div className="flex min-w-[12rem] flex-1 flex-col gap-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadThumbnail(file);
                  }}
                />
                <input
                  className="w-full rounded border px-2.5 py-2"
                  placeholder="또는 이미지 URL"
                  value={form.thumbnail}
                  onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <label className="block text-xs lg:col-span-2">
            <span className="font-bold">본문 HTML *</span>
            <textarea
              className="mt-1 min-h-[12rem] w-full rounded border px-2.5 py-2 font-mono text-[11px]"
              value={form.bodyHtml}
              onChange={(e) => setForm((f) => ({ ...f, bodyHtml: e.target.value }))}
            />
          </label>
          {showPreview ? (
            <div
              className="prose prose-sm max-w-none rounded border bg-slate-50 p-3 lg:col-span-2"
              dangerouslySetInnerHTML={{ __html: form.bodyHtml }}
            />
          ) : null}
          <label className="block text-xs lg:col-span-2">
            <span className="font-bold">SEO 제목 (선택)</span>
            <input
              className="mt-1 w-full rounded border px-2.5 py-2"
              value={form.seoTitle}
              onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
            />
          </label>
          <label className="block text-xs lg:col-span-2">
            <span className="font-bold">SEO 설명 (선택)</span>
            <input
              className="mt-1 w-full rounded border px-2.5 py-2"
              value={form.seoDescription}
              onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
            />
          </label>
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
        <table className="w-full min-w-[880px] text-xs">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="p-3">이미지</th>
              <th className="p-3">제목</th>
              <th className="p-3">카테고리</th>
              <th className="p-3">게시</th>
              <th className="p-3">추천</th>
              <th className="p-3">순서</th>
              <th className="p-3">수정일</th>
              <th className="p-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  불러오는 중…
                </td>
              </tr>
            ) : null}
            {!loading && filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  등록된 가이드가 없습니다.
                </td>
              </tr>
            ) : null}
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="p-3">
                  {item.thumbnail ? (
                    <div className="relative h-10 w-14 overflow-hidden rounded bg-slate-100">
                      <Image src={item.thumbnail} alt="" fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="p-3 font-semibold">{item.title}</td>
                <td className="p-3">{GUIDE_POST_CATEGORY_META[item.category].label}</td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(e) => void toggleField(item.id, "visible", e.target.checked)}
                  />
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={item.featured}
                    onChange={(e) => void toggleField(item.id, "featured", e.target.checked)}
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
                    onClick={() => void remove(item.id, item.title)}
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
