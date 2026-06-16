"use client";

import clsx from "clsx";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  BANNER_DESKTOP_ASPECT,
  BANNER_IMAGE_SPECS,
  BANNER_MOBILE_ASPECT,
  bannerAspectWarning,
} from "@/lib/cms/banner-image-specs";
import { CONTENT_DISPLAY_LIMITS } from "@/lib/content-display-limits";
import type { MainBannerRecord, MainBannerUpsertInput } from "@/types/main-banner";

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

type UploadTarget = "desktop" | "mobile";

function BannerPreviewFrame({
  label,
  url,
  aspect,
  className,
}: {
  label: string;
  url: string;
  aspect: number;
  className?: string;
}) {
  return (
    <div className={clsx("admin-banners__preview-frame", className)}>
      <p className="admin-banners__preview-label">{label}</p>
      <div
        className="admin-banners__preview-viewport"
        style={{ aspectRatio: String(aspect) }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="admin-banners__preview-img" />
        ) : (
          <span className="admin-banners__preview-empty">이미지 없음</span>
        )}
      </div>
    </div>
  );
}

function BannerImageField({
  label,
  target,
  url,
  onUrlChange,
  hint,
}: {
  label: string;
  target: UploadTarget;
  url: string;
  onUrlChange: (url: string) => void;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [aspectWarning, setAspectWarning] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setUploadError(null);
    setAspectWarning(null);

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError("파일 용량이 5MB를 초과했습니다.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
      setUploadError("JPG, PNG, WEBP 파일만 업로드할 수 있습니다.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/banners/upload", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; message?: string };
      if (res.status === 401) {
        setUploadError("관리자 로그인이 필요합니다.");
        return;
      }
      if (!res.ok || !data.ok || !data.url) {
        setUploadError(data.message ?? "업로드에 실패했습니다.");
        return;
      }
      onUrlChange(data.url);
      const objectUrl = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        setAspectWarning(
          bannerAspectWarning(img.naturalWidth, img.naturalHeight, target) ?? null,
        );
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    } catch {
      setUploadError("업로드 요청에 실패했습니다. 네트워크 연결을 확인해 주세요.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="admin-banners__upload-field sm:col-span-2">
      <span className="admin-inquiries__field-label">{label}</span>
      <div className="admin-banners__upload-row">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          className="admin-btn admin-btn--secondary admin-btn--md"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "업로드 중…" : url ? "이미지 교체" : "이미지 업로드"}
        </button>
        {url ? (
          <BannerPreviewFrame
            label="미리보기"
            url={url}
            aspect={target === "desktop" ? BANNER_DESKTOP_ASPECT : BANNER_MOBILE_ASPECT}
            className="admin-banners__preview-frame--inline"
          />
        ) : null}
      </div>
      <p className="admin-banners__upload-hint">{hint}</p>
      <p className="admin-banners__upload-hint">
        지원: {BANNER_IMAGE_SPECS.allowedFormats} · 최대 {BANNER_IMAGE_SPECS.maxSizeLabel}
      </p>
      {aspectWarning ? <p className="admin-banners__aspect-warn">{aspectWarning}</p> : null}
      {uploadError ? <p className="admin-banners__upload-error">{uploadError}</p> : null}
      <button
        type="button"
        className="admin-banners__advanced-toggle"
        onClick={() => setAdvancedOpen((v) => !v)}
        aria-expanded={advancedOpen}
      >
        {advancedOpen ? "고급 URL 입력 접기" : "고급: URL 직접 입력"}
      </button>
      {advancedOpen ? (
        <input
          className="admin-inquiries__select mt-1 w-full"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://..."
        />
      ) : null}
    </div>
  );
}

export function AdminBannersClient() {
  const [items, setItems] = useState<MainBannerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<MainBannerUpsertInput>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MainBannerRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/admin/banners?page=1&limit=${CONTENT_DISPLAY_LIMITS.adminListPageSize * 10}`,
      { credentials: "include" },
    );
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.ok) {
      setError(data.message ?? "목록을 불러오지 못했습니다.");
      return;
    }
    setItems(data.items);
    setError(null);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!form.title?.trim()) {
      setError("배너 제목을 입력해 주세요.");
      return;
    }
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
    setEditingId(null);
    await load();
  };

  const setVisibility = async (banner: MainBannerRecord) => {
    if (busyId) return;
    setBusyId(banner.id);
    const next = banner.status === "active" ? "inactive" : "active";
    const res = await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusyId(null);
    if (res.ok) await load();
  };

  const reorder = async (id: string, direction: "up" | "down") => {
    if (busyId) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/banners/${id}/reorder`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    const data = await res.json();
    setBusyId(null);
    if (res.ok && data.ok && Array.isArray(data.items)) {
      setItems(data.items);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/banners/${deleteTarget.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    setDeleting(false);
    if (!res.ok || !data.ok) {
      setError(data.message ?? "삭제에 실패했습니다.");
      return;
    }
    setDeleteTarget(null);
    await load();
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

  const sortedItems = [...items].sort((a, b) => b.sortOrder - a.sortOrder || b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="admin-banners space-y-3">
      <div className="admin-toolbar">
        <p className="admin-toolbar__hint">
          메인 배너는 carousel로 노출됩니다. 이미지 업로드·순서·숨김/노출을 관리하세요.
        </p>
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
            <BannerImageField
              label="PC 이미지"
              target="desktop"
              url={form.imageUrl ?? ""}
              onUrlChange={(imageUrl) => setForm((f) => ({ ...f, imageUrl }))}
              hint={BANNER_IMAGE_SPECS.desktop.hint}
            />
            <BannerImageField
              label="모바일 이미지"
              target="mobile"
              url={form.mobileImageUrl ?? ""}
              onUrlChange={(mobileImageUrl) => setForm((f) => ({ ...f, mobileImageUrl }))}
              hint={BANNER_IMAGE_SPECS.mobile.hint}
            />
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as MainBannerRecord["status"] }))
                }
              >
                <option value="active">노출</option>
                <option value="inactive">숨김</option>
              </select>
            </label>
          </div>

          {(form.imageUrl || form.mobileImageUrl) && (
            <div className="admin-banners__form-previews mt-4 grid gap-3 sm:grid-cols-2">
              <BannerPreviewFrame
                label="PC 미리보기 (메인 비율)"
                url={form.imageUrl ?? ""}
                aspect={BANNER_DESKTOP_ASPECT}
              />
              <BannerPreviewFrame
                label="모바일 미리보기 (메인 비율)"
                url={form.mobileImageUrl ?? form.imageUrl ?? ""}
                aspect={BANNER_MOBILE_ASPECT}
              />
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--md"
              onClick={() => setShowForm(false)}
            >
              취소
            </button>
            <button type="button" className="admin-btn admin-btn--primary admin-btn--md" onClick={() => void save()}>
              저장
            </button>
          </div>
        </section>
      ) : null}

      <div className="admin-panel admin-banners__table overflow-x-auto">
        <table className="admin-table w-full min-w-[56rem]">
          <thead>
            <tr>
              <th>순서</th>
              <th>미리보기</th>
              <th>제목</th>
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
            {sortedItems.map((b, index) => {
              const pcThumb = b.imageUrl;
              const mobileThumb = b.mobileImageUrl || b.imageUrl;
              const isActive = b.status === "active";
              return (
                <tr key={b.id}>
                  <td>
                    <div className="admin-banners__order-cell">
                      <span className="admin-cell-primary tabular-nums">{index + 1}</span>
                      <div className="admin-banners__order-buttons">
                        <button
                          type="button"
                          className="admin-banners__icon-btn"
                          title="위로 이동"
                          aria-label="위로 이동"
                          disabled={index === 0 || busyId === b.id}
                          onClick={() => void reorder(b.id, "up")}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          className="admin-banners__icon-btn"
                          title="아래로 이동"
                          aria-label="아래로 이동"
                          disabled={index === sortedItems.length - 1 || busyId === b.id}
                          onClick={() => void reorder(b.id, "down")}
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="admin-banners__thumb-pair">
                      {pcThumb ? (
                        <Image
                          src={pcThumb}
                          alt={`${b.title} PC`}
                          width={120}
                          height={52}
                          className="admin-banners__thumb"
                          unoptimized
                        />
                      ) : (
                        <div className="admin-banners__thumb admin-banners__thumb--empty">PC 없음</div>
                      )}
                      {mobileThumb ? (
                        <Image
                          src={mobileThumb}
                          alt={`${b.title} 모바일`}
                          width={72}
                          height={45}
                          className="admin-banners__thumb admin-banners__thumb--mobile"
                          unoptimized
                        />
                      ) : (
                        <div className="admin-banners__thumb admin-banners__thumb--empty admin-banners__thumb--mobile">
                          M 없음
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <p className="admin-banners__title">{b.title}</p>
                    {b.subtitle ? <p className="admin-banners__subtitle">{b.subtitle}</p> : null}
                    <p className="admin-banners__link-preview">{b.linkUrl}</p>
                  </td>
                  <td>
                    <Badge variant={isActive ? "success" : "muted"}>
                      {isActive ? "노출 중" : "숨김"}
                    </Badge>
                  </td>
                  <td className="admin-cell-actions">
                    <div className="admin-action-buttons admin-action-buttons--wrap">
                      <button
                        type="button"
                        className={clsx(
                          "admin-btn admin-btn--md",
                          isActive ? "admin-btn--secondary" : "admin-btn--primary",
                        )}
                        disabled={busyId === b.id}
                        onClick={() => void setVisibility(b)}
                      >
                        {isActive ? (
                          <>
                            <EyeOff size={14} aria-hidden /> 숨김
                          </>
                        ) : (
                          <>
                            <Eye size={14} aria-hidden /> 노출
                          </>
                        )}
                      </button>
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
                        className="admin-btn admin-btn--danger admin-btn--md"
                        onClick={() => setDeleteTarget(b)}
                      >
                        <Trash2 size={14} aria-hidden /> 삭제
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {deleteTarget ? (
        <div className="admin-modal admin-banners__delete-dialog" role="dialog" aria-modal="true">
          <button
            type="button"
            className="admin-modal__backdrop"
            aria-label="닫기"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="admin-modal__panel admin-banners__delete-modal">
            <h2 className="admin-modal__title">배너 삭제</h2>
            <div className="admin-modal__body">
              <p>
                <strong>{deleteTarget.title}</strong> 배너를 삭제할까요?
              </p>
              <div className="admin-banners__delete-previews">
                {deleteTarget.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={deleteTarget.imageUrl} alt="PC" className="admin-banners__delete-thumb" />
                ) : null}
                {deleteTarget.mobileImageUrl || deleteTarget.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={deleteTarget.mobileImageUrl || deleteTarget.imageUrl || ""}
                    alt="모바일"
                    className="admin-banners__delete-thumb admin-banners__delete-thumb--mobile"
                  />
                ) : null}
              </div>
              <p className="text-sm text-slate-600">
                현재 상태: {deleteTarget.status === "active" ? "노출 중" : "숨김"}
              </p>
              {deleteTarget.status === "active" ? (
                <p className="text-sm font-bold text-amber-800">
                  노출 중인 배너입니다. 삭제 후 메인 carousel에서 사라집니다.
                </p>
              ) : null}
              <p className="text-xs text-slate-500">
                삭제 후 복구할 수 없습니다. Blob 파일은 자동 삭제되지 않습니다.
              </p>
            </div>
            <div className="admin-modal__footer">
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--md"
                onClick={() => setDeleteTarget(null)}
              >
                취소
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--danger admin-btn--md"
                disabled={deleting}
                onClick={() => void confirmDelete()}
              >
                {deleting ? "삭제 중…" : "삭제"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
