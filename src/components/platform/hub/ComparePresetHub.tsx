"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/common/SectionHeader";
import { IconBadge } from "@/components/common/IconBadge";
import { CardHorizontalLayout } from "@/components/cards/CardHorizontalLayout";
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
        iconKey="compare"
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {COMPARE_PRESET_CARDS.map((card) => (
          <CardHorizontalLayout
            as={Link}
            className={bm.cardBatteryProduct}
            href={card.href}
            key={card.label}
            imagePanel={
              <div className="flex h-full min-h-[100px] w-full items-center justify-center md:min-h-[120px]">
                <IconBadge iconKey="compare" large />
              </div>
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="spec-code text-sm font-bold text-[var(--bm-text)]" data-spec-code>
                {card.label}
              </p>
              <SubstituteBadge level={card.substitute} />
            </div>
            <p className="text-xs font-bold text-slate-800">{card.headline}</p>
            <p className="line-clamp-2 text-[11px] font-medium text-slate-600">{card.diff}</p>
            <p className="text-[10px] font-semibold text-blue-800">{card.terminalNote}</p>
            <span className="text-[10px] font-bold text-slate-500">비교 리포트 →</span>
          </CardHorizontalLayout>
        ))}
      </div>
    </section>
  );
}
