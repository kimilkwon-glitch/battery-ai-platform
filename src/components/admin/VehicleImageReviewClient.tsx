"use client";

import { AdminCustomerPreviewLink } from "@/components/admin/AdminCustomerPreviewLink";
import { AdminStatusTabs } from "@/components/admin/AdminStatusTabs";
import { Badge } from "@/components/ui/badge";
import { VEHICLE_REVIEW_STATUS_BADGE } from "@/lib/admin/admin-status-tokens";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  OrphanVehicleImageFile,
  VehicleImageInventoryEntry,
  VehicleImageInventorySummary,
} from "@/lib/vehicle-image-inventory";
import type { VisualRiskStatus } from "@/lib/vehicle-image-analysis";
import {
  VEHICLE_IMAGE_REVIEW_STATUS_LABELS,
  type VehicleImageReviewRecord,
  type VehicleImageReviewStatus,
} from "@/lib/vehicle-image-review-shared";
type Props = {
  entries: VehicleImageInventoryEntry[];
  orphans: OrphanVehicleImageFile[];
  summary: VehicleImageInventorySummary;
  restoreBuckets?: {
    immediateRestore: string[];
    manualRestore: string[];
    regeneration: string[];
  };
  initialReviewsBySlug?: Record<string, VehicleImageReviewRecord>;
};

const VISUAL_LABEL: Record<VisualRiskStatus, string> = {
  OK: "자동 OK",
  DAMAGED_FILE: "손상",
  NEEDS_CHECK: "확인 필요",
  BRIGHT_REVIEW: "밝은 차체 검수",
  RESTORE_CANDIDATE_REVIEW: "복구 후보",
  MISSING_FILE: "파일 없음",
};

const VISUAL_CLASS: Record<VisualRiskStatus, string> = {
  OK: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  DAMAGED_FILE: "bg-rose-50 text-rose-900 ring-rose-200",
  NEEDS_CHECK: "bg-yellow-50 text-yellow-900 ring-yellow-200",
  BRIGHT_REVIEW: "bg-sky-50 text-sky-900 ring-sky-200",
  RESTORE_CANDIDATE_REVIEW: "bg-violet-50 text-violet-900 ring-violet-200",
  MISSING_FILE: "bg-slate-100 text-slate-700 ring-slate-200",
};

type FilterKey =
  | "all"
  | "DAMAGED_FILE"
  | "NEEDS_CHECK"
  | "BRIGHT_REVIEW"
  | "RESTORE_CANDIDATE_REVIEW"
  | "bright"
  | "large_diff"
  | "restore_candidate"
  | "manual_bright_ok"
  | "has_generated"
  | "has_flux_dev"
  | "has_flux_pro";

type ReviewFilterKey = VehicleImageReviewStatus | "all" | "no_image";

