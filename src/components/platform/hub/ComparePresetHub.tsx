"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/common/SectionHeader";
import { HubBadge } from "@/components/platform/hub/HubBadge";
import { bm } from "@/lib/design-tokens";
import { COMPARE_PRESET_CARDS, type ComparePresetCard } from "@/lib/platform-hub-content";

function SubstituteBadge({ level }: { level: ComparePresetCard["substitute"] }) {
  const tone = level === "가능" ? "ok" : level === "주의" ? "warn" : "warn";
  const label = level === "가능" ? "대체 가능" : level === "주의" ? "조건부" : "단순 대체 불가";
  return <HubBadge label={label} tone={tone} />;
}

export function ComparePresetHub() {
  return (
    <section className={`${bm.sectionBlock} ${bm.sectionBlockPad}`} data-section="compare-preset-hub">
      <SectionHeader
        label="비교 센터"
        title="헷갈리는 규격 빠른 비교"
        description="단자 방향·용량·차종 주의가 한눈에 보이도록 정리했습니다."
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COMPARE_PRESET_CARDS.map((card) => (
          <Link
            className={`${bm.cardBatteryProduct} flex flex-col p-4`}
            href={card.href}
            key={card.label}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="spec-code text-sm font-bold text-[var(--bm-text)]" data-spec-code>
                {card.label}
              </p>
              <SubstituteBadge level={card.substitute} />
            </div>
            <p className="mt-2 text-xs font-bold text-slate-800">{card.headline}</p>
            <p className="mt-1 text-[11px] font-medium text-slate-600">{card.diff}</p>
            <p className="mt-2 text-[10px] font-semibold text-[var(--bm-primary)]">{card.terminalNote}</p>
            <span className="mt-auto pt-3 text-[10px] font-bold text-[var(--bm-muted)]">비교 리포트 →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
