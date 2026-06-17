"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import {
  GUIDE_POST_CATEGORY_META,
  type GuidePostCategory,
} from "@/data/battery-guide-posts";
import { AdminRichTextEditor } from "@/components/admin/AdminRichTextEditor";
import { RichTextContent } from "@/components/content/RichTextContent";
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
const THUMB_MAX_BYTES = 5 * 1024 * 1024;
const THUMB_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EMPTY: FormState = {
  slug: "",
  category: "battery_spec",
  title: "",
  summary: "",
  bodyHtml: "<p></p>",
  tags: "",
  thumbnail: "",
  visible: true,
  featured: false,
  sortOrder: 0,
  seoTitle: "",
  seoDescription: "",
};

function validateThumbFile(file: File): string | null {
  if (!THUMB_TYPES.includes(file.type)) {
    return "JPG, PNG, WEBP 형식만 업로드할 수 있습니다.";
  }
  if (file.size > THUMB_MAX_BYTES) {
    return "이미지는 5MB 이하만 업로드할 수 있습니다.";
  }
  return null;
}

export function AdminGuidePostsClient() {
  const [items, setItems] = useState<GuidePostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [originalSlug, setOriginalSlug] = useState("");
  const [storedBodyHtml, setStoredBodyHtml] = useState("");
  const [bodyDirty, setBodyDirty] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const originalFormRef = useRef<FormState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<GuidePostCategory | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const hasUnsavedChanges = showForm && (formDirty || bodyDirty);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

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

  const patchForm = (patch: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...patch }));
    setFormDirty(true);
    setSaved(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setOriginalSlug("");
    const next = { ...EMPTY, sortOrder: items.length, bodyHtml: "<p></p>" };
    setForm(next);
    originalFormRef.current = null;
    setStoredBodyHtml("");
    setBodyDirty(false);
    setFormDirty(false);
    setShowForm(true);
    setShowPreview(false);
    setSaved(false);
    setError(null);
  };

  const openEdit = (item: GuidePostRecord) => {
    setEditingId(item.id);
    setOriginalSlug(item.slug);
    const next: FormState = {
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
    };
    setForm(next);
    originalFormRef.current = next;
    setStoredBodyHtml(item.bodyHtml);
    setBodyDirty(false);
    setFormDirty(false);
    setShowForm(true);
    setShowPreview(false);
    setSaved(false);
    setError(null);
  };

  const closeForm = () => {
    if (hasUnsavedChanges && !confirm("저장하지 않은 변경사항이 있습니다. 닫으시겠습니까?")) {
      return;
    }
    setShowForm(false);
    setFormDirty(false);
    setBodyDirty(false);
  };

  const uploadThumbnail = async (file: File) => {
    const validationError = validateThumbFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
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
    patchForm({ thumbnail: data.url });
  };

  const onThumbDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadThumbnail(file);
  };

  const save = async () => {
    if (!form.title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    const bodyHtml = bodyDirty ? form.bodyHtml : storedBodyHtml || form.bodyHtml;
    if (!bodyHtml.trim() || bodyHtml === "<p></p>") {
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

    setSaving(true);
    setError(null);

    const payload = {
      slug: form.slug || undefined,
      category: form.category,
      title: form.title,
      summary: form.summary.slice(0, SUMMARY_MAX),
      bodyHtml,
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
    setSaving(false);
    if (!res.ok || !data.ok) {
      setError(data.message ?? "저장 실패");
      return;
    }
    setSaved(true);
    setShowForm(false);
    setFormDirty(false);
    setBodyDirty(false);
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

  const categoryLabel = GUIDE_POST_CATEGORY_META[form.category].label;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-600">
          배터리 가이드 — 일반 문서처럼 작성·수정합니다. HTML 태그를 직접 입력할 필요가 없습니다.
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
        <section className={`admin-guide-form ${bm.card} ${bm.cardPad} space-y-6`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900">
              {editingId ? "가이드 수정" : "가이드 작성"}
            </h2>
            {hasUnsavedChanges ? (
              <span className="text-[10px] font-bold text-amber-700">저장되지 않은 변경</span>
            ) : null}
          </div>

          <div className="admin-guide-form__section">
            <h3 className="admin-guide-form__section-title">1. 기본 정보</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block text-xs md:col-span-2">
                <span className="font-bold">제목 *</span>
                <input
                  className="mt-1 w-full rounded border px-2.5 py-2"
                  value={form.title}
                  onChange={(e) => patchForm({ title: e.target.value })}
                />
              </label>
              <label className="block text-xs">
                <span className="font-bold">카테고리</span>
                <select
                  className="mt-1 w-full rounded border px-2.5 py-2"
                  value={form.category}
                  onChange={(e) =>
                    patchForm({ category: e.target.value as GuidePostCategory })
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
                  onChange={(e) => patchForm({ slug: e.target.value })}
                />
                <span className="admin-guide-thumb-hint mt-1 block">
                  페이지 주소에 사용됩니다. 영문·숫자·하이픈 권장
                </span>
              </label>
              <label className="block text-xs md:col-span-2">
                <span className="font-bold">요약 (카드용)</span>
                <textarea
                  className="mt-1 min-h-[4rem] w-full rounded border px-2.5 py-2"
                  maxLength={SUMMARY_MAX}
                  value={form.summary}
                  onChange={(e) => patchForm({ summary: e.target.value })}
                />
                <span className="mt-1 block text-[10px] text-slate-500">
                  {form.summary.length}/{SUMMARY_MAX}자
                </span>
              </label>
            </div>
          </div>

          <div className="admin-guide-form__section">
            <h3 className="admin-guide-form__section-title">2. 노출 설정</h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => patchForm({ visible: e.target.checked })}
                />
                <span className="font-bold">게시</span>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => patchForm({ featured: e.target.checked })}
                />
                <span className="font-bold">추천</span>
              </label>
              <label className="block text-xs sm:col-span-2">
                <span className="font-bold">정렬 순서</span>
                <input
                  type="number"
                  className="mt-1 w-full rounded border px-2.5 py-2"
                  value={form.sortOrder}
                  onChange={(e) => patchForm({ sortOrder: Number(e.target.value) })}
                />
              </label>
              <label className="block text-xs md:col-span-2">
                <span className="font-bold">태그</span>
                <input
                  className="mt-1 w-full rounded border px-2.5 py-2"
                  value={form.tags}
                  onChange={(e) => patchForm({ tags: e.target.value })}
                  placeholder="예: DIN, 교체, 겨울"
                />
                <span className="admin-guide-thumb-hint mt-1 block">쉼표로 구분해 입력</span>
              </label>
            </div>
          </div>

          <div className="admin-guide-form__section">
            <h3 className="admin-guide-form__section-title">3. 대표 이미지</h3>
            <p className="admin-guide-thumb-hint">
              권장 1200×675px · 16:9 · JPG/PNG/WEBP · 최대 5MB
              <br />
              카드 목록 4:3 · 상세 히어로 16:10으로 표시됩니다. 최소 800×450px 권장.
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              <div
                className={`admin-guide-thumb-preview${dragOver ? " ring-2 ring-blue-400" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onThumbDrop}
              >
                {form.thumbnail ? (
                  <Image src={form.thumbnail} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center p-2 text-center text-[10px] font-semibold text-slate-400">
                    이미지 없음
                    <br />
                    파일을 끌어다 놓거나 선택
                  </div>
                )}
              </div>
              <div className="admin-guide-thumb-preview admin-guide-thumb-preview--hero">
                {form.thumbnail ? (
                  <Image src={form.thumbnail} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] font-semibold text-slate-400">
                    상세 히어로 미리보기
                  </div>
                )}
              </div>
              <div className="flex min-w-[12rem] flex-1 flex-col gap-2 text-xs">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadThumbnail(file);
                    e.target.value = "";
                  }}
                />
                <input
                  className="w-full rounded border px-2.5 py-2"
                  placeholder="또는 이미지 URL"
                  value={form.thumbnail}
                  onChange={(e) => patchForm({ thumbnail: e.target.value })}
                />
                {form.thumbnail ? (
                  <button
                    type="button"
                    className="self-start font-bold text-red-700"
                    onClick={() => patchForm({ thumbnail: "" })}
                  >
                    이미지 제거
                  </button>
                ) : null}
                {uploading ? <span className="font-semibold text-blue-700">업로드 중…</span> : null}
              </div>
            </div>
          </div>

          <div className="admin-guide-form__section">
            <h3 className="admin-guide-form__section-title">4. 본문 *</h3>
            <AdminRichTextEditor
              variant="guide"
              value={form.bodyHtml}
              storedValue={storedBodyHtml}
              minHeight="14rem"
              placeholder="가이드 본문을 입력하세요"
              disabled={saving}
              imageUploadUrl="/api/admin/guide-posts/upload"
              onChange={(html, { dirty }) => {
                setForm((f) => ({ ...f, bodyHtml: html }));
                setBodyDirty(dirty);
                if (dirty) {
                  setFormDirty(true);
                  setSaved(false);
                }
              }}
            />
          </div>

          <div className="admin-guide-form__section">
            <h3 className="admin-guide-form__section-title">5. SEO (고급)</h3>
            <div className="grid gap-3">
              <label className="block text-xs">
                <span className="font-bold">SEO 제목</span>
                <input
                  className="mt-1 w-full rounded border px-2.5 py-2"
                  value={form.seoTitle}
                  onChange={(e) => patchForm({ seoTitle: e.target.value })}
                />
              </label>
              <label className="block text-xs">
                <span className="font-bold">SEO 설명</span>
                <input
                  className="mt-1 w-full rounded border px-2.5 py-2"
                  value={form.seoDescription}
                  onChange={(e) => patchForm({ seoDescription: e.target.value })}
                />
              </label>
            </div>
          </div>

          {showPreview ? (
            <div className="admin-guide-form__section">
              <h3 className="admin-guide-form__section-title">미리보기</h3>
              <article className="admin-guide-preview-panel">
                {form.thumbnail ? (
                  <div className="admin-guide-preview-panel__hero">
                    <Image src={form.thumbnail} alt="" fill className="object-cover" unoptimized />
                  </div>
                ) : null}
                <p className="text-[10px] font-bold text-slate-400">{categoryLabel}</p>
                <h4 className="text-lg font-black text-slate-950">{form.title || "제목"}</h4>
                <p className="text-sm font-medium text-slate-600">{form.summary || "요약"}</p>
                <div className="battery-guide-detail__body prose prose-slate mt-4 max-w-none text-sm">
                  <RichTextContent content={form.bodyHtml} mode="guide" />
                </div>
              </article>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" className={bm.btnTertiary} onClick={closeForm}>
              취소
            </button>
            <button
              type="button"
              className={bm.btnSecondary}
              onClick={() => setShowPreview((v) => !v)}
            >
              {showPreview ? "미리보기 닫기" : "미리보기"}
            </button>
            <button
              type="button"
              className={bm.btnNavy}
              disabled={saving || Boolean(editingId && !formDirty && !bodyDirty)}
              onClick={() => void save()}
            >
              {saving ? "저장 중…" : "저장"}
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
                <td className="space-x-2 p-3 whitespace-nowrap">
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
