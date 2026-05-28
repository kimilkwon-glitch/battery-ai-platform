"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/common/SectionHeader";
import { IconBadge } from "@/components/common/IconBadge";
import { CardHorizontalLayout } from "@/components/cards/CardHorizontalLayout";
import {
  CardInfoActions,
  CardInfoCtaLink,
  CardInfoDesc,
  CardInfoMeta,
  CardInfoStack,
  CardInfoTitleRow,
} from "@/components/cards/CardHorizontalInfo";
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
        description="비슷해 보여도 단자 방향·타입·장착 차종이 다를 수 있습니다."
        iconKey="compare"
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {COMPARE_PRESET_CARDS.map((card) => (
          <CardHorizontalLayout
            as={Link}
            className={`${bm.cardBatteryProduct} group`}
            href={card.href}
            key={card.label}
            imagePanel={
              <div className="flex h-full min-h-[100px] w-full items-center justify-center md:min-h-[120px]">
                <IconBadge iconKey="compare" large />
              </div>
            }
          >
            <CardInfoStack>
              <CardInfoTitleRow
                iconKey="compare"
                title={card.label}
                titleClassName="spec-code text-[var(--bm-text)]"
                trailing={<SubstituteBadge level={card.substitute} />}
              />
              <p className="text-xs font-bold text-slate-800">{card.headline}</p>
              <CardInfoDesc>{card.diff}</CardInfoDesc>
              <CardInfoMeta className="font-semibold text-blue-800">{card.terminalNote}</CardInfoMeta>
            </CardInfoStack>
            <CardInfoActions>
              <CardInfoCtaLink>비교 리포트 →</CardInfoCtaLink>
            </CardInfoActions>
          </CardHorizontalLayout>
        ))}
      </div>
    </section>
  );
}