export function VehicleImageReviewClient({
  entries,
  orphans,
  restoreBuckets,
  initialReviewsBySlug = {},
}: Props) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [reviewFilter, setReviewFilter] = useState<ReviewFilterKey>("all");
  const [reviewsBySlug, setReviewsBySlug] = useState(initialReviewsBySlug);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);

  const patchReview = useCallback(
    async (slug: string, patch: Partial<VehicleImageReviewRecord>) => {
      setSavingSlug(slug);
      const prev = reviewsBySlug[slug];
      const res = await fetch(`/api/admin/vehicle-image-reviews/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: patch.status ?? prev?.status ?? "reviewing",
          adminMemo: patch.adminMemo ?? prev?.adminMemo ?? "",
          selectedReferenceUrl: patch.selectedReferenceUrl,
          candidateImageUrl: patch.candidateImageUrl,
        }),
      });
      const data = await res.json();
      setSavingSlug(null);
      if (res.ok && data.ok) {
        setReviewsBySlug((m) => ({ ...m, [slug]: data.item }));
      }
    },
    [reviewsBySlug],
  );

  const brands = useMemo(() => [...new Set(entries.map((e) => e.brand))].sort(), [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (brand !== "all" && e.brand !== brand) return false;
      const reviewStatus = reviewsBySlug[e.slug]?.status ?? "pending";
      if (reviewFilter === "no_image") {
        if (e.primaryExists) return false;
      } else if (reviewFilter !== "all" && reviewStatus !== reviewFilter) {
        return false;
      }
      switch (filter) {
        case "DAMAGED_FILE":
        case "NEEDS_CHECK":
        case "BRIGHT_REVIEW":
        case "RESTORE_CANDIDATE_REVIEW":
          if (e.visualRiskStatus !== filter) return false;
          break;
        case "bright":
          if (!e.lightBodyHint) return false;
          break;
        case "large_diff":
          if (!e.largeDiffFromBackup) return false;
          break;
        case "restore_candidate":
          if (!e.restoreCandidate) return false;
          break;
        case "manual_bright_ok":
          if (!e.manualBrightOkReview) return false;
          break;
        case "has_generated":
          if (!e.generatedFluxDevExists && !e.generatedFlux11ProExists) return false;
          break;
        case "has_flux_dev":
          if (!e.generatedFluxDevExists) return false;
          break;
        case "has_flux_pro":
          if (!e.generatedFlux11ProExists) return false;
          break;
        default:
          break;
      }
      if (!q) return true;
      return (
        e.slug.toLowerCase().includes(q) ||
        e.displayName.toLowerCase().includes(q) ||
        e.imageFile.toLowerCase().includes(q) ||
        e.modelGroup.toLowerCase().includes(q)
      );
    });
  }, [entries, query, brand, filter, reviewFilter, reviewsBySlug]);

  const reviewTabs = useMemo(() => {
    const counts: Record<string, number> = { all: entries.length };
    for (const s of Object.keys(VEHICLE_IMAGE_REVIEW_STATUS_LABELS) as VehicleImageReviewStatus[]) {
      counts[s] = entries.filter((e) => (reviewsBySlug[e.slug]?.status ?? "pending") === s).length;
    }
    counts.no_image = entries.filter((e) => !e.primaryExists).length;
    return [
      { id: "all", label: "전체", count: counts.all },
      { id: "pending", label: "대기", count: counts.pending, tone: counts.pending > 0 ? ("warning" as const) : ("default" as const) },
      { id: "reviewing", label: "검수중", count: counts.reviewing },
      { id: "approved", label: "승인", count: counts.approved, tone: "info" as const },
      { id: "on_hold", label: "보류", count: counts.on_hold },
      { id: "regeneration_needed", label: "재생성 필요", count: counts.regeneration_needed, tone: "danger" as const },
      { id: "no_image", label: "이미지 없음", count: counts.no_image, tone: "danger" as const },
    ];
  }, [entries, reviewsBySlug]);

  return (
    <div className="admin-vehicle-image-review admin-workspace space-y-3">
      {restoreBuckets ? (
        <section className="grid gap-3 md:grid-cols-3">
          <BucketCard title="A. 즉시 복구 권장" slugs={restoreBuckets.immediateRestore} tone="violet" />
          <BucketCard title="B. 수동 확인 후 복구" slugs={restoreBuckets.manualRestore} tone="amber" />
          <BucketCard title="C. 재생성 후보" slugs={restoreBuckets.regeneration} tone="rose" />
        </section>
      ) : null}

      <AdminStatusTabs
        tabs={reviewTabs}
        activeId={reviewFilter}
        onChange={(id) => setReviewFilter(id as ReviewFilterKey)}
      />

      <div className="admin-filter-bar">
        <div className="admin-filter-bar__fields">
          <div className="admin-filter-bar__field admin-filter-bar__field--search">
            <label className="admin-filter-bar__label">차량명 / slug 검색</label>
            <input
              className="admin-filter-bar__input w-full rounded-lg border border-slate-200 px-3"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="tucson-jm, 티볼리, tivoli"
            />
          </div>
          <div className="admin-filter-bar__field">
            <label className="admin-filter-bar__label">브랜드</label>
            <select
              className="admin-filter-bar__input w-full rounded-lg border border-slate-200 px-3"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="all">전체</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-filter-bar__field">
            <label className="admin-filter-bar__label">위험 필터</label>
            <select
              className="admin-filter-bar__input w-full rounded-lg border border-slate-200 px-3"
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterKey)}
            >
              <option value="all">전체</option>
              <option value="DAMAGED_FILE">손상 파일</option>
              <option value="NEEDS_CHECK">확인 필요</option>
              <option value="BRIGHT_REVIEW">밝은 차량 의심</option>
              <option value="RESTORE_CANDIDATE_REVIEW">복구 후보</option>
              <option value="large_diff">현재/백업 차이 큼</option>
              <option value="has_generated">생성 이미지 있음</option>
            </select>
          </div>
        </div>
        <div className="admin-filter-bar__actions">
          <p className="admin-filter-bar__count">
            {filtered.length} / {entries.length}건
          </p>
          {(query || brand !== "all" || filter !== "all" || reviewFilter !== "all") ? (
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--md"
              onClick={() => {
                setQuery("");
                setBrand("all");
                setFilter("all");
                setReviewFilter("all");
              }}
            >
              초기화
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
        {filtered.map((entry) => (
          <ReviewCard
            key={entry.slug}
            entry={entry}
            review={reviewsBySlug[entry.slug]}
            saving={savingSlug === entry.slug}
            onApprove={() => void patchReview(entry.slug, { status: "approved" })}
            onHold={() => void patchReview(entry.slug, { status: "on_hold" })}
            onRegenerate={() => void patchReview(entry.slug, { status: "regeneration_needed" })}
            onMemoSave={(memo) => void patchReview(entry.slug, { adminMemo: memo, status: reviewsBySlug[entry.slug]?.status ?? "reviewing" })}
          />
        ))}
      </div>

      {orphans.length > 0 ? (
        <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <h2 className="admin-panel__title">미사용 디스크 파일 ({orphans.length})</h2>
          <ul className="admin-mobile-card__lines mt-2 max-h-48 overflow-auto">
            {orphans.slice(0, 30).map((o) => (
              <li key={o.relativePath}>{o.relativePath}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function BucketCard({
  title,
  slugs,
  tone,
}: {
  title: string;
  slugs: string[];
  tone: "violet" | "amber" | "rose";
}) {
  const ring =
    tone === "violet" ? "ring-violet-200" : tone === "amber" ? "ring-amber-200" : "ring-rose-200";
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ${ring}`}>
      <p className="text-sm font-black text-slate-900">
        {title} <span className="text-slate-500">({slugs.length})</span>
      </p>
      <p className="admin-cell-muted mt-2 max-h-28 overflow-auto leading-relaxed">
        {slugs.length ? slugs.join(", ") : "—"}
      </p>
    </div>
  );
}

