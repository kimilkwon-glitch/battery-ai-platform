"use client";

import { useMemo, useState } from "react";
import type { VehicleImageInventoryEntry } from "@/lib/vehicle-image-inventory";
import {
  TEST_REFERENCE_SLUGS,
  type VehicleReferenceCandidateEntry,
} from "@/lib/vehicle-reference-candidates-shared";

type Props = {
  referenceEntries: VehicleReferenceCandidateEntry[];
  inventoryBySlug: Map<string, VehicleImageInventoryEntry>;
};

export function VehicleReferenceReviewClient({ referenceEntries, inventoryBySlug }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return referenceEntries;
    return referenceEntries.filter(
      (e) =>
        e.slug.includes(q) ||
        e.vehicleNameKo.toLowerCase().includes(q) ||
        e.vehicleNameEn.toLowerCase().includes(q),
    );
  }, [referenceEntries, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="slug / 차량명 검색 (테스트 5대)"
          className="min-w-[220px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <span className="text-xs font-semibold text-slate-500">{filtered.length} / {TEST_REFERENCE_SLUGS.length}대</span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <strong>CURRENT</strong> · <strong>BACKUP</strong> · <strong>flux-dev</strong> · <strong>flux-1.1-pro</strong> ·{" "}
        <strong>REFERENCE URLs</strong> · <strong>REFERENCE_BASED</strong> · <strong>REFERENCE_BASED_KONTEXT</strong> ·{" "}
        <strong>REFERENCE_BASED_KONTEXT_NEXT3</strong>
      </div>

      {filtered.map((ref) => (
        <ReferenceReviewCard key={ref.slug} refEntry={ref} inv={inventoryBySlug.get(ref.slug)} />
      ))}
    </div>
  );
}

function ReferenceReviewCard({
  refEntry,
  inv,
}: {
  refEntry: VehicleReferenceCandidateEntry;
  inv?: VehicleImageInventoryEntry;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      <div className="border-b border-slate-200 px-3 py-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900">
              {refEntry.vehicleNameKo} ({refEntry.slug})
            </p>
            <p
              className="truncate text-[11px] font-semibold text-slate-500"
              title={
                refEntry.kontextNext3SelectedReferenceUrl ??
                refEntry.kontextSelectedReferenceUrl ??
                refEntry.selectedReferenceUrl ??
                ""
              }
            >
              kontext ref:{" "}
              {refEntry.kontextNext3SelectedReferenceUrl ??
                refEntry.kontextSelectedReferenceUrl ??
                refEntry.selectedReferenceUrl ??
                "—"}
            </p>
          </div>
          {refEntry.needsManualReview ? (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-900 ring-1 ring-amber-200">
              수동 검수
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-900 ring-1 ring-emerald-200">
              URL 확보
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        <div className="vehicle-reference-review-compare">
          <ComparePane label="CURRENT" src={inv?.primaryExists ? inv.imageUrl : null} alt={`${refEntry.vehicleNameKo} 현재`} />
          <ComparePane label="BACKUP" src={inv?.backupExists ? inv.backupImageUrl : null} alt={`${refEntry.vehicleNameKo} 백업`} />
          <ComparePane
            label="GENERATED_FLUX_DEV"
            src={inv?.generatedFluxDevExists ? inv.generatedFluxDevImageUrl : null}
            alt={`${refEntry.vehicleNameKo} flux-dev`}
          />
          <ComparePane
            label="GENERATED_FLUX_1_1_PRO"
            src={inv?.generatedFlux11ProExists ? inv.generatedFlux11ProImageUrl : null}
            alt={`${refEntry.vehicleNameKo} flux-1.1-pro`}
          />
          <ReferenceUrlsPane candidates={refEntry.candidateImages} selected={refEntry.selectedReferenceUrl} />
          <ComparePane
            label="REFERENCE_BASED"
            src={refEntry.generatedReferenceBasedImageUrl}
            alt={`${refEntry.vehicleNameKo} reference-based`}
          />
          <ComparePane
            label="REFERENCE_BASED_KONTEXT"
            src={refEntry.generatedReferenceBasedKontextImageUrl}
            alt={`${refEntry.vehicleNameKo} kontext`}
            note={refEntry.kontextGenerationAllowed ? undefined : "URL 접근 불가"}
          />
          <ComparePane
            label="REFERENCE_BASED_KONTEXT_NEXT3"
            src={refEntry.generatedReferenceBasedKontextNext3ImageUrl}
            alt={`${refEntry.vehicleNameKo} kontext next3`}
            note={
              refEntry.kontextNext3GenerationAllowed || refEntry.generatedReferenceBasedKontextNext3Exists
                ? undefined
                : "next3 미생성"
            }
          />
        </div>
        <p className="mt-2 text-[10px] text-slate-500">{refEntry.selectedReferenceReason}</p>
      </div>
    </article>
  );
}

function ReferenceUrlsPane({
  candidates,
  selected,
}: {
  candidates: VehicleReferenceCandidateEntry["candidateImages"];
  selected: string | null;
}) {
  return (
    <div className="vehicle-image-review-compare__pane">
      <div className="vehicle-image-review-frame vehicle-reference-candidates-frame">
        {candidates.length ? (
          <div className="vehicle-reference-url-list">
            {candidates.map((c, i) => (
              <a
                key={c.imageUrl}
                href={c.imageUrl}
                target="_blank"
                rel="noreferrer"
                className={`vehicle-reference-url-item${c.imageUrl === selected ? " vehicle-reference-url-item--selected" : ""}`}
                title={c.sourceTitle}
              >
                <span className="vehicle-reference-url-item__idx">{i + 1}</span>
                <span className="vehicle-reference-url-item__badge">{c.confidence}</span>
                <span className="vehicle-reference-url-item__title">{c.sourceTitle}</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex h-full min-h-[100px] items-center justify-center text-[10px] font-bold text-slate-400">
            URL 후보 없음
          </div>
        )}
      </div>
      <p className="vehicle-image-review-compare__label">REFERENCE URLs</p>
    </div>
  );
}

function ComparePane({
  label,
  src,
  alt,
  note,
}: {
  label: string;
  src: string | null;
  alt: string;
  note?: string;
}) {
  return (
    <div className="vehicle-image-review-compare__pane">
      <div className="vehicle-image-review-frame">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="vehicle-image-review-img" loading="lazy" />
        ) : (
          <div className="flex h-full min-h-[100px] flex-col items-center justify-center gap-1 text-center text-[10px] font-bold text-slate-400">
            <span>없음</span>
            {note ? <span className="font-semibold text-amber-700">{note}</span> : null}
          </div>
        )}
      </div>
      <p className="vehicle-image-review-compare__label">{label}</p>
    </div>
  );
}
