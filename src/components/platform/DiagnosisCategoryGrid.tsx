"use client";

import { useState } from "react";
import { ContentCoverImage } from "@/components/content/ContentCoverImage";
import type { DiagnosisCategory } from "@/lib/diagnosis-data";
import { getContentImageForSymptomSlug } from "@/lib/content/getContentImage";

const FEATURED_SLUGS = [
  "slow-engine-start",
  "blackbox-drain",
  "winter-discharge",
  "agm-replacement",
  "ev12v-discharge",
  "ibs-bms-error",
] as const;

export function DiagnosisCategoryGrid({ categories }: { categories: DiagnosisCategory[] }) {
  const featured = FEATURED_SLUGS.map((slug) => categories.find((c) => c.slug === slug)).filter(
    Boolean,
  ) as DiagnosisCategory[];
  const rest = categories.filter((c) => !FEATURED_SLUGS.includes(c.slug as (typeof FEATURED_SLUGS)[number]));
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? [...featured, ...rest] : featured;

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => {
          const contentMeta = getContentImageForSymptomSlug(item.slug);
          const contentId = contentMeta?.contentId ?? `symptom-${item.slug}`;

          return (
            <a
              className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-sm"
              href={`/diagnosis/${item.slug}`}
              key={item.slug}
            >
              <ContentCoverImage
                contentId={contentId}
                objectFit="cover"
                roundedClass="rounded-none rounded-t-xl"
                title={item.title}
                variant="card"
              />
              <div className="p-3.5">
                <div className={`mb-2 h-1 rounded bg-gradient-to-r ${item.tone}`} />
                <h2 className="text-sm font-black text-slate-900">{item.title}</h2>
                <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{item.subtitle}</p>
                <span className="mt-2 inline-block text-[11px] font-black text-blue-600">상세 보기 →</span>
              </div>
            </a>
          );
        })}
      </div>
      {rest.length > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-xs font-black text-slate-600 hover:bg-white"
        >
          {expanded ? "접기" : `전체 증상 보기 (${rest.length}개 더)`}
        </button>
      ) : null}
    </div>
  );
}
