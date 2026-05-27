"use client";

import { useCallback, useMemo, useState } from "react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { bm } from "@/lib/design-tokens";
import {
  ADMIN_CONTENT_STATUS_LABELS,
  ADMIN_CONTENT_THUMBNAIL_LABELS,
  ADMIN_CONTENT_TYPE_LABELS,
  CONTENT_IMAGE_STATUS_LABELS,
  defaultAdminContentItem,
  type AdminContentItem,
  type AdminContentStatus,
  type AdminContentThumbnailType,
  type AdminContentType,
  type ContentImageStatus,
} from "@/data/admin/adminContent.schema";
import {
  filterAdminContentItems,
  getAdminCategories,
  getAdminContentStats,
  isConnectionMissing,
  thumbnailTypeForContentType,
} from "@/lib/admin/getAdminContentItems";
import { validateContentWorkbench } from "@/lib/admin/validateContentWorkbench";
import { ContentTypeThumbnail } from "@/components/content/ContentTypeThumbnail";
import { ContentCoverImage } from "@/components/content/ContentCoverImage";

const TYPE_FILTERS: { id: AdminContentType | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "guide", label: "가이드" },
  { id: "qa", label: "Q&A" },
  { id: "symptom", label: "증상" },
  { id: "photo_analysis", label: "사진분석" },
  { id: "caution", label: "오주문 방지" },
  { id: "spec_inquiry", label: "규격문의" },
  { id: "shopping_notice", label: "쇼핑안내" },
  { id: "brand_guide", label: "브랜드가이드" },
];

const STATUS_FILTERS: { id: AdminContentStatus | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "published", label: "게시중" },
  { id: "draft", label: "임시저장" },
  { id: "hidden", label: "숨김" },
  { id: "needs_review", label: "수정필요" },
];

