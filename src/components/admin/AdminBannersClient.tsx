"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { MainBannerRecord, MainBannerUpsertInput } from "@/types/main-banner";
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

  const duplicate = (banner: MainBannerRecord) => {
    setEditingId(null);
    setForm({
      ...banner,
      title: `${banner.title} (복제)`,
      status: "inactive",
    });
    setShowForm(true);
  };

  return (
    <div className="admin-banners space-y-3">
      <div className="admin-toolbar">
        <p className="admin-toolbar__hint">메인 배너는 carousel로 노출됩니다. 썸네일·순서·상태를 한눈에 확인하세요.</p>
        <div className="admin-toolbar__actions">
          <button
            type="button"
            className="admin-btn admin-btn--primary admin-btn--md"
            onClick={() => {
              setEditingId(null);
              setForm(EMPTY);
              setShowForm(true);
            }}
          >
            배너 추가
          </button>
        </div>
      </div>

      {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}

      {showForm ? (
        <section className="admin-panel admin-panel--form p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="admin-inquiries__field-label sm:col-span-2">
              <span>제목</span>
              <input
                className="admin-inquiries__select w-full"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>
            <label className="admin-inquiries__field-label">
              <span>보조 문구</span>
              <input
                className="admin-inquiries__select w-full"
                value={form.subtitle ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              />
            </label>
            <label className="admin-inquiries__field-label">
              <span>링크 URL</span>
              <input
                className="admin-inquiries__select w-full"
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
              />
            </label>
            <label className="admin-inquiries__field-label">
              <span>PC 이미지 URL</span>
              <input
                className="admin-inquiries__select w-full"
                value={form.imageUrl ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              />
            </label>
            <label className="admin-inquiries__field-label">
              <span>모바일 이미지 URL</span>
              <input
                className="admin-inquiries__select w-full"
                value={form.mobileImageUrl ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, mobileImageUrl: e.target.value }))}
              />
            </label>
            <label className="admin-inquiries__field-label">
              <span>노출 순서</span>
              <input
                type="number"
                className="admin-inquiries__select w-full"
                value={form.sortOrder ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              />
            </label>
            <label className="admin-inquiries__field-label">
              <span>상태</span>
              <select
                className="admin-inquiries__select w-full"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as MainBannerRecord["status"] }))}
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--md" onClick={() => setShowForm(false)}>
              취소
            </button>
            <button type="button" className="admin-btn admin-btn--primary admin-btn--md" onClick={() => void save()}>
              저장
            </button>
          </div>
        </section>
      ) : null}

      <div className="admin-panel admin-banners__table overflow-x-auto">
        <table className="admin-table w-full min-w-[52rem]">
          <thead>
            <tr>
              <th>미리보기</th>
              <th>제목</th>
              <th>순서</th>
              <th>상태</th>
              <th className="admin-cell-actions">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-table__empty">
                  불러오는 중…
                </td>
              </tr>
            ) : null}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-table__empty">
                  등록된 배너가 없습니다.
                </td>
              </tr>
            ) : null}
            {items.map((b) => {
              const thumb = b.mobileImageUrl || b.imageUrl;
              return (
                <tr key={b.id}>
                  <td>
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={b.imageAlt || b.title}
                        width={180}
                        height={68}
                        className="admin-banners__thumb"
                        unoptimized
                      />
                    ) : (
                      <div className="admin-banners__thumb admin-banners__thumb--empty">이미지 없음</div>
                    )}
                  </td>
                  <td>
                    <p className="admin-banners__title">{b.title}</p>
                    {b.subtitle ? <p className="admin-banners__subtitle">{b.subtitle}</p> : null}
                  </td>
                  <td>
                    <span className="admin-cell-primary tabular-nums">{b.sortOrder}</span>
                  </td>
                  <td>
                    <Badge variant={b.status === "active" ? "success" : "muted"}>
                      {b.status === "active" ? "활성" : "비활성"}
                    </Badge>
                  </td>
                  <td className="admin-cell-actions">
                    <div className="admin-action-buttons">
                      {thumb ? (
                        <a
                          href={thumb}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-btn admin-btn--secondary admin-btn--md"
                        >
                          미리보기
                        </a>
                      ) : null}
                      <button
                        type="button"
                        className="admin-btn admin-btn--primary admin-btn--md"
                        onClick={() => {
                          setEditingId(b.id);
                          setForm(b);
                          setShowForm(true);
                        }}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--secondary admin-btn--md"
                        onClick={() => duplicate(b)}
                      >
                        복제
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--md"
                        onClick={() => void toggle(b.id)}
                      >
                        토글
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasMore ? (
        <button type="button" className="admin-btn admin-btn--secondary admin-btn--md" onClick={() => void load(page + 1, true)}>
          더 불러오기
        </button>
      ) : null}
    </div>
  );
}