function ReviewCard({
  entry,
  review,
  saving,
  onApprove,
  onHold,
  onRegenerate,
  onMemoSave,
}: {
  entry: VehicleImageInventoryEntry;
  review?: VehicleImageReviewRecord;
  saving?: boolean;
  onApprove: () => void;
  onHold: () => void;
  onRegenerate: () => void;
  onMemoSave: (memo: string) => void;
}) {
  const [memo, setMemo] = useState(review?.adminMemo ?? "");
  const reviewStatus = review?.status ?? "pending";

  useEffect(() => {
    setMemo(review?.adminMemo ?? "");
  }, [review?.adminMemo, entry.slug]);
  const compareCols =
    2 +
    (entry.generatedFluxDevExists ? 1 : 0) +
    (entry.generatedFlux11ProExists ? 1 : 0);
  const compareClass =
    compareCols >= 4
      ? " vehicle-image-review-compare--quad"
      : compareCols >= 3
        ? " vehicle-image-review-compare--triple"
        : "";

  const reviewTone = VEHICLE_REVIEW_STATUS_BADGE[reviewStatus];

  return (
    <article className="admin-mobile-card vehicle-image-review-card overflow-hidden">
      <div className="vehicle-image-review-card__head border-b border-slate-200 px-3 py-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="admin-cell-primary admin-cell-primary--title truncate">{entry.displayName}</p>
            <p className="admin-cell-muted truncate">
              {entry.brand} · {entry.slug}
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant={reviewTone}>
              {VEHICLE_IMAGE_REVIEW_STATUS_LABELS[reviewStatus]}
            </Badge>
            <RiskBadge label={VISUAL_LABEL[entry.visualRiskStatus]} className={VISUAL_CLASS[entry.visualRiskStatus]} />
            {entry.restoreCandidate ? (
              <RiskBadge label="복구후보" className="bg-violet-100 text-violet-900 ring-violet-200" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="vehicle-image-review-card__body p-3">
        <div className={`vehicle-image-review-compare${compareClass}`}>
          <ComparePane
            label="CURRENT"
            src={entry.primaryExists ? entry.imageUrl : null}
            alt={`${entry.displayName} 현재`}
          />
          <ComparePane
            label="BACKUP"
            src={entry.backupExists ? entry.backupImageUrl : null}
            alt={`${entry.displayName} 백업`}
          />
          <ComparePane
            label="GENERATED_FLUX_DEV"
            src={entry.generatedFluxDevExists ? entry.generatedFluxDevImageUrl : null}
            alt={`${entry.displayName} flux-dev`}
          />
          <ComparePane
            label="GENERATED_FLUX_1_1_PRO"
            src={entry.generatedFlux11ProExists ? entry.generatedFlux11ProImageUrl : null}
            alt={`${entry.displayName} flux-1.1-pro`}
          />
        </div>

        <ul className="admin-mobile-card__lines mt-2">
          <li>
            <span className="admin-cell-muted">위험</span>{" "}
            <span className="admin-cell-primary">{VISUAL_LABEL[entry.visualRiskStatus]}</span>
          </li>
          <li>
            <span className="admin-cell-muted">우선순위</span>{" "}
            <span className="admin-cell-primary">{entry.restorePriority}</span>
          </li>
          <li className="line-clamp-2">{entry.visualRiskReason}</li>
        </ul>
        <details className="vehicle-image-review-card__details mt-2">
          <summary className="admin-cell-muted cursor-pointer font-bold">상세 지표</summary>
          <dl className="mt-2 grid gap-1 font-semibold sm:grid-cols-2">
            <Metric label="legacy" value={entry.status} />
            <Metric label="visual" value={entry.visualRiskStatus} />
            <Metric label="smear" value={`${entry.graySmearScore.toFixed(3)}`} />
            <Metric label="diff" value={entry.currentVsBackupDiff?.toFixed(4) ?? "—"} />
            <Metric label="밝은차체" value={entry.lightBodyHint ? "Y" : "N"} />
          </dl>
        </details>

        <div className="admin-mobile-card__actions mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="admin-btn admin-btn--primary admin-btn--md"
            disabled={saving}
            onClick={onApprove}
          >
            승인
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--secondary admin-btn--md"
            disabled={saving}
            onClick={onHold}
          >
            보류
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--danger admin-btn--md"
            disabled={saving}
            onClick={onRegenerate}
          >
            재생성 필요
          </button>
          <AdminCustomerPreviewLink href={`/vehicles/${entry.slug}`} />
        </div>
        <label className="mt-2 block text-[10px] font-bold text-slate-500">
          관리자 메모
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-xs font-normal"
          />
        </label>
        <button
          type="button"
          className="admin-btn admin-btn--secondary admin-btn--sm mt-1"
          disabled={saving}
          onClick={() => onMemoSave(memo)}
        >
          메모 저장
        </button>
      </div>
    </article>
  );
}

function ComparePane({ label, src, alt }: { label: string; src: string | null; alt: string }) {
  return (
    <div className="vehicle-image-review-compare__pane">
      <div className="vehicle-image-review-frame">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="vehicle-image-review-img" loading="lazy" />
        ) : (
          <div className="flex h-full min-h-[180px] items-center justify-center text-sm font-bold text-slate-400">
            없음
          </div>
        )}
      </div>
      <p className="vehicle-image-review-compare__label">{label}</p>
    </div>
  );
}

function RiskBadge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ring-1 ${className}`}>{label}</span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-slate-400">{label}</dt>
      <dd className="truncate text-right">{value}</dd>
    </div>
  );
}