function StatCard({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className={`${bm.card} p-3`}>
      <p className="text-[10px] font-black text-slate-400">{label}</p>
      <p className={`mt-1 text-xl font-black ${tone ?? "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminContentStatus }) {
  const tone =
    status === "published"
      ? bm.badgeGreen
      : status === "draft"
        ? bm.badgeGray
        : status === "hidden"
          ? "bg-slate-200 text-slate-600 ring-slate-300"
          : bm.badgeAmber;
  return <span className={`${bm.badge} ${tone}`}>{ADMIN_CONTENT_STATUS_LABELS[status]}</span>;
}

function TypeBadge({ type }: { type: AdminContentType }) {
  return (
    <span className={`${bm.badge} ${bm.badgeBlue}`}>{ADMIN_CONTENT_TYPE_LABELS[type]}</span>
  );
}

function ImageStatusBadge({ status }: { status?: ContentImageStatus }) {
  if (!status) return <span className="text-[10px] font-semibold text-slate-400">—</span>;
  const tone =
    status === "exact"
      ? bm.badgeGreen
      : status === "usable"
        ? bm.badgeBlue
        : status === "temporary"
          ? bm.badgeAmber
          : "bg-rose-50 text-rose-700 ring-rose-100";
  return <span className={`${bm.badge} ${tone}`}>{CONTENT_IMAGE_STATUS_LABELS[status]}</span>;
}

function joinList(values: string[], empty = "—") {
  return values.length ? values.join(", ") : empty;
}

function parseCsv(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

type Props = {
  initialItems: AdminContentItem[];
  dataSource?: string;
};

export function AdminContentClient({ initialItems, dataSource }: Props) {
  const [items, setItems] = useState<AdminContentItem[]>(initialItems);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<AdminContentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AdminContentStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(initialItems[0]?.id ?? null);
  const [draft, setDraft] = useState<AdminContentItem | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const categories = useMemo(() => getAdminCategories(items), [items]);

  const filtered = useMemo(
    () =>
      filterAdminContentItems(items, {
        query,
        type: typeFilter,
        status: statusFilter,
        category: categoryFilter,
      }),
    [items, query, typeFilter, statusFilter, categoryFilter],
  );

  const stats = useMemo(() => getAdminContentStats(items), [items]);
  const validation = useMemo(() => validateContentWorkbench(items), [items]);
  const needsDedicatedImage = useMemo(
    () => items.filter((i) => i.imageStatus === "temporary" || i.imageStatus === "missing_fallback"),
    [items],
  );

  const selected = draft ?? items.find((i) => i.id === selectedId) ?? null;

  const selectItem = useCallback(
    (item: AdminContentItem) => {
      setSelectedId(item.id);
      setDraft({ ...item });
    },
    [],
  );

  const updateDraft = useCallback((patch: Partial<AdminContentItem>) => {
    setDraft((prev) => {
      const base = prev ?? defaultAdminContentItem();
      const next = { ...base, ...patch };
      if (patch.type) {
        next.thumbnailType = thumbnailTypeForContentType(patch.type);
      }
      return next;
    });
  }, []);

  const applyDraftToList = useCallback(
    (statusOverride?: AdminContentStatus) => {
      if (!draft) return;
      const next: AdminContentItem = {
        ...draft,
        status: statusOverride ?? draft.status,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === next.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = next;
          return copy;
        }
        return [next, ...prev];
      });
      setDraft(next);
      setSelectedId(next.id);
    },
    [draft],
  );

  const createNew = useCallback(() => {
    const item = defaultAdminContentItem({
      id: `content-new-${Date.now()}`,
      type: "guide",
      thumbnailType: "guide",
      status: "draft",
    });
    setItems((prev) => [item, ...prev]);
    setSelectedId(item.id);
    setDraft({ ...item });
  }, []);

  const duplicateItem = useCallback(
    (item: AdminContentItem) => {
      const copy = defaultAdminContentItem({
        ...item,
        id: `${item.id}-copy-${Date.now()}`,
        title: `${item.title} (복사)`,
        status: "draft",
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
      });
      setItems((prev) => [copy, ...prev]);
      selectItem(copy);
    },
    [selectItem],
  );

  const hideItem = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "hidden" as const, updatedAt: new Date().toISOString().slice(0, 10) } : i,
        ),
      );
      if (draft?.id === id) {
        setDraft((d) => (d ? { ...d, status: "hidden" } : d));
      }
    },
    [draft?.id],
  );

  const previewItem = draft ?? selected;

  const exportWorkbench = useCallback(() => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contentWorkbench.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  return (
    <main className={bm.pageBg}>
      <div className={`${bm.pageContainerWide} pb-10`}>
        <header className={`${bm.card} mb-4 ${bm.cardPad}`}>
          <SectionHeader
            label="Battery Manager · 운영"
            title="관리자 콘텐츠 센터"
            description="사이트에 표시되는 가이드, Q&A, 증상 안내, 사진분석 안내 콘텐츠를 한곳에서 관리합니다."
            action={
              <div className="flex flex-wrap gap-2">
                <button type="button" className={bm.btnSecondary} onClick={exportWorkbench}>
                  워크벤치 내보내기
                </button>
              </div>
            }
          />
          {dataSource ? (
            <p className="mt-2 text-[11px] font-semibold text-slate-400">
              데이터 소스: {dataSource === "workbench" ? "contentWorkbench.json" : dataSource}
            </p>
          ) : null}
          {!validation.valid ? (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-100">
              워크벤치 검증 이슈 {validation.issues.filter((i) => i.severity === "error").length}건 — 수정 필요 항목을 확인하세요.
            </p>
          ) : null}
        </header>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="전체 콘텐츠" value={stats.total} />
          <StatCard label="게시중" value={stats.published} tone="text-emerald-700" />
          <StatCard label="임시저장" value={stats.draft} />
          <StatCard label="수정 필요" value={stats.needsReview} tone="text-amber-700" />
          <StatCard label="연결 누락" value={stats.missingLinks} tone="text-rose-600" />
          <StatCard label="전용 이미지 제작" value={needsDedicatedImage.length} tone="text-violet-700" />
        </div>

        <div className={`${bm.card} mb-4 ${bm.cardPad}`}>
          <div className="grid gap-3 lg:grid-cols-[1fr,auto,auto,auto]">
            <input
              type="search"
              className={bm.input}
              placeholder="제목, 요약, 태그 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className={`${bm.input} min-w-[120px]`}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as AdminContentType | "all")}
            >
              {TYPE_FILTERS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              className={`${bm.input} min-w-[110px]`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AdminContentStatus | "all")}
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              className={`${bm.input} min-w-[140px]`}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">카테고리 전체</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr,400px]">
          <section className={`${bm.card} overflow-hidden`}>
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-black text-slate-900">콘텐츠 목록</p>
              <p className="text-[11px] font-semibold text-slate-400">{filtered.length}건</p>
            </div>

            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-black text-slate-700">
                  {items.length === 0
                    ? "아직 등록된 콘텐츠가 없습니다. 새 콘텐츠를 작성하면 이곳에서 관리할 수 있습니다."
                    : "조건에 맞는 콘텐츠가 없습니다. 검색어나 필터를 조정해 주세요."}
                </p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[720px] text-left text-[11px]">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                      <tr>
                        <th className="px-3 py-2">유형</th>
                        <th className="px-3 py-2">썸네일</th>
                        <th className="px-3 py-2">이미지</th>
                        <th className="px-3 py-2">제목</th>
                        <th className="px-3 py-2">상태</th>
                        <th className="px-3 py-2">카테고리</th>
                        <th className="px-3 py-2">차량</th>
                        <th className="px-3 py-2">배터리</th>
                        <th className="px-3 py-2">수정일</th>
                        <th className="px-3 py-2">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => (
                        <tr
                          key={item.id}
                          className={`border-t border-slate-100 ${selectedId === item.id ? "bg-blue-50/50" : "hover:bg-slate-50"}`}
                        >
                          <td className="px-3 py-2">
                            <TypeBadge type={item.type} />
                          </td>
                          <td className="px-3 py-2">
                            <ContentTypeThumbnail thumbnailType={item.thumbnailType} size="sm" />
                          </td>
                          <td className="px-3 py-2">
                            <ImageStatusBadge status={item.imageStatus} />
                            {item.imagePath ? (
                              <p className="mt-0.5 max-w-[120px] truncate text-[9px] font-semibold text-slate-400" title={item.imagePath}>
                                {item.imageFile ?? item.imagePath}
                              </p>
                            ) : item.imageNeeded ? (
                              <p className="mt-0.5 text-[9px] font-bold text-amber-600">준비 중</p>
                            ) : null}
                          </td>
                          <td className="max-w-[200px] px-3 py-2">
                            <p className="truncate font-black text-slate-900">{item.title}</p>
                            {isConnectionMissing(item) ? (
                              <span className="text-[10px] font-bold text-rose-500">연결 누락</span>
                            ) : null}
                          </td>
                          <td className="px-3 py-2">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-3 py-2 font-semibold text-slate-600">{item.category || "—"}</td>
                          <td className="max-w-[100px] truncate px-3 py-2 text-slate-500">
                            {joinList(item.relatedVehicleIds)}
                          </td>
                          <td className="max-w-[100px] truncate px-3 py-2 text-slate-500">
                            {joinList(item.relatedBatteryIds)}
                          </td>
                          <td className="px-3 py-2 font-semibold text-slate-500">{item.updatedAt}</td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1">
                              <button type="button" className={bm.btnGhost} onClick={() => selectItem(item)}>
                                보기
                              </button>
                              <button type="button" className={bm.btnGhost} onClick={() => selectItem(item)}>
                                수정
                              </button>
                              <button type="button" className={bm.btnGhost} onClick={() => duplicateItem(item)}>
                                복사
                              </button>
                              <button type="button" className={bm.btnGhost} onClick={() => hideItem(item.id)}>
                                숨김
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-slate-100 lg:hidden">
                  {filtered.map((item) => (
                    <div key={item.id} className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <TypeBadge type={item.type} />
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="mt-2 text-sm font-black text-slate-900">{item.title}</p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">{item.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        <button type="button" className={bm.btnGhost} onClick={() => selectItem(item)}>
                          수정
                        </button>
                        <button type="button" className={bm.btnGhost} onClick={() => duplicateItem(item)}>
                          복사
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <aside className="space-y-4">
            <section className={`${bm.card} ${bm.cardPad}`}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-black text-slate-900">작성 · 수정</p>
                <button type="button" className={bm.btnPrimary} onClick={createNew}>
                  새 콘텐츠
                </button>
              </div>

              {draft || selected ? (
                <div className="space-y-3">
                  <Field label="콘텐츠 유형">
                    <select
                      className={bm.input}
                      value={(draft ?? selected)!.type}
                      onChange={(e) => updateDraft({ type: e.target.value as AdminContentType })}
                    >
                      {TYPE_FILTERS.filter((f) => f.id !== "all").map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="제목">
                    <input
                      className={bm.input}
                      value={(draft ?? selected)!.title}
                      onChange={(e) => updateDraft({ title: e.target.value })}
                    />
                  </Field>
                  <Field label="요약">
                    <textarea
                      className={`${bm.input} min-h-[60px] py-2`}
                      value={(draft ?? selected)!.summary}
                      onChange={(e) => updateDraft({ summary: e.target.value })}
                    />
                  </Field>
                  <Field label="본문">
                    <textarea
                      className={`${bm.input} min-h-[100px] py-2`}
                      value={(draft ?? selected)!.body}
                      onChange={(e) => updateDraft({ body: e.target.value })}
                    />
                  </Field>
                  <Field label="카테고리">
                    <input
                      className={bm.input}
                      value={(draft ?? selected)!.category}
                      onChange={(e) => updateDraft({ category: e.target.value })}
                    />
                  </Field>
                  <Field label="태그 (쉼표 구분)">
                    <input
                      className={bm.input}
                      value={(draft ?? selected)!.tags.join(", ")}
                      onChange={(e) => updateDraft({ tags: parseCsv(e.target.value) })}
                    />
                  </Field>
                  <Field label="관련 차량 ID">
                    <input
                      className={bm.input}
                      value={(draft ?? selected)!.relatedVehicleIds.join(", ")}
                      onChange={(e) => updateDraft({ relatedVehicleIds: parseCsv(e.target.value) })}
                    />
                  </Field>
                  <Field label="관련 배터리 ID">
                    <input
                      className={bm.input}
                      value={(draft ?? selected)!.relatedBatteryIds.join(", ")}
                      onChange={(e) => updateDraft({ relatedBatteryIds: parseCsv(e.target.value) })}
                    />
                  </Field>
                  <Field label="관련 규격">
                    <input
                      className={bm.input}
                      value={(draft ?? selected)!.relatedSpecIds.join(", ")}
                      onChange={(e) => updateDraft({ relatedSpecIds: parseCsv(e.target.value) })}
                    />
                  </Field>
                  <Field label="관련 가이드 ID">
                    <input
                      className={bm.input}
                      value={(draft ?? selected)!.relatedGuideIds.join(", ")}
                      onChange={(e) => updateDraft({ relatedGuideIds: parseCsv(e.target.value) })}
                    />
                  </Field>
                  <Field label="관련 Q&A ID">
                    <input
                      className={bm.input}
                      value={(draft ?? selected)!.relatedQaIds.join(", ")}
                      onChange={(e) => updateDraft({ relatedQaIds: parseCsv(e.target.value) })}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="상태">
                      <select
                        className={bm.input}
                        value={(draft ?? selected)!.status}
                        onChange={(e) => updateDraft({ status: e.target.value as AdminContentStatus })}
                      >
                        {STATUS_FILTERS.filter((f) => f.id !== "all").map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="썸네일 유형">
                      <select
                        className={bm.input}
                        value={(draft ?? selected)!.thumbnailType}
                        onChange={(e) =>
                          updateDraft({ thumbnailType: e.target.value as AdminContentThumbnailType })
                        }
                      >
                        {Object.entries(ADMIN_CONTENT_THUMBNAIL_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="우선순위">
                      <input
                        type="number"
                        className={bm.input}
                        value={(draft ?? selected)!.priority}
                        onChange={(e) => updateDraft({ priority: Number(e.target.value) || 0 })}
                      />
                    </Field>
                    <Field label="원본 파일">
                      <input
                        className={bm.input}
                        value={(draft ?? selected)!.sourceFile}
                        onChange={(e) => updateDraft({ sourceFile: e.target.value })}
                        readOnly
                      />
                    </Field>
                  </div>
                  <Field label="내부 메모">
                    <textarea
                      className={`${bm.input} min-h-[56px] py-2`}
                      value={(draft ?? selected)!.memo}
                      onChange={(e) => updateDraft({ memo: e.target.value })}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="imagePath">
                      <input
                        className={bm.input}
                        value={(draft ?? selected)!.imagePath ?? ""}
                        onChange={(e) => updateDraft({ imagePath: e.target.value || undefined })}
                      />
                    </Field>
                    <Field label="imageFile">
                      <input
                        className={bm.input}
                        value={(draft ?? selected)!.imageFile ?? ""}
                        onChange={(e) => updateDraft({ imageFile: e.target.value || undefined })}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="imageStatus">
                      <select
                        className={bm.input}
                        value={(draft ?? selected)!.imageStatus ?? ""}
                        onChange={(e) =>
                          updateDraft({
                            imageStatus: (e.target.value || undefined) as ContentImageStatus | undefined,
                          })
                        }
                      >
                        <option value="">—</option>
                        {Object.entries(CONTENT_IMAGE_STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="imageNeeded">
                      <select
                        className={bm.input}
                        value={(draft ?? selected)!.imageNeeded ? "true" : "false"}
                        onChange={(e) => updateDraft({ imageNeeded: e.target.value === "true" })}
                      >
                        <option value="true">필요</option>
                        <option value="false">불필요</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="altText">
                    <input
                      className={bm.input}
                      value={(draft ?? selected)!.altText ?? ""}
                      onChange={(e) => updateDraft({ altText: e.target.value || undefined })}
                    />
                  </Field>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button type="button" className={bm.btnSecondary} onClick={() => applyDraftToList("draft")}>
                      임시저장
                    </button>
                    <button type="button" className={bm.btnPrimary} onClick={() => applyDraftToList("published")}>
                      게시 상태로 변경
                    </button>
                    <button type="button" className={bm.btnGhost} onClick={() => applyDraftToList("hidden")}>
                      숨김 처리
                    </button>
                    <button type="button" className={bm.btnGhost} onClick={() => setShowPreview((v) => !v)}>
                      {showPreview ? "미리보기 접기" : "수정 내용 미리보기"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-500">목록에서 콘텐츠를 선택하거나 새 콘텐츠를 작성하세요.</p>
              )}
            </section>

            {showPreview && previewItem ? (
              <section className={`${bm.card} ${bm.cardPad}`}>
                <p className="text-sm font-black text-slate-900">미리보기</p>
                {(previewItem.imagePath || previewItem.imageNeeded) && previewItem.type !== "qa" ? (
                  <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-slate-200">
                    <ContentCoverImage
                      contentId={previewItem.id}
                      objectFit="contain"
                      roundedClass="rounded-xl"
                      title={previewItem.title}
                      variant="card"
                    />
                  </div>
                ) : null}
                <div className="mt-3 flex items-start gap-3">
                  <ContentTypeThumbnail thumbnailType={previewItem.thumbnailType} title={previewItem.title} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-900">{previewItem.title || "제목 없음"}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                      {ADMIN_CONTENT_TYPE_LABELS[previewItem.type]} · {ADMIN_CONTENT_STATUS_LABELS[previewItem.status]}
                    </p>
                    {previewItem.imageStatus ? (
                      <p className="mt-1">
                        <ImageStatusBadge status={previewItem.imageStatus} />
                      </p>
                    ) : null}
                  </div>
                </div>
                {previewItem.summary ? (
                  <p className="mt-3 text-sm font-semibold text-slate-600">{previewItem.summary}</p>
                ) : null}
                {previewItem.body ? (
                  <p className="mt-2 line-clamp-6 text-[11px] leading-relaxed font-medium text-slate-500">
                    {previewItem.body}
                  </p>
                ) : null}
                {previewItem.tags.length ? (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {previewItem.tags.map((t) => (
                      <span key={t} className={`${bm.badge} ${bm.badgeGray}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-3 space-y-1 text-[10px] font-semibold text-slate-500">
                  <p>차량: {joinList(previewItem.relatedVehicleIds)}</p>
                  <p>배터리: {joinList(previewItem.relatedBatteryIds)}</p>
                  <p>규격: {joinList(previewItem.relatedSpecIds)}</p>
                  <p>imagePath: {previewItem.imagePath || "—"}</p>
                  <p>imageStatus: {previewItem.imageStatus ? CONTENT_IMAGE_STATUS_LABELS[previewItem.imageStatus] : "—"}</p>
                  <p>원본: {previewItem.sourceFile || "—"}</p>
                  {previewItem.publicPath ? (
                    <p className="text-[var(--bm-primary)]">경로: {previewItem.publicPath}</p>
                  ) : null}
                </div>
              </section>
            ) : null}
          </aside>
        </div>

        <p className="mt-6 text-center text-[10px] font-semibold text-slate-400">
          운영 세션 · 접근 키는 URL 파라미터로 유지됩니다. 변경 사항은 현재 브라우저 세션에만 반영됩니다.
        </p>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-black text-slate-500">{label}</span>
      {children}
    </label>
  );
}
