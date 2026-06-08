"use client";

import { useMemo, useState } from "react";
import type {
  OrphanVehicleImageFile,
  VehicleImageInventoryEntry,
  VehicleImageInventorySummary,
} from "@/lib/vehicle-image-inventory";
import type { VisualRiskStatus } from "@/lib/vehicle-image-analysis";

type Props = {
  entries: VehicleImageInventoryEntry[];
  orphans: OrphanVehicleImageFile[];
  summary: VehicleImageInventorySummary;
  restoreBuckets?: {
    immediateRestore: string[];
    manualRestore: string[];
    regeneration: string[];
  };
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

export function VehicleImageReviewClient({ entries, orphans, summary, restoreBuckets }: Props) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [filter, setFilter] = useState<FilterKey>("all");

  const brands = useMemo(() => [...new Set(entries.map((e) => e.brand))].sort(), [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (brand !== "all" && e.brand !== brand) return false;
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
  }, [entries, query, brand, filter]);

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard label="레지스트리" value={summary.registryAssetCount} />
        <StatCard label="손상(DAMAGED)" value={summary.visualRiskCounts.DAMAGED_FILE} />
        <StatCard label="밝은차체(BRIGHT)" value={summary.brightReviewCount} />
        <StatCard label="복구후보" value={summary.restoreCandidateCount} />
        <StatCard label="자동OK+육안검수" value={summary.manualBrightOkCount} />
        <StatCard label="생성" value={new Date(summary.generatedAt).toLocaleString("ko-KR")} small />
      </section>

      {restoreBuckets ? (
        <section className="grid gap-3 md:grid-cols-3">
          <BucketCard title="A. 즉시 복구 권장" slugs={restoreBuckets.immediateRestore} tone="violet" />
          <BucketCard title="B. 수동 확인 후 복구" slugs={restoreBuckets.manualRestore} tone="amber" />
          <BucketCard title="C. 재생성 후보" slugs={restoreBuckets.regeneration} tone="rose" />
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs font-bold text-slate-600">
            차량명 / slug 검색
            <input
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="tucson-jm, 티볼리, tivoli"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-slate-600">
            브랜드
            <select
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold"
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
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-slate-600">
            필터
            <select
              className="h-10 min-w-[10rem] rounded-lg border border-slate-200 px-3 text-sm font-semibold"
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterKey)}
            >
              <option value="all">전체</option>
              <option value="DAMAGED_FILE">DAMAGED</option>
              <option value="NEEDS_CHECK">NEEDS_CHECK</option>
              <option value="BRIGHT_REVIEW">밝은 차량 의심</option>
              <option value="RESTORE_CANDIDATE_REVIEW">복구 후보</option>
              <option value="restore_candidate">복구 후보 (플래그)</option>
              <option value="large_diff">현재/백업 차이 큼</option>
              <option value="manual_bright_ok">자동 OK + 육안 검수</option>
              <option value="has_generated">Replicate 생성 있음</option>
              <option value="has_flux_dev">flux-dev 있음</option>
              <option value="has_flux_pro">flux-1.1-pro 있음</option>
              <option value="bright">밝은 차체 힌트</option>
            </select>
          </label>
        </div>
        <p className="mt-3 text-xs font-medium text-slate-500">
          {filtered.length}건 / {entries.length}건 · <strong>현재</strong> / <strong>백업</strong> / <strong>flux-dev</strong> / <strong>flux-1.1-pro</strong>
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {filtered.map((entry) => (
          <ReviewCard key={entry.slug} entry={entry} />
        ))}
      </div>

      {orphans.length > 0 ? (
        <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <h2 className="text-sm font-black text-slate-800">미사용 디스크 파일 ({orphans.length})</h2>
          <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs font-semibold text-slate-600">
            {orphans.slice(0, 30).map((o) => (
              <li key={o.relativePath}>{o.relativePath}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, small }: { label: string; value: number | string; small?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 font-black text-slate-900 ${small ? "text-xs" : "text-2xl"}`}>{value}</p>
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
      <p className="mt-2 max-h-28 overflow-auto text-[11px] font-semibold leading-relaxed text-slate-600">
        {slugs.length ? slugs.join(", ") : "—"}
      </p>
    </div>
  );
}

function ReviewCard({ entry }: { entry: VehicleImageInventoryEntry }) {
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

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      <div className="border-b border-slate-200 px-3 py-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-900">{entry.displayName}</p>
            <p className="truncate text-[11px] font-semibold text-slate-500">
              {entry.slug} · {entry.brand}
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge label={VISUAL_LABEL[entry.visualRiskStatus]} className={VISUAL_CLASS[entry.visualRiskStatus]} />
            {entry.restoreCandidate ? (
              <Badge label="복구후보" className="bg-violet-100 text-violet-900 ring-violet-200" />
            ) : null}
            {entry.manualBrightOkReview ? (
              <Badge label="OK+육안" className="bg-orange-50 text-orange-900 ring-orange-200" />
            ) : null}
            {entry.generatedFluxDevExists ? (
              <Badge label="flux-dev" className="bg-sky-50 text-sky-900 ring-sky-200" />
            ) : null}
            {entry.generatedFlux11ProExists ? (
              <Badge label="flux-1.1-pro" className="bg-emerald-50 text-emerald-900 ring-emerald-200" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-3">
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

        <dl className="mt-3 grid gap-1 text-[10px] font-semibold text-slate-600 sm:grid-cols-2">
          <Metric label="legacy" value={entry.status} />
          <Metric label="visual" value={entry.visualRiskStatus} />
          <Metric label="smear" value={`${entry.graySmearScore.toFixed(3)} / ${entry.backupGraySmearScore?.toFixed(3) ?? "—"}`} />
          <Metric label="erosion" value={`${entry.whiteBodyErosionScore.toFixed(4)} / ${entry.backupWhiteBodyErosionScore?.toFixed(4) ?? "—"}`} />
          <Metric label="diff" value={entry.currentVsBackupDiff?.toFixed(4) ?? "—"} />
          <Metric label="edgeFlood" value={entry.edgeFloodRiskScore.toFixed(4)} />
          <Metric label="밝은차체" value={entry.lightBodyHint ? "Y" : "N"} />
          <Metric label="우선순위" value={entry.restorePriority} />
        </dl>
        <p className="mt-2 text-[10px] leading-snug text-slate-500">{entry.visualRiskReason}</p>
        <p className="mt-1 truncate text-[9px] text-slate-400" title={entry.primaryDiskPath ?? ""}>
          현재: {entry.primaryDiskPath ?? "—"}
        </p>
        <p className="truncate text-[9px] text-slate-400" title={entry.backupDiskPath ?? ""}>
          백업: {entry.backupDiskPath ?? "—"}
        </p>
        {entry.generatedFluxDevDiskPath ? (
          <p className="truncate text-[9px] text-slate-400" title={entry.generatedFluxDevDiskPath}>
            flux-dev: {entry.generatedFluxDevDiskPath}
            {entry.generatedFluxDevExists ? "" : " (없음)"}
          </p>
        ) : null}
        {entry.generatedFlux11ProDiskPath ? (
          <p className="truncate text-[9px] text-slate-400" title={entry.generatedFlux11ProDiskPath}>
            flux-1.1-pro: {entry.generatedFlux11ProDiskPath}
            {entry.generatedFlux11ProExists ? "" : " (없음)"}
          </p>
        ) : null}
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
          <div className="flex h-full min-h-[100px] items-center justify-center text-[10px] font-bold text-slate-400">
            없음
          </div>
        )}
      </div>
      <p className="vehicle-image-review-compare__label">{label}</p>
    </div>
  );
}

function Badge({ label, className }: { label: string; className: string }) {
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
